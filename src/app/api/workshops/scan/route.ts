import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json();

    if (!ticketId || !ticketId.includes("-")) {
      return NextResponse.json({ success: false, error: "No se proporcionó un ID de ticket válido." }, { status: 400 });
    }

    // El ticketId viene en formato: orderId-participantIndex (ej. XyZ123-0)
    const parts = ticketId.split("-");
    const orderId = parts[0];
    const participantIndex = parseInt(parts[1]);

    const orderRef = adminDb.collection('tickets').doc(orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "El ticket o la orden no existe." }, { status: 404 });
    }

    const orderData = doc.data();

    if (orderData?.status !== "APPROVED") {
      return NextResponse.json({ success: false, error: "Esta orden no ha sido aprobada o fue rechazada." }, { status: 400 });
    }

    const participants = orderData?.participants || [];
    
    if (participantIndex < 0 || participantIndex >= participants.length) {
      return NextResponse.json({ success: false, error: "El índice del participante no es válido." }, { status: 400 });
    }

    const participant = participants[participantIndex];

    if (participant.used) {
      return NextResponse.json({ 
        success: false, 
        error: `¡CUIDADO! La entrada de este participante ya fue utilizada el ${new Date(participant.usedAt).toLocaleString()}.`,
        alreadyUsed: true,
        participant: `${participant.firstName} ${participant.lastName}`
      }, { status: 400 });
    }

    // Mark specific participant as used
    participants[participantIndex].used = true;
    participants[participantIndex].usedAt = new Date().toISOString();

    await orderRef.update({
      participants: participants
    });

    return NextResponse.json({ 
      success: true, 
      message: "¡Acceso concedido!",
      participant: `${participant.firstName} ${participant.lastName}`,
      workshop: orderData?.workshopName
    });

  } catch (error) {
    console.error("Scan Ticket Error:", error);
    return NextResponse.json({ success: false, error: "Error interno al validar el ticket." }, { status: 500 });
  }
}
