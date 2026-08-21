import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  try {
    const adminDb = getAdminDb();
    const doc = await adminDb.collection('settings').doc('general').get();
    
    if (!doc.exists) {
      return NextResponse.json({ success: true, settings: {} });
    }
    
    return NextResponse.json({ success: true, settings: doc.data() });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scannerPin } = body;
    
    const adminDb = getAdminDb();
    await adminDb.collection('settings').doc('general').set({
      scannerPin: scannerPin || ""
    }, { merge: true });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
