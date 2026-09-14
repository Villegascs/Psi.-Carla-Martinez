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
      
      let paymentDetails = `<b>Método de Pago:</b> ${orderData.paymentMethod.toUpperCase()}`;
      if (orderData.paymentMethod.toLowerCase().includes("pago movil")) {
        paymentDetails += `\n<b>Banco:</b> ${orderData.paymentData?.bank || "N/A"}\n<b>Referencia:</b> ${orderData.paymentData?.reference || "N/A"}`;
      } else if (orderData.paymentMethod.toLowerCase() === "zelle") {
        paymentDetails += `\n<b>Referencia:</b> ${orderData.paymentData?.reference || "N/A"}`;
      } else if (orderData.paymentMethod.toLowerCase() === "binance") {
        paymentDetails += `\n<b>Usuario:</b> ${orderData.paymentData?.binanceUser || "N/A"}\n<b>Referencia:</b> ${orderData.paymentData?.reference || "N/A"}`;
      } else if (orderData.paymentMethod.toLowerCase() === "efectivo") {
        paymentDetails += `\n<b>Billetes:</b> ${orderData.paymentData?.billDenomination || "N/A"}`;
      }

      const message = `🛍 <b>NUEVO PEDIDO DE TIENDA</b>\n\n` +
        `<b>Cliente:</b> ${orderData.customerName}\n` +
        `<b>Teléfono:</b> ${orderData.customerPhone}\n` +
        `<b>Envío:</b> ${orderData.deliveryMethod === 'Pickup' ? 'Retiro en Persona' : orderData.address}\n\n` +
        `<b>Productos:</b>\n${itemsList}\n\n` +
        `<b>TOTAL:</b> ${orderData.total}€\n\n` +
        paymentDetails;

      const replyMarkup = {
        inline_keyboard: [
          [{ text: '✅ Aprobar Pago', callback_data: `store_approve_${newOrderRef.id}` }],
          [{ text: '❌ Rechazar Pago', callback_data: `store_reject_${newOrderRef.id}` }]
        ]
      };

      if (proofFile) {
        // Send single message with photo, caption, and buttons
        const photoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        const photoData = new FormData();
        photoData.append('chat_id', TELEGRAM_CHAT_ID);
        
        const buffer = await proofFile.arrayBuffer();
        const photoBlob = new Blob([buffer], { type: proofFile.type });
        photoData.append('photo', photoBlob, proofFile.name || "proof.jpg");
        
        photoData.append('caption', message);
        photoData.append('parse_mode', 'HTML');
        photoData.append('reply_markup', JSON.stringify(replyMarkup));
        
        await fetch(photoUrl, {
          method: 'POST',
          body: photoData
        });
      } else {
        // Send text only (e.g. for cash payments)
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            reply_markup: replyMarkup
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
