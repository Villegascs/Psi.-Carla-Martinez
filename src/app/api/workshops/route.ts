import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const idNumber = formData.get("idNumber") as string;
    const workshopName = formData.get("workshopName") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const paymentDataRaw = formData.get("paymentData") as string;
    
    let paymentData: any = {};
    try {
      if (paymentDataRaw) {
        paymentData = JSON.parse(paymentDataRaw);
      }
    } catch(e) {}

    const paymentProof = formData.get("paymentProof") as File | null;

    if (paymentMethod !== "efectivo" && !paymentProof) {
      return NextResponse.json({ success: false, error: "Falta el comprobante de pago." }, { status: 400 });
    }

    // Prepare Telegram Details
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

    const tgCaption = `🎟️ *Nueva Inscripción a Taller*\n\n*Participante:* ${firstName} ${lastName}\n*Cédula:* ${idNumber}\n*Taller:* ${workshopName}\n\n${paymentDetailsText}\n\nRevisa el panel de admin para aprobar esta inscripción y enviarle el QR.`;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Send to Telegram
    if (botToken && chatId) {
      try {
        if (paymentMethod !== "efectivo" && paymentProof) {
          const tgFormData = new FormData();
          tgFormData.append("chat_id", chatId);
          tgFormData.append("photo", paymentProof, paymentProof.name || "capture.jpg");
          tgFormData.append("caption", tgCaption);
          tgFormData.append("parse_mode", "Markdown");

          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: "POST",
            body: tgFormData
          });
          
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
          // Cash payment - just send text
          const tgFormData = new FormData();
          tgFormData.append("chat_id", chatId);
          tgFormData.append("text", tgCaption);
          tgFormData.append("parse_mode", "Markdown");
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: "POST", body: tgFormData });
        }
      } catch (tgError) {
        console.error("Failed to fetch Telegram API:", tgError);
      }
    }

    // Save to Firebase Admin
    const ticketRef = adminDb.collection('tickets').doc();
    const ticketDataObj = {
      id: ticketRef.id,
      firstName,
      lastName,
      idNumber,
      workshopName,
      paymentMethod,
      paymentDetails: paymentData,
      status: "PENDING_APPROVAL",
      used: false,
      createdAt: new Date().toISOString()
    };

    await ticketRef.set(ticketDataObj);

    return NextResponse.json({ success: true, ticketId: ticketRef.id });
  } catch (error: any) {
    console.error("Workshop Registration Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno del servidor al procesar la inscripción." }, { status: 500 });
  }
}
