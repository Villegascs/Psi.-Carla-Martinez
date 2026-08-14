import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const idNumber = formData.get("idNumber") as string;
    const workshopName = formData.get("workshopName") as string;
    const paymentProof = formData.get("paymentProof") as Blob;

    if (!paymentProof) {
      return NextResponse.json({ success: false, error: "Missing payment proof" }, { status: 400 });
    }

    // 1. Send image to Telegram directly
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const telegramFormData = new FormData();
      telegramFormData.append("chat_id", chatId);
      telegramFormData.append("photo", paymentProof);
      telegramFormData.append("caption", `🎟️ *Nueva Inscripción a Taller*\n\n*Nombre:* ${firstName} ${lastName}\n*Cédula:* ${idNumber}\n*Taller:* ${workshopName}\n\nRevisa el panel de admin para aprobar esta inscripción y enviarle el QR.`);
      telegramFormData.append("parse_mode", "Markdown");

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: "POST",
          body: telegramFormData
        });
        const tgData = await tgRes.json();
        if (!tgData.ok) {
          console.error("Telegram error:", tgData);
        }
      } catch (tgError) {
        console.error("Failed to fetch Telegram API:", tgError);
      }
    }

    // 2. Save registration pending approval to Firebase
    const ticketRef = adminDb.collection('tickets').doc();
    const ticketData = {
      id: ticketRef.id,
      firstName,
      lastName,
      idNumber,
      workshopName,
      status: "PENDING_APPROVAL", // will change to APPROVED or REJECTED
      used: false,
      createdAt: new Date().toISOString()
    };

    await ticketRef.set(ticketData);

    return NextResponse.json({ success: true, ticketId: ticketRef.id });
  } catch (error) {
    console.error("Workshop Registration Error:", error);
    return NextResponse.json({ success: false, error: "Failed to register" }, { status: 500 });
  }
}
