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
    
    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "PIN incorrecto" }, { status: 401 });
    }
    
    const data = doc.data();
    if (data?.scannerPin !== pin) {
      return NextResponse.json({ success: false, error: "PIN incorrecto" }, { status: 401 });
    }
    
    // Si el PIN es correcto, devolvemos success. 
    // Como es un uso interno sencillo, confiaremos en un localStorage del lado del cliente.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error validando PIN del escáner:", error);
    return NextResponse.json({ success: false, error: "Error de servidor" }, { status: 500 });
  }
}
