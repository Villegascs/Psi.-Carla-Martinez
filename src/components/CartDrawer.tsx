"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, total, clearCart } = useCart();
  
  // Checkout steps: CART -> CONTACT -> PAYMENT -> SUCCESS
  const [checkoutStep, setCheckoutStep] = useState<"CART" | "CONTACT" | "PAYMENT" | "SUCCESS">("CART");
  
  const [contactData, setContactData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryMethod: "Pickup", // "Pickup" or "Delivery"
    address: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentData, setPaymentData] = useState({
    bank: "", paymentIdType: "V", paymentId: "", paymentPhone: "", binanceUser: "", reference: "", billDenomination: ""
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);

  if (!isCartOpen) return null;

  const handleNextStep = () => {
    if (checkoutStep === "CART") {
      if (items.length === 0) return;
      setCheckoutStep("CONTACT");
    } else if (checkoutStep === "CONTACT") {
      if (!contactData.customerName || !contactData.customerEmail || !contactData.customerPhone) {
        alert("Por favor completa tus datos de contacto.");
        return;
      }
      if (contactData.deliveryMethod === "Delivery" && !contactData.address) {
        alert("Por favor ingresa tu dirección de entrega.");
        return;
      }
      setCheckoutStep("PAYMENT");
    }
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      alert("Por favor selecciona un método de pago.");
      return;
    }
    if (paymentMethod !== "efectivo" && !paymentData.reference) {
      alert("Por favor ingresa el número de referencia.");
      return;
    }
    if (paymentMethod !== "efectivo" && !proofFile) {
      alert("Por favor adjunta el comprobante (capture) de tu pago.");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...contactData,
        paymentMethod,
        paymentData: paymentMethod === 'efectivo' ? { denomination: paymentData.billDenomination } : paymentData,
        items,
        total
      };

      const formData = new FormData();
      formData.append('orderData', JSON.stringify(orderData));
      if (proofFile) formData.append('file', proofFile);

      const res = await fetch("/api/store_checkout", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setCheckoutStep("SUCCESS");
        clearCart();
      } else {
        alert("Error procesando la orden: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Hubo un error al procesar tu pedido.");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "450px", backgroundColor: "var(--color-bg-primary)", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", zIndex: 1000, display: "flex", flexDirection: "column", animation: "fadeIn 0.3s" }}>
      <div style={{ padding: "24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="heading-2" style={{ margin: 0, fontSize: "1.5rem" }}>
          {checkoutStep === "CART" ? "Tu Carrito" : checkoutStep === "CONTACT" ? "Datos de Envío" : checkoutStep === "PAYMENT" ? "Pago" : "¡Pedido Exitoso!"}
        </h2>
        <button onClick={() => { setIsCartOpen(false); if(checkoutStep==="SUCCESS") setCheckoutStep("CART"); }} style={{ fontSize: "1.5rem", background: "none", border: "none", cursor: "pointer" }}>&times;</button>
      </div>

      <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
        
        {checkoutStep === "CART" && (
          items.length === 0 ? (
            <p className="text-muted" style={{ textAlign: "center", marginTop: "40px" }}>Tu carrito está vacío.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "16px" }}>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>{item.name}</h4>
                    <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                      Cantidad: {item.quantity} 
                      {item.size && ` | Talla: ${item.size}`}
                      {item.color && ` | Color: ${item.color}`}
                    </p>
                    <p style={{ fontWeight: 500 }}>${item.price * item.quantity}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.size, item.color)} style={{ color: "#d32f2f", fontSize: "0.85rem", textDecoration: "underline", background:"none", border:"none", cursor:"pointer" }}>Quitar</button>
                </div>
              ))}
            </div>
          )
        )}

        {checkoutStep === "CONTACT" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button onClick={() => setCheckoutStep("CART")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--color-text-secondary)", fontSize: "0.9rem", cursor: "pointer", padding: 0 }}>
              ← Volver al carrito
            </button>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.85rem" }}>Nombre Completo</label>
              <input type="text" className="input-field" value={contactData.customerName} onChange={e => setContactData({...contactData, customerName: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.85rem" }}>Correo Electrónico</label>
              <input type="email" className="input-field" value={contactData.customerEmail} onChange={e => setContactData({...contactData, customerEmail: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.85rem" }}>Teléfono (WhatsApp)</label>
              <input type="tel" className="input-field" value={contactData.customerPhone} onChange={e => setContactData({...contactData, customerPhone: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.85rem" }}>Método de Entrega</label>
              <select className="input-field" value={contactData.deliveryMethod} onChange={e => setContactData({...contactData, deliveryMethod: e.target.value})}>
                <option value="Pickup">Retiro en consultorio</option>
                <option value="Delivery">Envío (Delivery / Nacional)</option>
              </select>
            </div>
            {contactData.deliveryMethod === "Delivery" && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "0.85rem" }}>Dirección Completa de Envío</label>
                <textarea className="input-field" rows={3} value={contactData.address} onChange={e => setContactData({...contactData, address: e.target.value})} />
              </div>
            )}
          </div>
        )}

        {checkoutStep === "PAYMENT" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button onClick={() => setCheckoutStep("CONTACT")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--color-text-secondary)", fontSize: "0.9rem", cursor: "pointer", padding: 0 }}>
              ← Volver a datos
            </button>
            <div style={{ padding: "16px", backgroundColor: "#fdf8f6", borderRadius: "8px", border: "1px solid #f9dad0" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "1.2rem", color: "var(--color-accent)" }}>Total a pagar: ${total}</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Método de Pago</label>
              <select className="input-field" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">Selecciona un método</option>
                <option value="pago_movil">Pago Móvil (Bs)</option>
                <option value="zelle">Zelle ($)</option>
                <option value="binance">Binance USDT ($)</option>
                <option value="efectivo">Efectivo (Presencial)</option>
              </select>
            </div>

            {paymentMethod === "pago_movil" && (
              <div style={{ backgroundColor: "var(--color-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
                <p style={{ fontWeight: 600, marginBottom: "8px" }}>Datos Pago Móvil:</p>
                <p style={{ fontSize: "0.9rem", marginBottom: "4px" }}>Banco: Banesco (0134)</p>
                <p style={{ fontSize: "0.9rem", marginBottom: "4px" }}>Teléfono: 0414-4083780</p>
                <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>Cédula: V-26345678</p>
                
                <input required type="text" placeholder="Banco de origen" className="input-field" value={paymentData.bank} onChange={e => setPaymentData({...paymentData, bank: e.target.value})} style={{ marginBottom: "8px" }} />
                <input required type="tel" placeholder="Teléfono asociado" className="input-field" value={paymentData.paymentPhone} onChange={e => setPaymentData({...paymentData, paymentPhone: e.target.value})} style={{ marginBottom: "8px" }} />
                <input required type="text" placeholder="Referencia" className="input-field" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
              </div>
            )}

            {paymentMethod === "zelle" && (
              <div style={{ backgroundColor: "var(--color-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
                <p style={{ fontWeight: 600, marginBottom: "8px" }}>Datos Zelle:</p>
                <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>Correo: carlamartinez@email.com</p>
                
                <input required type="text" placeholder="Nombre del titular Zelle" className="input-field" value={paymentData.bank} onChange={e => setPaymentData({...paymentData, bank: e.target.value})} style={{ marginBottom: "8px" }} />
                <input required type="text" placeholder="Referencia" className="input-field" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
              </div>
            )}

            {paymentMethod === "binance" && (
              <div style={{ backgroundColor: "var(--color-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
                <p style={{ fontWeight: 600, marginBottom: "8px" }}>Datos Binance:</p>
                <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>Pay ID: 123456789</p>
                
                <input required type="text" placeholder="Usuario Binance" className="input-field" value={paymentData.binanceUser} onChange={e => setPaymentData({...paymentData, binanceUser: e.target.value})} style={{ marginBottom: "8px" }} />
                <input required type="text" placeholder="Referencia" className="input-field" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
              </div>
            )}

            {paymentMethod === "efectivo" && (
              <div style={{ backgroundColor: "var(--color-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
                <p style={{ fontWeight: 600, marginBottom: "8px" }}>Pago en Efectivo:</p>
                <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>Debes llevar el dinero exacto al consultorio el día de la entrega.</p>
                <input required type="text" placeholder="¿Con qué billetes pagas? (Para dar vuelto)" className="input-field" value={paymentData.billDenomination} onChange={e => setPaymentData({...paymentData, billDenomination: e.target.value})} />
              </div>
            )}

            {paymentMethod && paymentMethod !== "efectivo" && (
              <div style={{ marginTop: "8px" }}>
                <label className="form-label" style={{ fontSize: "0.85rem" }}>Sube el comprobante de pago (OBLIGATORIO)</label>
                <input required type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="input-field" style={{ padding: "8px", fontSize: "0.9rem" }} />
              </div>
            )}
          </div>
        )}

        {checkoutStep === "SUCCESS" && (
          <div style={{ textAlign: "center", paddingTop: "40px" }}>
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🛍️</div>
            <h3 className="heading-2" style={{ color: "var(--color-accent)", marginBottom: "16px" }}>¡Pedido Recibido!</h3>
            <p className="text-muted" style={{ lineHeight: "1.6" }}>
              Hemos recibido tu pedido correctamente. Nos pondremos en contacto contigo pronto a través de WhatsApp para los detalles de la entrega.
            </p>
          </div>
        )}
      </div>

      {checkoutStep !== "SUCCESS" && items.length > 0 && (
        <div style={{ padding: "24px", borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-secondary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "1.2rem", fontWeight: 700 }}>
            <span>Total:</span>
            <span>${total}</span>
          </div>
          
          {checkoutStep === "CART" ? (
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleNextStep}>Continuar con el Envío</button>
          ) : checkoutStep === "CONTACT" ? (
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleNextStep}>Proceder con el Pago</button>
          ) : (
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleCheckout} disabled={loading}>
              {loading ? "Procesando..." : "Confirmar Pedido"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
