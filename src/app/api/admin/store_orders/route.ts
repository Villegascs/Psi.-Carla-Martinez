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
    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection('store_orders').orderBy('createdAt', 'desc').get();
    
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: 'ID and Status required' }, { status: 400 });

    const adminDb = getAdminDb();
    await adminDb.collection('store_orders').doc(id).update({ status });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
