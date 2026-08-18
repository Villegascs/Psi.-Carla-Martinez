import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check for callback_query (button press)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data; // e.g., res_approve_123 or res_reject_123
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;

      let isApprove = false;
      let isReject = false;
      let appointmentId = "";

      if (data.startsWith('res_approve_')) {
        isApprove = true;
        appointmentId = data.replace('res_approve_', '');
      } else if (data.startsWith('res_reject_')) {
        isReject = true;
        appointmentId = data.replace('res_reject_', '');
      }

      if (isApprove || isReject) {
        const adminDb = getAdminDb();
        const appointmentRef = adminDb.collection('appointments').doc(appointmentId);
        const appointmentSnap = await appointmentRef.get();

        if (!appointmentSnap.exists) {
          return NextResponse.json({ success: true });
        }

        const appointment = appointmentSnap.data();

        if (isApprove) {
          await appointmentRef.update({ status: 'ACCEPTED' });
        } else {
          await appointmentRef.update({ status: 'REJECTED' });
        }

        // Edit Telegram message to remove buttons
        const botToken = process.env.RESERVATIONS_TELEGRAM_BOT_TOKEN;
        const actionText = isApprove ? "✅ CITA APROBADA" : "❌ CITA RECHAZADA";
        
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            caption: `${callbackQuery.message.caption || callbackQuery.message.text}\n\n*ESTADO ACTUALIZADO:* ${actionText}`,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [] }
          })
        }).catch(async () => {
          // Fallback if it's a text message without caption
          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: `${callbackQuery.message.text}\n\n*ESTADO ACTUALIZADO:* ${actionText}`,
              parse_mode: 'Markdown',
              reply_markup: { inline_keyboard: [] }
            })
          });
        });

        // Answer callback query
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: isApprove ? "Cita Aprobada" : "Cita Rechazada"
          })
        });

        // Send Email if Approved
        if (isApprove && appointment?.patientEmail) {
          try {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            const mailOptions = {
              from: `"Psi. Carla Martinez" <${process.env.EMAIL_USER}>`,
              to: appointment.patientEmail,
              subject: 'Tu cita ha sido confirmada ✅',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                  <h2 style="color: #2563eb;">¡Hola ${appointment.patientName}!</h2>
                  <p>Tu solicitud de cita ha sido <strong>aprobada y confirmada</strong> exitosamente.</p>
                  
                  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1f2937;">Detalles de la Cita</h3>
                    <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.6;">
                      <li><strong>Fecha y Hora:</strong> ${new Date(appointment.date).toLocaleString()}</li>
                      <li><strong>Servicio:</strong> ${appointment.planName}</li>
                      ${appointment.hasCoaching ? `<li><strong>Extra:</strong> Coaching</li>` : ''}
                      <li><strong>Paciente:</strong> ${appointment.patientName} ${appointment.patientLastName}</li>
                    </ul>
                  </div>
                  
                  <p>Nos pondremos en contacto contigo pronto vía WhatsApp al número ${appointment.patientPhone} si hay instrucciones adicionales.</p>
                  <p>¡Gracias por tu confianza!</p>
                </div>
              `
            };

            await transporter.sendMail(mailOptions);
          } catch (emailError) {
            console.error("Error enviando email de cita:", emailError);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reservation webhook error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
