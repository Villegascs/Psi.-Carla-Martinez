import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientName, patientLastName, patientId, dateOfBirth, reason, date, price } = body;

    const newAppointmentRef = adminDb.collection('appointments').doc();
    const appointmentData = {
      id: newAppointmentRef.id,
      patientName,
      patientLastName,
      patientId,
      dateOfBirth: new Date(dateOfBirth).toISOString(),
      reason,
      date: new Date(date).toISOString(),
      price: Number(price) || 0,
      status: "PENDING",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await newAppointmentRef.set(appointmentData);

    return NextResponse.json({ success: true, appointment: appointmentData });
  } catch (error) {
    console.error("Reservation Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create reservation" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const snapshot = await adminDb.collection('appointments').orderBy('date', 'asc').get();
    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    console.error("Fetch Reservations Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch appointments" }, { status: 500 });
  }
}
