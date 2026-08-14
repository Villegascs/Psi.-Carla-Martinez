import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

async function verifyAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');
  return authCookie?.value === 'true';
}

export async function GET(request: Request) {
  if (!(await verifyAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const workshopName = searchParams.get('workshopName');
    
    if (!workshopName) {
      return NextResponse.json({ error: 'workshopName is required' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection('tickets')
      .where('workshopName', '==', workshopName)
      .where('status', '==', 'APPROVED')
      .get();
      
    const tickets = snapshot.docs.map(doc => doc.data());
    
    // Extraer todos los participantes de los tickets
    let allParticipants: any[] = [];
    tickets.forEach(ticket => {
      if (ticket.participants && Array.isArray(ticket.participants)) {
        ticket.participants.forEach((p: any) => {
          allParticipants.push({
            firstName: p.firstName,
            lastName: p.lastName,
            idType: p.idType,
            idNumber: p.idNumber,
            buyerEmail: ticket.buyerEmail, // Correo de quien compró
            ticketId: ticket.id,
            purchaseDate: ticket.createdAt
          });
        });
      }
    });
    
    return NextResponse.json({ success: true, participants: allParticipants });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
