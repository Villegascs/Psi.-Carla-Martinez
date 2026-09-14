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
    // No longer saving to Firebase Storage, will send directly to Telegram
    let proofFile: File | null = file;

    const adminDb = getAdminDb();
    
    // Enrich items securely with digitalLink if applicable
    const enrichedItems = await Promise.all(orderData.items.map(async (item: any) => {
      if (item.id) {
        const productDoc = await adminDb.collection('products').doc(item.id).get();
        if (productDoc.exists) {
          const pData = productDoc.data();
          if (pData?.category === 'Producto Digital' && pData?.digitalLink) {
            return { ...item, digitalLink: pData.digitalLink, isDigital: true };
          }
        }
      }
      return item;
    }));
    
    // Create Store Order
    const newOrderRef = adminDb.collection('store_orders').doc();
    const finalOrderData = {
      ...orderData,
      items: enrichedItems,
      id: newOrderRef.id,
      hasProofFile: !!proofFile,
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

      // Send photo if proof exists directly via multipart/form-data
      if (proofFile) {
        const photoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        const photoData = new FormData();
        photoData.append('chat_id', TELEGRAM_CHAT_ID);
        
        // Convert File to Blob to prevent stream deadlock in Node.js fetch
        const buffer = await proofFile.arrayBuffer();
        const photoBlob = new Blob([buffer], { type: proofFile.type });
        photoData.append('photo', photoBlob, proofFile.name || "proof.jpg");
        
        photoData.append('caption', `Comprobante de Pedido: ${orderData.customerName}`);
        
        await fetch(photoUrl, {
          method: 'POST',
          body: photoData
        });
      }
    }

    return NextResponse.json({ success: true, orderId: newOrderRef.id });
  } catch (error: any) {
    console.error("Error creating store order:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
