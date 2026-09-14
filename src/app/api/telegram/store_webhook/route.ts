import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import nodemailer from 'nodemailer';

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
        
        const doc = await orderRef.get();
        if (!doc.exists) return NextResponse.json({ ok: false, error: 'Order not found' });
        
        const orderData = doc.data();
        if (orderData?.status !== 'Pendiente') {
          // Already processed, just answer callback and return
          const answerUrl = `https://api.telegram.org/bot${process.env.STORE_TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
          await fetch(answerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: callbackQuery.id,
              text: 'Esta orden ya fue procesada previamente',
              show_alert: true
            })
          });
          return NextResponse.json({ ok: true });
        }

        await orderRef.update({
          status: isApprove ? 'Aprobado' : 'Cancelado'
        });

        // Edit Telegram message to remove buttons and show result
        const TELEGRAM_BOT_TOKEN = process.env.STORE_TELEGRAM_BOT_TOKEN;
        let actionText = isApprove ? "✅ PAGO APROBADO Y EN PROCESO" : "❌ PAGO RECHAZADO";
        
        if (isApprove) {
          try {
            const doc = await orderRef.get();
            const orderData = doc.data();
            
            if (orderData?.customerEmail) {
              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS,
                },
              });

              const itemsHtml = orderData.items.map((item: any) => 
                `<tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name} ${item.size ? `(Talla: ${item.size})` : ''}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">€${item.price.toFixed(2)}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
                </tr>`
              ).join("");

              const mailOptions = {
                from: `"Carla Martinez" <${process.env.EMAIL_USER}>`,
                to: orderData.customerEmail,
                subject: `🛍️ Nota de Entrega - Pedido #${orderId.slice(0, 8).toUpperCase()}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 12px;">
                    <h1 style="color: #333; text-align: center;">¡Tu pago ha sido aprobado!</h1>
                    <p style="font-size: 16px; color: #555;">Hola ${orderData.customerName},</p>
                    <p style="font-size: 16px; color: #555;">Tu pedido está <strong>Aprobado</strong>. A continuación, adjuntamos tu nota de entrega:</p>
                    
                    <h3 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">Detalles del Pedido</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                      <thead>
                        <tr style="background-color: #f9f9f9;">
                          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
                          <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Cant.</th>
                          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Precio unit.</th>
                          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">TOTAL:</td>
                          <td style="padding: 10px; text-align: right; font-weight: bold; color: #10b981;">€${orderData.total}</td>
                        </tr>
                      </tfoot>
                    </table>

                    <p style="font-size: 14px; color: #777;">
                      <strong>Método de entrega:</strong> ${orderData.deliveryMethod === 'Pickup' ? 'Retiro en consultorio' : 'Delivery / Envío'}<br/>
                      ${orderData.address ? `<strong>Dirección:</strong> ${orderData.address}` : ''}
                    </p>

                    ${orderData.items.filter((item: any) => item.isDigital && item.digitalLink).length > 0 ? `
                      <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; text-align: center;">
                        <h3 style="color: #065f46; margin-top: 0;">¡Tus Productos Digitales están listos!</h3>
                        <p style="color: #064e3b; font-size: 14px; margin-bottom: 20px;">Haz clic en los enlaces a continuación para acceder a tu contenido digital.</p>
                        ${orderData.items.filter((item: any) => item.isDigital && item.digitalLink).map((item: any) => `
                          <a href="${item.digitalLink}" target="_blank" style="display: inline-block; margin: 5px; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
                            Descargar: ${item.name}
                          </a>
                        `).join("")}
                      </div>
                    ` : ''}

                    <p style="font-size: 14px; color: #555; margin-top: 20px; text-align: center;">
                      Puedes rastrear el estado de tu pedido en cualquier momento ingresando aquí:<br/>
                      <a href="https://psi-carla-martinez.vercel.app/tienda/ordenes/${orderId}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px;">Rastrear Orden</a>
                    </p>
                  </div>
                `
              };

              await transporter.sendMail(mailOptions);
              actionText += "\n\n(📧 Nota de entrega enviada al cliente)";
              await orderRef.update({ emailSentAt: new Date().toISOString() });
            }
          } catch (emailErr) {
            console.error("Error sending delivery note:", emailErr);
            actionText += "\n\n(⚠️ Error al enviar correo)";
          }
        }

        const originalText = callbackQuery.message.caption || callbackQuery.message.text || "Pedido de la Tienda";
        const hasPhoto = !!callbackQuery.message.photo;
        const endpoint = hasPhoto ? 'editMessageCaption' : 'editMessageText';
        const payloadKey = hasPhoto ? 'caption' : 'text';

        const editUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`;
        await fetch(editUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            [payloadKey]: `${originalText}\n\n${actionText}`,
            parse_mode: 'HTML' // Because we used HTML when sending it!
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
