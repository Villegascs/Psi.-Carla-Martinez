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
        const workshopSnapshot = await adminDb.collection('workshops').where('title', '==', orderData.workshopName).limit(1).get();
        let workshopData = null;
        if (!workshopSnapshot.empty) {
          workshopData = workshopSnapshot.docs[0].data();
        }
        const isVirtual = workshopData && workshopData.type === 'Virtual';
        const virtualLink = workshopData ? workshopData.virtualLink : '#';

        const attachments = [];
        let ticketsHtml = '';
        
        if (isVirtual) {
          ticketsHtml = `
            <div style="background-color: #fdf8f6; padding: 30px; border-radius: 12px; text-align: center; border: 1px solid #f9dad0; margin-bottom: 30px;">
              <h2 style="color: #111; margin-top: 0;">¡Ya puedes ingresar a tu curso virtual!</h2>
              <p style="color: #555; margin-bottom: 24px;">Haz clic en el botón de abajo para acceder a la sala virtual.</p>
              <a href="${virtualLink}" style="display: inline-block; background-color: #111; color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 1.1rem;">Ingresar al Curso</a>
            </div>
          `;
        } else {
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
              content: qrBuffer,
              cid: `qr_${i}`
            });

            ticketsHtml += `
              <div style="background-color: #111111; color: #ffffff; padding: 30px 20px; border-radius: 12px; text-align: center; max-width: 350px; margin: 0 auto 20px auto; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border: 1px solid #333;">
                <p style="color: #ffffff; font-size: 1rem; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Entrada ${i + 1} de ${orderData.participants.length}</p>
                <h3 style="font-size: 1.2rem; font-weight: 400; margin: 0 0 20px 0;"><strong style="font-weight: 700;">Titular:</strong> ${participant.firstName} ${participant.lastName}</h3>
                
                <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; display: inline-block; margin-bottom: 20px;">
                  <img src="cid:qr_${i}" alt="QR Code" style="width: 200px; height: 200px; display: block;" />
                </div>
                
                <p style="color: #aaaaaa; font-size: 0.85rem; margin: 0;">ID: ${orderId.substring(0, 8)}</p>
              </div>
            `;
          }
        }

        // Send Email with NodeMailer
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const info = await transporter.sendMail({
          from: `"Carla Martinez | Entradas" <${process.env.EMAIL_USER}>`,
          to: orderData.buyerEmail,
          subject: `Inscripción Confirmada - ${orderData.workshopName}`,
          html: `
            <div style="background-color: #f4f4f5; padding: 40px 20px; font-family: sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background-color: #111111; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 1.8rem; font-weight: 600;">Inscripción Aprobada</h1>
                </div>
                <div style="padding: 30px;">
                  <p style="font-size: 1.1rem; color: #111111; font-weight: 600;">Hola,</p>
                  <p style="font-size: 1.1rem; color: #333333; line-height: 1.5;">Tu pago para el <strong>${orderData.workshopName}</strong> ha sido verificado con éxito.</p>
                  <p style="font-size: 1.1rem; color: #333333; line-height: 1.5; margin-bottom: 30px;">${isVirtual ? 'A continuación encontrarás el acceso a tu curso virtual.' : 'A continuación encontrarás tus entradas. Por favor, muéstralas desde tu teléfono el día del evento.'}</p>
                  
                  ${ticketsHtml}
                  
                  <p style="font-size: 1.1rem; color: #111111; text-align: center; margin-top: 30px; font-weight: 600;">¡Te esperamos!</p>
                </div>
              </div>
            </div>
          `,
          attachments: attachments
        });

        if (botToken && chatId) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: `✅ Correo enviado con éxito a ${orderData.buyerEmail}` })
          });
        }
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
