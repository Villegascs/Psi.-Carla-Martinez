import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection('products').get();
      
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    
    // Filtrar y ordenar en memoria para evitar requerir índices compuestos en Firebase
    products = products
      .filter(p => p.status === 'Publicado')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
