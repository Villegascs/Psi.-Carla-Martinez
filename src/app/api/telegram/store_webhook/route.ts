import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Check if it's a callback query (button click)
    if (data.callback_query) {
      const callbackQuery = data.callback_query;
      const callbackData = callbackQuery.data;
      const messageId = callbackQuery.message.message_id;
      const chatId = callbackQuery.message.chat.id;

      if (callbackData.startsWith('store_approve_') || callbackData.startsWith('store_reject_')) {
        const isApprove = callbackData.startsWith('store_approve_');
        const orderId = callbackData.replace(isApprove ? 'store_approve_' : 'store_reject_', '');

        const adminDb = getAdminDb();
        const orderRef = adminDb.collection('store_orders').doc(orderId);
        
        await orderRef.update({
          status: isApprove ? 'En Proceso' : 'Cancelado'
        });

        // Edit Telegram message to remove buttons and show result
        const TELEGRAM_BOT_TOKEN = process.env.STORE_TELEGRAM_BOT_TOKEN;
        const actionText = isApprove ? "✅ PAGO APROBADO Y EN PROCESO" : "❌ PAGO RECHAZADO";
        const originalText = callbackQuery.message.text || "Pedido de la Tienda";

        const editUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`;
        await fetch(editUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: `${originalText}\n\n${actionText}`
          })
        });

        // Answer callback query to remove loading state in Telegram
        const answerUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
        await fetch(answerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: isApprove ? 'Orden en proceso' : 'Orden cancelada'
          })
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error in store telegram webhook:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
