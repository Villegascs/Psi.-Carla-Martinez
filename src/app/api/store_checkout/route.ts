import { NextResponse } from 'next/server';
import { getAdminDb, getAdminStorage } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Parse order data
    const orderDataStr = formData.get('orderData') as string;
    if (!orderDataStr) return NextResponse.json({ success: false, error: 'Missing order data' }, { status: 400 });
    const orderData = JSON.parse(orderDataStr);
    
    // Parse file if any
    const file = formData.get('file') as File | null;
    let proofUrl = "";

    if (file) {
      const storage = getAdminStorage();
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.replace('.firebasestorage.app', '.appspot.com');
      const bucket = storage.bucket(bucketName);
      const fileName = `store_proofs/${Date.now()}_${file.name}`;
      const fileRef = bucket.file(fileName);
      
      const buffer = Buffer.from(await file.arrayBuffer());
      await fileRef.save(buffer, {
        metadata: { contentType: file.type }
      });

      proofUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
    }

    const adminDb = getAdminDb();
    
    // Create Store Order
    const newOrderRef = adminDb.collection('store_orders').doc();
    const finalOrderData = {
      ...orderData,
      id: newOrderRef.id,
      proofUrl,
      createdAt: new Date().toISOString(),
      status: "Pendiente"
    };

    await newOrderRef.set(finalOrderData);

    // Send to Telegram
    const TELEGRAM_BOT_TOKEN = process.env.STORE_TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.STORE_TELEGRAM_CHAT_ID;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const itemsList = orderData.items.map((i: any) => `${i.quantity}x ${i.name} ${i.size ? `(Talla: ${i.size})` : ''} ${i.color ? `(Color: ${i.color})` : ''}`).join('\n');
      
      const message = `🛍 *NUEVO PEDIDO DE TIENDA*\n\n` +
        `*Cliente:* ${orderData.customerName}\n` +
        `*Teléfono:* ${orderData.customerPhone}\n` +
        `*Envío:* ${orderData.deliveryMethod === 'Pickup' ? 'Retiro en Persona' : orderData.address}\n\n` +
        `*Productos:*\n${itemsList}\n\n` +
        `*TOTAL:* ${orderData.total}€\n\n` +
        `*Método de Pago:* ${orderData.paymentMethod.toUpperCase()}`;

      // Send text
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Aprobar Pago', callback_data: `store_approve_${newOrderRef.id}` }],
              [{ text: '❌ Rechazar Pago', callback_data: `store_reject_${newOrderRef.id}` }]
            ]
          }
        })
      });

      // Send photo if proof exists
      if (proofUrl) {
        const photoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        await fetch(photoUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            photo: proofUrl,
            caption: `Comprobante de Pedido: ${orderData.customerName}`
          })
        });
      }
    }

    return NextResponse.json({ success: true, orderId: newOrderRef.id });
  } catch (error: any) {
    console.error("Error creating store order:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
