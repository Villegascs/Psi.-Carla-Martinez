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
    const snapshot = await adminDb.collection('products').get();
    
    // Filtramos y ordenamos en memoria para evitar requerir índices compuestos
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    products = products.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const adminDb = getAdminDb();
    
    const newDocRef = adminDb.collection('products').doc();
    const productData = {
      ...data,
      id: newDocRef.id,
      createdAt: new Date().toISOString()
    };
    
    await newDocRef.set(productData);
    
    return NextResponse.json({ success: true, product: productData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const adminDb = getAdminDb();
    await adminDb.collection('products').doc(id).update(data);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await verifyAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const adminDb = getAdminDb();
    await adminDb.collection('products').doc(id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
