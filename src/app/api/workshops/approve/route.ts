import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('tickets').orderBy('createdAt', 'desc').get();
    const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error("Fetch Tickets Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { ticketId, email } = await request.json();

    if (!ticketId || !email) {
      return NextResponse.json({ success: false, error: "Faltan datos (ticketId o email)." }, { status: 400 });
    }

    const ticketRef = adminDb.collection('tickets').doc(ticketId);
    const doc = await ticketRef.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Ticket no encontrado." }, { status: 404 });
    }

    const ticketData = doc.data();

    // 1. Generate QR Code containing the ticketId
    const qrDataUrl = await QRCode.toDataURL(ticketId, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // 2. Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this if using another provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Send Email
    const mailOptions = {
      from: `"Carla Martinez" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎟️ Tu entrada para: ${ticketData?.workshopName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center; border: 1px solid #eaeaea; padding: 20px; border-radius: 12px;">
          <h1 style="color: #333;">¡Inscripción Aprobada!</h1>
          <p style="font-size: 16px; color: #555;">Hola ${ticketData?.firstName}, tu pago ha sido verificado y tu entrada oficial ha sido generada.</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0;">${ticketData?.workshopName}</h2>
            <p style="margin: 0;"><strong>Participante:</strong> ${ticketData?.firstName} ${ticketData?.lastName}</p>
            <p style="margin: 0;"><strong>C.I:</strong> ${ticketData?.idNumber}</p>
          </div>
          <p style="font-size: 14px; color: #777; margin-bottom: 20px;">Por favor, presenta el siguiente Código QR en la puerta el día del evento:</p>
          
          <img src="cid:qrcode" alt="Código QR de Entrada" style="width: 250px; height: 250px; border: 1px solid #ccc; border-radius: 8px;" />
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">Este código es único e intransferible y solo puede ser escaneado una vez.</p>
        </div>
      `,
      attachments: [
        {
          filename: 'ticket-qr.png',
          path: qrDataUrl,
          cid: 'qrcode' // same cid value as in the html img src
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    // 4. Update Firebase Status
    await ticketRef.update({
      status: "APPROVED",
      emailSentTo: email,
      approvedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: "Aprobado y enviado con éxito." });
  } catch (error) {
    console.error("Approve Ticket Error:", error);
    return NextResponse.json({ success: false, error: "Ocurrió un error al aprobar o enviar el correo." }, { status: 500 });
  }
}
