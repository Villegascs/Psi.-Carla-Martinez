import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const adminDb = getAdminDb();
    const newDocRef = adminDb.collection('appointments').doc();
    
    const appointmentData = {
      id: newDocRef.id,
      patientName: body.patientName,
      patientLastName: body.patientLastName,
      patientIdType: body.patientIdType,
      patientId: body.patientId,
      patientPhone: body.patientPhone,
      dateOfBirth: body.dateOfBirth,
      reason: body.reason,
      date: body.date,
      planId: body.planId,
      planName: body.planName,
      planPrice: body.planPrice,
      hasCoaching: body.hasCoaching,
      coachingPrice: body.coachingPrice,
      total: body.total,
      paymentMethod: body.paymentMethod,
      paymentData: body.paymentData,
      proofUrl: body.proofUrl || "",
      status: "PENDING",
      createdAt: new Date().toISOString()
    };

    await newDocRef.set(appointmentData);

    // Send Telegram Notification to Reservation Bot
    const botToken = process.env.RESERVATIONS_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.RESERVATIONS_TELEGRAM_CHAT_ID; // This might be empty, but we'll try to send anyway.

    if (botToken && chatId) {
      let message = `🏥 *Nueva Solicitud de Cita*\n\n`;
      message += `*Paciente:* ${appointmentData.patientName} ${appointmentData.patientLastName}\n`;
      message += `*C.I:* ${appointmentData.patientIdType}-${appointmentData.patientId}\n`;
      message += `*Teléfono:* ${appointmentData.patientPhone}\n`;
      message += `*Motivo:* ${appointmentData.reason}\n`;
      message += `*Fecha Solicitada:* ${new Date(appointmentData.date).toLocaleString()}\n\n`;
      message += `*Plan:* ${appointmentData.planName} (€${appointmentData.planPrice})\n`;
      if (appointmentData.hasCoaching) {
        message += `*Extra:* Coaching (+€${appointmentData.coachingPrice})\n`;
      }
      message += `*Total a pagar:* €${appointmentData.total}\n\n`;
      message += `*Método de Pago:* ${appointmentData.paymentMethod}\n`;
      
      if (appointmentData.paymentMethod === "Pago Movil") {
        message += `Banco: ${appointmentData.paymentData.bank}\nRef: ${appointmentData.paymentData.reference}\n`;
      } else if (appointmentData.paymentMethod === "Zelle" || appointmentData.paymentMethod === "Binance") {
        message += `Ref: ${appointmentData.paymentData.reference}\n`;
      }

      const keyboard = {
        inline_keyboard: [
          [
            { text: "✅ Aprobar Cita", callback_data: `res_approve_${appointmentData.id}` },
            { text: "❌ Rechazar", callback_data: `res_reject_${appointmentData.id}` }
          ]
        ]
      };

      try {
        if (appointmentData.proofUrl) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              photo: appointmentData.proofUrl,
              caption: message,
              parse_mode: 'Markdown',
              reply_markup: keyboard
            })
          });
        } else {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'Markdown',
              reply_markup: keyboard
            })
          });
        }
      } catch (e) {
        console.error("Telegram notification error:", e);
      }
    }

    return NextResponse.json({ success: true, appointment: appointmentData });
  } catch (error) {
    console.error("Reservation checkout error:", error);
    return NextResponse.json({ success: false, error: "Failed to process reservation" }, { status: 500 });
  }
}
