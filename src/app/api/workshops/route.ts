import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection('workshops').get();
      
    let workshops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    
    // Filtrar y ordenar en memoria para evitar requerir índices compuestos en Firebase
    workshops = workshops
      .filter(w => w.status === 'Publicado')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({ success: true, workshops });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let debugStep = "INIT";
  try {
    debugStep = "PARSING_FORMDATA";
    const formData = await request.formData();
    
    debugStep = "EXTRACTING_FIELDS";
    const quantity = parseInt(formData.get("quantity") as string) || 1;
    const participantsRaw = formData.get("participants") as string;
    let participants: any[] = [];
    try {
      if (participantsRaw) participants = JSON.parse(participantsRaw);
    } catch(e) {}

    const workshopName = formData.get("workshopName") as string;
    const buyerEmail = formData.get("buyerEmail") as string || "";
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

    debugStep = "INIT_FIREBASE_DB";
    const adminDb = getAdminDb();
    
    debugStep = "CREATING_DOC_REF";
    const orderRef = adminDb.collection('tickets').doc();
    
    debugStep = "PREPARING_DATA";
    const orderDataObj = {
      id: orderRef.id,
      quantity,
      participants,
      workshopName,
      buyerEmail,
      paymentMethod,
      paymentDetails: paymentData,
      status: "PENDING_APPROVAL",
      used: false,
      createdAt: new Date().toISOString()
    };
    orderDataObj.participants = orderDataObj.participants.map((p: any) => ({ ...p, used: false }));

    debugStep = "SAVING_TO_FIREBASE";
    await orderRef.set(orderDataObj);

    debugStep = "PREPARING_TELEGRAM";
    let paymentDetailsText = "";
    if (paymentMethod === "pago_movil") {
      paymentDetailsText = `*Método:* Pago Móvil\n*Banco:* ${paymentData.bank}\n*Cédula:* ${paymentData.paymentIdType}-${paymentData.paymentId}\n*Teléfono:* ${paymentData.paymentPhone}`;
    } else if (paymentMethod === "binance") {
      paymentDetailsText = `*Método:* Binance\n*Usuario:* ${paymentData.binanceUser}\n*Referencia:* ${paymentData.reference}`;
    } else if (paymentMethod === "zelle") {
      paymentDetailsText = `*Método:* Zelle\n*Referencia:* ${paymentData.reference}`;
    } else if (paymentMethod === "efectivo") {
      paymentDetailsText = `*Método:* Efectivo (Presencial)\n*Billetes:* ${paymentData.billDenomination || 'No especificado'}`;
    }

    let participantsText = participants.map((p, i) => `👤 *Participante ${i+1}:* ${p.firstName} ${p.lastName} (C.I: ${p.idType}-${p.idNumber})`).join("\n");
    const tgCaption = `🎟️ *Nueva Inscripción a Taller (${quantity} Cupos)*\n\n*Taller:* ${workshopName}\n*Correo:* ${buyerEmail}\n\n${participantsText}\n\n${paymentDetailsText}\n\nRevisa el panel de admin o usa los botones para aprobar esta inscripción y enviar los QRs.`;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      debugStep = "SENDING_TELEGRAM";
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        
        const replyMarkup = JSON.stringify({
          inline_keyboard: [
            [
              { text: "✅ Aprobar y Enviar QRs", callback_data: `approve_${orderRef.id}` },
              { text: "❌ Rechazar", callback_data: `reject_${orderRef.id}` }
            ]
          ]
        });

        if (paymentMethod !== "efectivo" && paymentProof) {
          const tgFormData = new FormData();
          tgFormData.append("chat_id", chatId);
          tgFormData.append("photo", paymentProof, paymentProof.name || "capture.jpg");
          tgFormData.append("caption", tgCaption);
          tgFormData.append("parse_mode", "Markdown");
          tgFormData.append("reply_markup", replyMarkup);

          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: "POST",
            body: tgFormData,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          const tgData = await tgRes.json();
          if (!tgData.ok && tgData.error_code === 400) {
             const fallbackFormData = new FormData();
             fallbackFormData.append("chat_id", chatId);
             fallbackFormData.append("text", `${tgCaption}\n\n⚠️ *(El capture tenía un formato no soportado, pero está registrado en Firebase)*`);
             fallbackFormData.append("parse_mode", "Markdown");
             fallbackFormData.append("reply_markup", replyMarkup);
             await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: "POST", body: fallbackFormData });
          }
        } else {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: tgCaption, parse_mode: "Markdown", reply_markup: JSON.parse(replyMarkup) }),
            signal: controller.signal 
          });
          clearTimeout(timeoutId);
        }
      } catch (tgError) {
        console.error("Telegram Request failed or timed out:", tgError);
      }
    }

    debugStep = "SUCCESS";
    return NextResponse.json({ success: true, orderId: orderRef.id });
  } catch (error: any) {
    console.error("Workshop Registration Error at step:", debugStep, error);
    // Explicitly return a 200 with success: false so Vercel doesn't intercept it and return an empty 500 HTML
    return NextResponse.json({ 
      success: false, 
      error: `Error at ${debugStep}: ${error.message || "Error interno"}`
    }, { status: 200 });
  }
}
