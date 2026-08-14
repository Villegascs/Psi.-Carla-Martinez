import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const update = await req.json();

    // Only process callback queries (button clicks)
    if (!update.callback_query) {
      return NextResponse.json({ success: true });
    }

    const callbackQuery = update.callback_query;
    const data = callbackQuery.data; // e.g., "approve_12345"
    const chatId = callbackQuery.message?.chat.id;
    const messageId = callbackQuery.message?.message_id;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!data.startsWith('approve_') && !data.startsWith('reject_')) {
      return NextResponse.json({ success: true });
    }

    const action = data.split('_')[0]; // 'approve' or 'reject'
    const orderId = data.split('_')[1];

    const adminDb = getAdminDb();
    const orderRef = adminDb.collection('tickets').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      // Notify Telegram callback error
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQuery.id, text: "La inscripción no existe", show_alert: true })
        });
      }
      return NextResponse.json({ success: false, error: "Order not found" });
    }

    const orderData = orderDoc.data()!;
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    // Update Firebase
    await orderRef.update({ status: newStatus });

    // Handle Email & QRs if Approved
    if (action === 'approve' && orderData.buyerEmail) {
      try {
        const attachments = [];
        
        // Generate a QR for each participant
        for (let i = 0; i < orderData.participants.length; i++) {
          const participant = orderData.participants[i];
          const qrData = JSON.stringify({
            orderId: orderId,
            participantIndex: i,
            idNumber: `${participant.idType}-${participant.idNumber}`
          });
          
          const qrBuffer = await QRCode.toBuffer(qrData, { width: 300, margin: 2 });
          
          attachments.push({
            filename: `Entrada_${participant.firstName}_${participant.lastName}.png`,
            content: qrBuffer
          });
        }

        // Send Email with NodeMailer
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"Carla Martinez" <${process.env.EMAIL_USER}>`,
          to: orderData.buyerEmail,
          subject: '🎟️ Tus entradas para el Taller',
          html: `
            <h2>¡Tu inscripción ha sido aprobada!</h2>
            <p>Hola,</p>
            <p>Tu pago para el <strong>${orderData.workshopName}</strong> ha sido verificado con éxito.</p>
            <p>Adjunto a este correo encontrarás los códigos QR para cada participante. Por favor preséntalos en la entrada el día del evento.</p>
            <p>¡Te esperamos!</p>
          `,
          attachments: attachments
        });
      } catch (emailError: any) {
        console.error("Error sending email:", emailError);
        if (botToken && chatId) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: `⚠️ Error enviando correo a ${orderData.buyerEmail}: ${emailError.message}` })
          });
        }
      }
    }

    // Update Telegram Message
    if (botToken && chatId && messageId) {
      // Acknowledge the callback query so the button stops loading
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQuery.id, text: action === 'approve' ? "Inscripción Aprobada" : "Inscripción Rechazada" })
      });

      // Remove the inline keyboard and add status to caption
      const statusText = action === 'approve' ? "\n\n✅ *ESTADO: APROBADA*" : "\n\n❌ *ESTADO: RECHAZADA*";
      const newCaption = (callbackQuery.message.caption || callbackQuery.message.text || "") + statusText;

      // Use editMessageCaption if it was a photo, else editMessageText
      if (callbackQuery.message.photo) {
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            caption: newCaption,
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: [] } // Clear buttons
          })
        });
      } else {
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: newCaption,
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: [] } // Clear buttons
          })
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Telegram Webhook Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
