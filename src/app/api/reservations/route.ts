import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientName, patientLastName, patientId, dateOfBirth, reason, date, price } = body;

    const appointment = await prisma.appointment.create({
      data: {
        patientName,
        patientLastName,
        patientId,
        dateOfBirth: new Date(dateOfBirth),
        reason,
        date: new Date(date),
        price: Number(price) || 0,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error("Reservation Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create reservation" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: 'asc' }
    });
    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch appointments" }, { status: 500 });
  }
}
