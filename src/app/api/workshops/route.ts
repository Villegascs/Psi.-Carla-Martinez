import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Parse quantity and participants
    const quantity = parseInt(formData.get("quantity") as string) || 1;
    const participantsRaw = formData.get("participants") as string;
    let participants: any[] = [];
    try {
      if (participantsRaw) participants = JSON.parse(participantsRaw);
    } catch(e) {}

    const workshopName = formData.get("workshopName") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const paymentDataRaw = formData.get("paymentData") as string;
    
    let paymentData: any = {};
    try {
      if (paymentDataRaw) paymentData = JSON.parse(paymentDataRaw);
    } catch(e) {}

    const paymentProof = formData.get("paymentProof") as File | null;

    if (paymentMethod !== "efectivo" && !paymentProof) {
      return NextResponse.json({ success: false, error: "Falta el comprobante de pago." }, { status: 400 });
    }

    // 1. Save to Firebase FIRST (to ensure we don't lose the data if Telegram times out)
    const orderRef = adminDb.collection('tickets').doc();
    const orderDataObj = {
      id: orderRef.id,
      quantity,
      participants,
      workshopName,
      paymentMethod,
      paymentDetails: paymentData,
      status: "PENDING_APPROVAL",
      used: false, // legacy single-use, now we'll track inside participants array but keep for backwards compatibility if needed
      createdAt: new Date().toISOString()
    };

    // Initialize all participants as not used
    orderDataObj.participants = orderDataObj.participants.map((p: any) => ({ ...p, used: false }));

    await orderRef.set(orderDataObj);

    // 2. Prepare Telegram Details
    let paymentDetailsText = "";
    if (paymentMethod === "pago_movil") {
      paymentDetailsText = `*Método:* Pago Móvil\n*Banco:* ${paymentData.bank}\n*Cédula:* ${paymentData.paymentId}\n*Teléfono:* ${paymentData.paymentPhone}`;
    } else if (paymentMethod === "binance") {
      paymentDetailsText = `*Método:* Binance\n*Usuario:* ${paymentData.binanceUser}\n*Referencia:* ${paymentData.reference}`;
    } else if (paymentMethod === "zelle") {
      paymentDetailsText = `*Método:* Zelle\n*Referencia:* ${paymentData.reference}`;
    } else if (paymentMethod === "efectivo") {
      paymentDetailsText = `*Método:* Efectivo (Presencial)\n*Billetes:* ${paymentData.billDenomination}`;
    }

    let participantsText = participants.map((p, i) => `👤 *Participante ${i+1}:* ${p.firstName} ${p.lastName} (C.I: ${p.idNumber})`).join("\n");
    
    const tgCaption = `🎟️ *Nueva Inscripción a Taller (${quantity} Cupos)*\n\n*Taller:* ${workshopName}\n\n${participantsText}\n\n${paymentDetailsText}\n\nRevisa el panel de admin para aprobar esta inscripción y enviar los QRs.`;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 3. Send to Telegram with Timeout (Vercel has 10s max execution for hobby)
    if (botToken && chatId) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout for Telegram

        if (paymentMethod !== "efectivo" && paymentProof) {
          const tgFormData = new FormData();
          tgFormData.append("chat_id", chatId);
          tgFormData.append("photo", paymentProof, paymentProof.name || "capture.jpg");
          tgFormData.append("caption", tgCaption);
          tgFormData.append("parse_mode", "Markdown");

          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: "POST",
            body: tgFormData,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          const tgData = await tgRes.json();
          if (!tgData.ok && tgData.error_code === 400) {
             // Fallback for unsupported photo format
             const fallbackFormData = new FormData();
             fallbackFormData.append("chat_id", chatId);
             fallbackFormData.append("text", `${tgCaption}\n\n⚠️ *(El capture tenía un formato no soportado, pero está registrado en Firebase)*`);
             fallbackFormData.append("parse_mode", "Markdown");
             await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: "POST", body: fallbackFormData });
          }
        } else {
          // Cash payment - just send text via JSON (much safer in serverless)
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: tgCaption,
              parse_mode: "Markdown"
            }),
            signal: controller.signal 
          });
          clearTimeout(timeoutId);
        }
      } catch (tgError) {
        console.error("Telegram Request failed or timed out:", tgError);
        // We do NOT fail the request because Firebase already saved it!
      }
    }

    return NextResponse.json({ success: true, orderId: orderRef.id });
  } catch (error: any) {
    console.error("Workshop Registration Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno del servidor al procesar la inscripción." }, { status: 500 });
  }
}
