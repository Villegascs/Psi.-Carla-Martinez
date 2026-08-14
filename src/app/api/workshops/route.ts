import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const idNumber = formData.get("idNumber") as string;
    const workshopName = formData.get("workshopName") as string;
    const paymentProof = formData.get("paymentProof") as File;

    if (!paymentProof) {
      return NextResponse.json({ success: false, error: "Falta el comprobante de pago." }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Send to Telegram
    if (botToken && chatId) {
      try {
        const tgFormData = new FormData();
        tgFormData.append("chat_id", chatId);
        // Important: explicitly pass the file name to avoid serialization issues
        tgFormData.append("photo", paymentProof, paymentProof.name || "capture.jpg");
        tgFormData.append("caption", `🎟️ *Nueva Inscripción a Taller*\n\n*Nombre:* ${firstName} ${lastName}\n*Cédula:* ${idNumber}\n*Taller:* ${workshopName}\n\nRevisa el panel de admin para aprobar esta inscripción y enviarle el QR.`);
        tgFormData.append("parse_mode", "Markdown");

        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: "POST",
          body: tgFormData
        });
        
        const tgData = await tgRes.json();
        
        // Telegram might reject WebP images or other formats in sendPhoto
        if (!tgData.ok) {
          console.error("Telegram API Error (Photo):", tgData);
          if (tgData.error_code === 400) {
             const fallbackFormData = new FormData();
             fallbackFormData.append("chat_id", chatId);
             fallbackFormData.append("text", `🎟️ *Nueva Inscripción a Taller*\n\n*Nombre:* ${firstName} ${lastName}\n*Cédula:* ${idNumber}\n*Taller:* ${workshopName}\n\n⚠️ *El capture subido era de un formato no soportado (ej. WebP), pero la inscripción fue registrada en la base de datos.*`);
             fallbackFormData.append("parse_mode", "Markdown");
             await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: "POST", body: fallbackFormData });
          }
        }
      } catch (tgError) {
        console.error("Failed to fetch Telegram API:", tgError);
      }
    }

    // Save to Firebase Admin
    const ticketRef = adminDb.collection('tickets').doc();
    const ticketData = {
      id: ticketRef.id,
      firstName,
      lastName,
      idNumber,
      workshopName,
      status: "PENDING_APPROVAL",
      used: false,
      createdAt: new Date().toISOString()
    };

    await ticketRef.set(ticketData);

    return NextResponse.json({ success: true, ticketId: ticketRef.id });
  } catch (error: any) {
    console.error("Workshop Registration Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno del servidor al procesar la inscripción." }, { status: 500 });
  }
}
