import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "No se proporcionó un ID de ticket válido." }, { status: 400 });
    }

    const ticketRef = adminDb.collection('tickets').doc(ticketId);
    const doc = await ticketRef.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "El ticket no existe en la base de datos." }, { status: 404 });
    }

    const ticketData = doc.data();

    if (ticketData?.status !== "APPROVED") {
      return NextResponse.json({ success: false, error: "El ticket no ha sido aprobado o fue rechazado." }, { status: 400 });
    }

    if (ticketData?.used) {
      return NextResponse.json({ 
        success: false, 
        error: `¡CUIDADO! Este ticket ya fue utilizado el ${new Date(ticketData.usedAt).toLocaleString()}.`,
        alreadyUsed: true,
        participant: `${ticketData.firstName} ${ticketData.lastName}`
      }, { status: 400 });
    }

    // Mark as used
    await ticketRef.update({
      used: true,
      usedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: "¡Acceso concedido!",
      participant: `${ticketData?.firstName} ${ticketData?.lastName}`,
      workshop: ticketData?.workshopName
    });

  } catch (error) {
    console.error("Scan Ticket Error:", error);
    return NextResponse.json({ success: false, error: "Error interno al validar el ticket." }, { status: 500 });
  }
}
