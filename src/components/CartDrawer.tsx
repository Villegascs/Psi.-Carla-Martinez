"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, total, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<"CART" | "PAYMENT">("CART");
  const [paymentData, setPaymentData] = useState({ name: "", phone: "", bank: "", reference: "" });

  if (!isCartOpen) return null;

  const handleWhatsAppCheckout = () => {
    // Generate text message for WhatsApp
    const orderDetails = items.map(i => `${i.quantity}x ${i.name} ${i.size ? `(${i.size})` : ""}`).join("%0A");
    const totalText = `*Total:* $${total}`;
    const paymentText = `*Pago:*%0ATitular: ${paymentData.name}%0ATeléfono: ${paymentData.phone}%0ABanco: ${paymentData.bank}%0AReferencia: ${paymentData.reference}`;
    
    const message = `Hola Carla, quiero realizar este pedido:%0A%0A${orderDetails}%0A%0A${totalText}%0A%0A${paymentText}%0A%0A*Te adjunto el capture del pago por este medio.*`;
    
    // Redirect to WhatsApp
    window.open(`https://wa.me/+584144083780?text=${message}`, '_blank');
    
    clearCart();
    setIsCartOpen(false);
    setCheckoutStep("CART");
  };

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "400px", backgroundColor: "var(--color-bg-primary)", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", zIndex: 1000, display: "flex", flexDirection: "column", animation: "fadeIn 0.3s" }}>
      <div style={{ padding: "24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="heading-2" style={{ margin: 0, fontSize: "1.5rem" }}>
          {checkoutStep === "CART" ? "Tu Carrito" : "Terminar Pedido"}
        </h2>
        <button onClick={() => setIsCartOpen(false)} style={{ fontSize: "1.5rem", background: "none", border: "none", cursor: "pointer" }}>&times;</button>
      </div>

      <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
        {checkoutStep === "CART" ? (
          items.length === 0 ? (
            <p className="text-muted" style={{ textAlign: "center", marginTop: "40px" }}>Tu carrito está vacío.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "16px" }}>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>{item.name}</h4>
                    <p className="text-muted" style={{ fontSize: "0.85rem" }}>Cantidad: {item.quantity} {item.size && `| Talla: ${item.size}`}</p>
                    <p style={{ fontWeight: 500 }}>${item.price * item.quantity}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.size)} style={{ color: "#d32f2f", fontSize: "0.85rem", textDecoration: "underline" }}>Quitar</button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>Ingresa los datos de tu pago para adjuntarlos al pedido.</p>
            <input type="text" placeholder="Nombre del titular" className="input-field" value={paymentData.name} onChange={e => setPaymentData({...paymentData, name: e.target.value})} />
            <input type="tel" placeholder="Número de teléfono" className="input-field" value={paymentData.phone} onChange={e => setPaymentData({...paymentData, phone: e.target.value})} />
            <input type="text" placeholder="Banco emisor" className="input-field" value={paymentData.bank} onChange={e => setPaymentData({...paymentData, bank: e.target.value})} />
            <input type="text" placeholder="Número de referencia" className="input-field" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
            <p style={{ fontSize: "0.85rem", backgroundColor: "var(--color-bg-secondary)", padding: "12px", borderRadius: "8px" }}>
              Al continuar, se abrirá WhatsApp con los detalles. <strong>Deberás adjuntar manualmente la imagen (capture) del pago en el chat.</strong>
            </p>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div style={{ padding: "24px", borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-secondary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "1.2rem", fontWeight: 700 }}>
            <span>Total:</span>
            <span>${total}</span>
          </div>
          
          {checkoutStep === "CART" ? (
            <button className="btn-primary" style={{ width: "100%" }} onClick={() => setCheckoutStep("PAYMENT")}>
              Terminar Pedido
            </button>
          ) : (
            <button className="btn-primary" style={{ width: "100%", backgroundColor: "#25D366" }} onClick={handleWhatsAppCheckout}>
              Enviar por WhatsApp
            </button>
          )}
        </div>
      )}
    </div>
  );
}
