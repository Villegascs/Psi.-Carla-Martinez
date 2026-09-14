import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { ticketId, scannedBy } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "No se proporcionó un ID de ticket." }, { status: 400 });
    }

    let orderId = "";
    let participantIndex = 0;

    // Handle both JSON format (from Telegram webhook) and raw string format
    try {
      if (ticketId.trim().startsWith('{')) {
        const parsed = JSON.parse(ticketId);
        orderId = parsed.orderId;
        participantIndex = parseInt(parsed.participantIndex);
      } else {
        const parts = ticketId.split("-");
        orderId = parts[0];
        participantIndex = parseInt(parts[1]);
      }
    } catch (e) {
      return NextResponse.json({ success: false, error: "El formato del código QR es inválido." }, { status: 400 });
    }

    if (!orderId || isNaN(participantIndex)) {
      return NextResponse.json({ success: false, error: "Datos del código QR corruptos." }, { status: 400 });
    }

    const adminDb = getAdminDb();
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
        error: `¡CUIDADO! La entrada de este participante ya fue validada el ${new Date(participant.usedAt).toLocaleString()} por ${participant.scannedBy || 'un miembro del personal'}.`,
        alreadyUsed: true,
        participant: `${participant.firstName} ${participant.lastName}`
      }, { status: 400 });
    }

    // Mark specific participant as used
    participants[participantIndex].used = true;
    participants[participantIndex].usedAt = new Date().toISOString();
    if (scannedBy) {
      participants[participantIndex].scannedBy = scannedBy;
    }

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
