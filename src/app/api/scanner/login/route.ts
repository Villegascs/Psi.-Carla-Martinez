import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body;
    
    if (!pin) {
      return NextResponse.json({ success: false, error: "Falta el PIN" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const doc = await adminDb.collection('settings').doc('general').get();
    
    let isSuccess = false;

    if (doc.exists) {
      const data = doc.data();
      if (data?.scannerPin === pin) {
        isSuccess = true;
      }
    }

    // Registrar el intento de acceso
    if (body.staffName) {
      await adminDb.collection('scannerLogs').add({
        staffName: body.staffName,
        success: isSuccess,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
    }
    
    if (!isSuccess) {
      return NextResponse.json({ success: false, error: "PIN incorrecto" }, { status: 401 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error validando PIN del escáner:", error);
    return NextResponse.json({ success: false, error: "Error de servidor" }, { status: 500 });
  }
}
