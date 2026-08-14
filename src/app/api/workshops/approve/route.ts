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
    const { orderId, email } = await request.json();

    if (!orderId || !email) {
      return NextResponse.json({ success: false, error: "Faltan datos (orderId o email)." }, { status: 400 });
    }

    const orderRef = adminDb.collection('tickets').doc(orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Orden no encontrada." }, { status: 404 });
    }

    const orderData = doc.data();
    
    // 1. Generate QR Code for EACH participant
    const attachments = [];
    const qrImagesHtml = [];
    
    const participants = orderData?.participants || [];
    
    for (let i = 0; i < participants.length; i++) {
      const uniqueTicketId = `${orderId}-${i}`;
      
      const qrDataUrl = await QRCode.toDataURL(uniqueTicketId, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      
      const cid = `qrcode-${i}`;
      attachments.push({
        filename: `entrada-${participants[i].firstName}-${participants[i].lastName}.png`,
        path: qrDataUrl,
        cid: cid
      });
      
      qrImagesHtml.push(`
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px dashed #ccc;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Entrada de: ${participants[i].firstName} ${participants[i].lastName}</h3>
          <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">C.I: V-${participants[i].idNumber}</p>
          <img src="cid:${cid}" alt="Código QR de Entrada" style="width: 250px; height: 250px; border: 1px solid #ccc; border-radius: 8px;" />
        </div>
      `);
    }

    // 2. Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Send Email
    const mailOptions = {
      from: `"Carla Martinez" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎟️ Tus entradas para: ${orderData?.workshopName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center; border: 1px solid #eaeaea; padding: 20px; border-radius: 12px;">
          <h1 style="color: #333;">¡Inscripción Aprobada!</h1>
          <p style="font-size: 16px; color: #555;">Tu pago ha sido verificado y las entradas oficiales para <strong>${orderData?.workshopName}</strong> han sido generadas.</p>
          
          <p style="font-size: 14px; color: #777; margin-bottom: 20px;">Por favor, presenta los siguientes Códigos QR en la puerta el día del evento:</p>
          
          ${qrImagesHtml.join("")}
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">Cada código es único e intransferible y solo puede ser escaneado una vez por persona.</p>
        </div>
      `,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);

    // 4. Update Firebase Status
    await orderRef.update({
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
