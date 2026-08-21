import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date'); // Format: YYYY-MM-DD

    if (!dateParam) {
      return NextResponse.json({ success: false, error: "Falta la fecha (date)" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    
    // Query appointments within the selected date
    const startOfDay = `${dateParam}T00:00`;
    const endOfDay = `${dateParam}T23:59`;

    const snapshot = await adminDb.collection('appointments')
      .where('date', '>=', startOfDay)
      .where('date', '<=', endOfDay)
      .get();

    const bookedHours: string[] = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      // Only block the time slot if the appointment is ACCEPTED
      if (data.status === 'ACCEPTED' && data.date) {
        // data.date is like "2026-08-12T13:00"
        const timePart = data.date.split('T')[1];
        if (timePart) {
          bookedHours.push(timePart);
        }
      }
    });

    return NextResponse.json({ success: true, bookedHours });
  } catch (error: any) {
    console.error("Error fetching booked hours:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch booked hours" }, { status: 500 });
  }
}
