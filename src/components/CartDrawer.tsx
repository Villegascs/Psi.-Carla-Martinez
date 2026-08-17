"use client";

import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, total, clearCart } = useCart();
  
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [eurRate, setEurRate] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/bcv")
      .then(res => res.json())
      .then(data => {
        if (data.usd) setBcvRate(data.usd);
        if (data.eur) setEurRate(data.eur);
      })
      .catch(console.error);
  }, []);

  // Checkout steps: CART -> CONTACT -> PAYMENT -> SUCCESS
  const [checkoutStep, setCheckoutStep] = useState<"CART" | "CONTACT" | "PAYMENT" | "SUCCESS">("CART");
  
  const [contactData, setContactData] = useState({
    customerName: "",
    customerIdType: "V",
    customerId: "",
    customerEmail: "",
    customerPhone: "",
    deliveryMethod: "Pickup", // "Pickup" or "Delivery"
    deliveryZone: "",
    address: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentData, setPaymentData] = useState({
    bank: "", paymentIdType: "V", paymentId: "", paymentPhone: "", binanceUser: "", reference: "", billDenomination: ""
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleNextStep = () => {
    if (checkoutStep === "CART") {
      if (items.length === 0) return;
      setCheckoutStep("CONTACT");
    } else if (checkoutStep === "CONTACT") {
      if (!contactData.customerName || !contactData.customerId || !contactData.customerEmail || !contactData.customerPhone) {
        alert("Por favor completa tus datos personales y de contacto.");
        return;
      }
      if (contactData.deliveryMethod === "Delivery") {
        if (!contactData.deliveryZone) {
          alert("Por favor selecciona una zona de envío.");
          return;
        }
        if (!contactData.address) {
          alert("Por favor ingresa tu dirección de entrega.");
          return;
        }
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
        
        const trackingUrl = `${window.location.origin}/tienda/ordenes/${data.orderId}`;
        const wpMessage = `Hola Carla, acabo de realizar un pedido en la tienda.\nAquí está mi enlace de seguimiento: ${trackingUrl}`;
        const wpUrl = `https://wa.me/584144083780?text=${encodeURIComponent(wpMessage)}`;
        window.open(wpUrl, '_blank');
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
    <>
      {/* Botón flotante del carrito */}
      {!isCartOpen && totalQuantity > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "64px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            cursor: "pointer",
            zIndex: 999,
            transition: "transform 0.2s ease"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          {/* Badge de cantidad */}
          <div style={{
            position: "absolute",
            top: "-5px",
            right: "-5px",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.85rem",
            fontWeight: 700,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
            {totalQuantity}
          </div>
        </button>
      )}

      {/* Modal del Carrito (Wizard) */}
      {isCartOpen && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px", animation: "fadeIn 0.3s" }}>
          <div style={{ backgroundColor: "#f9fafb", borderRadius: "16px", width: "100%", maxWidth: "1000px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <button onClick={() => { setIsCartOpen(false); if(checkoutStep==="SUCCESS") setCheckoutStep("CART"); }} style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-text-secondary)", zIndex: 10 }}>&times;</button>
            
            {/* Stepper Header */}
            <div style={{ padding: "24px 32px", backgroundColor: "#fff", borderBottom: "1px solid var(--color-border)" }}>
              <h2 className="heading-2" style={{ margin: "0 0 12px 0", fontSize: "1.5rem" }}>
                {checkoutStep === "CART" ? "Tu Carrito" : checkoutStep === "CONTACT" ? "Datos de Envío" : checkoutStep === "PAYMENT" ? "Pago" : "¡Pedido Exitoso!"}
              </h2>
              {checkoutStep !== "SUCCESS" && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  <span style={{ color: checkoutStep === "CART" ? "var(--color-accent)" : "inherit" }}>1. Carrito</span>
                  <span>/</span>
                  <span style={{ color: checkoutStep === "CONTACT" ? "var(--color-accent)" : "inherit" }}>2. Envío</span>
                  <span>/</span>
                  <span style={{ color: checkoutStep === "PAYMENT" ? "var(--color-accent)" : "inherit" }}>3. Pago</span>
                </div>
              )}
            </div>

            {/* Main Content Area (2 columns) */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: "row" }}>
              
              {/* Left Column (Forms / Cart Items) */}
              <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
                
                {checkoutStep === "CART" && (
                  items.length === 0 ? (
                    <p className="text-muted" style={{ textAlign: "center", marginTop: "40px" }}>Tu carrito está vacío.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      {items.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: "16px", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "24px" }}>
                          {/* Image */}
                          <div style={{ width: "80px", height: "80px", borderRadius: "8px", backgroundColor: "#fff", border: "1px solid var(--color-border)", overflow: "hidden", flexShrink: 0 }}>
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: "0.8rem" }}>Sin foto</div>
                            )}
                          </div>
                          
                          {/* Details */}
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "4px" }}>{item.name}</h4>
                            <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "8px" }}>
                              {item.size && `Talla: ${item.size}`}
                              {item.size && item.color && ` | `}
                              {item.color && `Color: ${item.color}`}
                            </p>
                            <p style={{ fontWeight: 700, color: "var(--color-accent)" }}>€{item.price}</p>
                          </div>
                          
                          {/* Quantity Controls & Delete */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                            <button onClick={() => removeFromCart(item.id, item.size, item.color)} style={{ color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem" }}>
                              Eliminar <span style={{ fontSize: "1.1rem" }}>&times;</span>
                            </button>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid var(--color-border)", borderRadius: "30px", padding: "4px 12px", backgroundColor: "#fff" }}>
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>-</button>
                              <span style={{ fontWeight: 600, width: "20px", textAlign: "center" }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>+</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {checkoutStep === "CONTACT" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px" }}>
                    <button onClick={() => setCheckoutStep("CART")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--color-text-secondary)", fontSize: "0.9rem", cursor: "pointer", padding: 0 }}>
                      ← Volver al carrito
                    </button>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.85rem" }}>Nombre Completo</label>
                      <input type="text" className="input-field" value={contactData.customerName} onChange={e => setContactData({...contactData, customerName: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.85rem" }}>Cédula / Documento de Identidad</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select 
                          className="input-field" 
                          style={{ width: "80px", padding: "10px" }}
                          value={contactData.customerIdType}
                          onChange={e => setContactData({...contactData, customerIdType: e.target.value})}
                        >
                          <option value="V">V</option>
                          <option value="E">E</option>
                          <option value="J">J</option>
                          <option value="G">G</option>
                          <option value="P">P</option>
                        </select>
                        <input 
                          type="text" 
                          className="input-field" 
                          style={{ flex: 1 }}
                          placeholder="Solo números"
                          value={contactData.customerId} 
                          onChange={e => setContactData({...contactData, customerId: e.target.value.replace(/\D/g, '')})} 
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.85rem" }}>Correo Electrónico</label>
                      <input type="email" className="input-field" value={contactData.customerEmail} onChange={e => setContactData({...contactData, customerEmail: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.85rem" }}>Teléfono (WhatsApp)</label>
                      <input type="tel" className="input-field" placeholder="Solo números" value={contactData.customerPhone} onChange={e => setContactData({...contactData, customerPhone: e.target.value.replace(/\D/g, '')})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.85rem" }}>Método de Entrega</label>
                      <select className="input-field" value={contactData.deliveryMethod} onChange={e => setContactData({...contactData, deliveryMethod: e.target.value})}>
                        <option value="Pickup">Retiro en consultorio</option>
                        <option value="Delivery">Envío (Delivery / Nacional)</option>
                      </select>
                    </div>
                    {contactData.deliveryMethod === "Delivery" && (
                      <>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.85rem" }}>Zona de Envío</label>
                          <select className="input-field" value={contactData.deliveryZone} onChange={e => setContactData({...contactData, deliveryZone: e.target.value})}>
                            <option value="">Selecciona tu zona</option>
                            <option value="Valencia Norte">Valencia Norte</option>
                            <option value="Valencia Centro">Valencia Centro</option>
                            <option value="Valencia Sur">Valencia Sur</option>
                            <option value="San Diego">San Diego</option>
                            <option value="Naguanagua">Naguanagua</option>
                            <option value="Los Guayos">Los Guayos</option>
                            <option value="Otra Ciudad / Envío Nacional">Otra Ciudad / Envío Nacional</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.85rem" }}>Dirección Completa de Envío</label>
                          <textarea className="input-field" rows={3} value={contactData.address} onChange={e => setContactData({...contactData, address: e.target.value})} placeholder="Especifica calle, urbanización, número de casa, etc..." />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {checkoutStep === "PAYMENT" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px" }}>
                    <button onClick={() => setCheckoutStep("CONTACT")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--color-text-secondary)", fontSize: "0.9rem", cursor: "pointer", padding: 0 }}>
                      ← Volver a datos
                    </button>
                    
                    <div className="form-group">
                      <label className="form-label">Método de Pago</label>
                      <select className="input-field" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <option value="">Selecciona un método</option>
                        <option value="pago_movil">Pago Móvil (Bs)</option>
                        <option value="zelle">Zelle</option>
                        <option value="binance">Binance USDT</option>
                        <option value="efectivo">Efectivo (Presencial)</option>
                      </select>
                    </div>

                    {paymentMethod === "pago_movil" && (
                      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <p style={{ fontWeight: 700, margin: 0 }}>Datos Pago Móvil:</p>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <p style={{ fontSize: "0.9rem", margin: 0 }}>Banco: Banesco (0134)</p>
                          <button onClick={() => navigator.clipboard.writeText("0134")} style={{ background: "none", border: "none", color: "var(--color-accent)", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", padding: "4px" }}>Copiar</button>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <p style={{ fontSize: "0.9rem", margin: 0 }}>Teléfono: 0414-4083780</p>
                          <button onClick={() => navigator.clipboard.writeText("04144083780")} style={{ background: "none", border: "none", color: "var(--color-accent)", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", padding: "4px" }}>Copiar</button>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                          <p style={{ fontSize: "0.9rem", margin: 0 }}>Cédula: V-26345678</p>
                          <button onClick={() => navigator.clipboard.writeText("26345678")} style={{ background: "none", border: "none", color: "var(--color-accent)", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline", padding: "4px" }}>Copiar</button>
                        </div>
                        
                        <select required className="input-field" value={paymentData.bank} onChange={e => setPaymentData({...paymentData, bank: e.target.value})} style={{ marginBottom: "8px" }}>
                          <option value="">Selecciona tu banco de origen</option>
                          <option value="0102 - Banco de Venezuela">0102 - Banco de Venezuela</option>
                          <option value="0104 - Venezolano de Crédito">0104 - Venezolano de Crédito</option>
                          <option value="0105 - Mercantil">0105 - Mercantil</option>
                          <option value="0108 - Provincial">0108 - Provincial</option>
                          <option value="0114 - Bancaribe">0114 - Bancaribe</option>
                          <option value="0115 - Exterior">0115 - Exterior</option>
                          <option value="0128 - Banco Caroní">0128 - Banco Caroní</option>
                          <option value="0134 - Banesco">0134 - Banesco</option>
                          <option value="0137 - Sofitasa">0137 - Sofitasa</option>
                          <option value="0138 - Plaza">0138 - Plaza</option>
                          <option value="0151 - Fondo Común (BFC)">0151 - Fondo Común (BFC)</option>
                          <option value="0156 - 100% Banco">0156 - 100% Banco</option>
                          <option value="0157 - Del Sur">0157 - Del Sur</option>
                          <option value="0163 - Tesoro">0163 - Tesoro</option>
                          <option value="0166 - Agrícola de Venezuela">0166 - Agrícola de Venezuela</option>
                          <option value="0168 - Bancrecer">0168 - Bancrecer</option>
                          <option value="0169 - Mi Banco">0169 - Mi Banco</option>
                          <option value="0171 - Activo">0171 - Activo</option>
                          <option value="0172 - Bancamiga">0172 - Bancamiga</option>
                          <option value="0174 - Banplus">0174 - Banplus</option>
                          <option value="0175 - Bicentenario">0175 - Bicentenario</option>
                          <option value="0177 - Banfanb">0177 - Banfanb</option>
                          <option value="0191 - BNC">0191 - BNC</option>
                        </select>
                        <input required type="tel" placeholder="Teléfono asociado" className="input-field" value={paymentData.paymentPhone} onChange={e => setPaymentData({...paymentData, paymentPhone: e.target.value})} style={{ marginBottom: "8px" }} />
                        <input required type="text" placeholder="Referencia" className="input-field" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
                      </div>
                    )}

                    {paymentMethod === "zelle" && (
                      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
                        <p style={{ fontWeight: 700, marginBottom: "12px" }}>Datos Zelle:</p>
                        <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>Correo: carlamartinez@email.com</p>
                        
                        <input required type="text" placeholder="Nombre del titular Zelle" className="input-field" value={paymentData.bank} onChange={e => setPaymentData({...paymentData, bank: e.target.value})} style={{ marginBottom: "8px" }} />
                        <input required type="text" placeholder="Referencia" className="input-field" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
                      </div>
                    )}

                    {paymentMethod === "binance" && (
                      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
                        <p style={{ fontWeight: 700, marginBottom: "12px" }}>Datos Binance:</p>
                        <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>Pay ID: 123456789</p>
                        
                        <input required type="text" placeholder="Usuario Binance" className="input-field" value={paymentData.binanceUser} onChange={e => setPaymentData({...paymentData, binanceUser: e.target.value})} style={{ marginBottom: "8px" }} />
                        <input required type="text" placeholder="Referencia" className="input-field" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
                      </div>
                    )}

                    {paymentMethod === "efectivo" && (
                      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
                        <p style={{ fontWeight: 700, marginBottom: "12px" }}>Pago en Efectivo:</p>
                        <p style={{ fontSize: "0.9rem", marginBottom: "16px" }}>Debes llevar el dinero exacto al consultorio el día de la entrega.</p>
                        <input required type="text" placeholder="¿Con qué billetes pagas? (Para dar vuelto)" className="input-field" value={paymentData.billDenomination} onChange={e => setPaymentData({...paymentData, billDenomination: e.target.value})} />
                      </div>
                    )}

                    {paymentMethod && paymentMethod !== "efectivo" && (
                      <div style={{ marginTop: "8px" }}>
                        <label className="form-label" style={{ fontSize: "0.85rem" }}>Sube el comprobante de pago (OBLIGATORIO)</label>
                        <input required type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="input-field" style={{ padding: "8px", fontSize: "0.9rem", backgroundColor: "#fff" }} />
                      </div>
                    )}
                  </div>
                )}

                {checkoutStep === "SUCCESS" && (
                  <div style={{ textAlign: "center", paddingTop: "60px" }}>
                    <div style={{ fontSize: "5rem", marginBottom: "24px" }}>🛍️</div>
                    <h3 className="heading-2" style={{ color: "var(--color-accent)", marginBottom: "16px" }}>¡Pedido Recibido!</h3>
                    <p className="text-muted" style={{ lineHeight: "1.6", maxWidth: "400px", margin: "0 auto" }}>
                      Hemos recibido tu pedido correctamente. Nos pondremos en contacto contigo pronto a través de WhatsApp para coordinar los detalles.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column (Order Summary) */}
              {checkoutStep !== "SUCCESS" && items.length > 0 && (
                <div style={{ width: "320px", backgroundColor: "#fff", borderLeft: "1px solid var(--color-border)", padding: "32px", display: "flex", flexDirection: "column" }}>
                   <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px" }}>Resumen del pedido</h3>
                   
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
                     <span>Costo de productos</span>
                     <span>€{total}</span>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
                     <span>Envío</span>
                     <span>Por calcular</span>
                   </div>

                   <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--color-border)", paddingTop: "16px", marginBottom: "32px" }}>
                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: 800, color: "var(--color-accent)" }}>
                       <span>Total (EUR)</span>
                       <span>€{total}</span>
                     </div>
                     {eurRate && (
                       <>
                         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                           <span>Total (Bs)</span>
                           <span>Bs. {(total * eurRate).toFixed(2)}</span>
                         </div>
                         <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "4px" }}>
                           Tasa EUR BCV: Bs. {eurRate.toFixed(2)}
                         </div>
                       </>
                     )}
                   </div>
                   
                   {checkoutStep === "CART" ? (
                     <button className="btn-primary" style={{ width: "100%", padding: "16px" }} onClick={handleNextStep}>Ir a pagar</button>
                   ) : checkoutStep === "CONTACT" ? (
                     <button className="btn-primary" style={{ width: "100%", padding: "16px" }} onClick={handleNextStep}>Proceder con el Pago</button>
                   ) : (
                     <button className="btn-primary" style={{ width: "100%", padding: "16px" }} onClick={handleCheckout} disabled={loading}>
                       {loading ? "Procesando..." : "Confirmar Pedido"}
                     </button>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
