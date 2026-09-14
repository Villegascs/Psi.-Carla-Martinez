"use client";

import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CopyButton } from "@/components/ui/CopyButton";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const router = useRouter();
  
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

  const lenis = useLenis();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isCartOpen]);

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
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedStep = localStorage.getItem("cart_checkoutStep");
    if (savedStep) setCheckoutStep(savedStep as any);
    const savedContact = localStorage.getItem("cart_contactData");
    if (savedContact) try { setContactData(JSON.parse(savedContact)); } catch(e){}
    const savedMethod = localStorage.getItem("cart_paymentMethod");
    if (savedMethod) setPaymentMethod(savedMethod);
    const savedPayment = localStorage.getItem("cart_paymentData");
    if (savedPayment) try { setPaymentData(JSON.parse(savedPayment)); } catch(e){}
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart_checkoutStep", checkoutStep);
      localStorage.setItem("cart_contactData", JSON.stringify(contactData));
      localStorage.setItem("cart_paymentMethod", paymentMethod);
      localStorage.setItem("cart_paymentData", JSON.stringify(paymentData));
    }
  }, [checkoutStep, contactData, paymentMethod, paymentData, isInitialized]);

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

    // Validación específica por método de pago
    if (paymentMethod === "pago_movil") {
      if (!paymentData.bank) {
        alert("Por favor selecciona tu banco de origen.");
        return;
      }
      if (!paymentData.paymentId || paymentData.paymentId.length < 5) {
        alert("Por favor ingresa tu número de cédula.");
        return;
      }
      const phoneDigits = (paymentData.paymentPhone || "").replace(/\D/g, "");
      if (phoneDigits.length < 11) {
        alert("Por favor ingresa tu número de teléfono completo.");
        return;
      }
      if (!paymentData.reference) {
        alert("Por favor ingresa el número de referencia del pago.");
        return;
      }
      if (!proofFile) {
        alert("Por favor adjunta el comprobante (captura) de tu pago móvil.");
        return;
      }
    }

    if (paymentMethod === "zelle") {
      if (!paymentData.bank) {
        alert("Por favor ingresa el nombre del titular de la cuenta Zelle.");
        return;
      }
      if (!paymentData.reference) {
        alert("Por favor ingresa el número de referencia de Zelle.");
        return;
      }
      if (!proofFile) {
        alert("Por favor adjunta el comprobante de tu pago Zelle.");
        return;
      }
    }

    if (paymentMethod === "binance") {
      if (!paymentData.binanceUser) {
        alert("Por favor ingresa tu usuario de Binance.");
        return;
      }
      if (!paymentData.reference) {
        alert("Por favor ingresa el número de referencia de Binance.");
        return;
      }
      if (!proofFile) {
        alert("Por favor adjunta el comprobante de tu pago Binance.");
        return;
      }
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
            bottom: "clamp(16px, 4vw, 32px)",
            right: "clamp(16px, 4vw, 32px)",
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
        <div data-lenis-prevent="true" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px", animation: "fadeIn 0.3s", overscrollBehavior: "contain" }}>
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
            <div className="cart-drawer-body" style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: "row" }}>
              
              {/* Left Column (Forms / Cart Items) */}
              <div className="cart-drawer-content" style={{ flex: 1, padding: "32px", overflowY: "auto", overscrollBehavior: "contain" }}>
                
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
                        <div style={{ position: "relative", width: "80px", flexShrink: 0 }}>
                          <select 
                            className="input-field" 
                            style={{ 
                              width: "100%", 
                              padding: "10px", 
                              appearance: "none", 
                              WebkitAppearance: "none", 
                              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", 
                              backgroundRepeat: "no-repeat", 
                              backgroundPosition: "right 10px center",
                              paddingRight: "28px"
                            }}
                            value={contactData.customerIdType}
                            onChange={e => setContactData({...contactData, customerIdType: e.target.value})}
                          >
                            <option value="V">V</option>
                            <option value="E">E</option>
                            <option value="J">J</option>
                            <option value="G">G</option>
                            <option value="P">P</option>
                          </select>
                        </div>
                        <input 
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
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
                      <input type="tel" inputMode="numeric" pattern="[0-9]*" className="input-field" placeholder="Solo números" value={contactData.customerPhone} onChange={e => setContactData({...contactData, customerPhone: e.target.value.replace(/\D/g, '')})} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.85rem" }}>Método de Entrega</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                        {[
                          { value: "Pickup", label: "Retiro en consultorio", icon: "🏥" },
                          { value: "Delivery", label: "Envío a domicilio", icon: "🚚" },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setContactData({...contactData, deliveryMethod: opt.value})}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "6px",
                              padding: "14px 10px",
                              borderRadius: "12px",
                              border: contactData.deliveryMethod === opt.value ? "2px solid #111827" : "1.5px solid var(--color-border)",
                              background: contactData.deliveryMethod === opt.value ? "#111827" : "#fff",
                              color: contactData.deliveryMethod === opt.value ? "#fff" : "#374151",
                              cursor: "pointer",
                              transition: "all 0.18s ease",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              lineHeight: 1.3,
                              textAlign: "center",
                            }}
                          >
                            <span style={{ fontSize: "1.4rem" }}>{opt.icon}</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {contactData.deliveryMethod === "Delivery" && (
                      <>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.85rem" }}>Zona de Envío</label>
                          <div style={{ position: "relative" }}>
                            <select
                              className="input-field"
                              style={{ appearance: "none", WebkitAppearance: "none", paddingRight: "40px", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                              value={contactData.deliveryZone}
                              onChange={e => setContactData({...contactData, deliveryZone: e.target.value})}
                            >
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
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        {[
                          { value: "pago_movil", label: "Pago Móvil", sub: "Bolívares", icon: "📱" },
                          { value: "zelle",      label: "Zelle",       sub: "Dólares",   icon: "💵" },
                          { value: "binance",    label: "Binance",     sub: "USDT",       icon: "🔶" },
                          { value: "efectivo",   label: "Efectivo",    sub: "Presencial", icon: "💴" },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPaymentMethod(opt.value)}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                              padding: "14px 8px",
                              borderRadius: "12px",
                              border: paymentMethod === opt.value ? "2px solid #111827" : "1.5px solid var(--color-border)",
                              background: paymentMethod === opt.value ? "#111827" : "#fff",
                              color: paymentMethod === opt.value ? "#fff" : "#374151",
                              cursor: "pointer",
                              transition: "all 0.18s ease",
                              textAlign: "center",
                            }}
                          >
                            <span style={{ fontSize: "1.5rem" }}>{opt.icon}</span>
                            <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>{opt.label}</span>
                            <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>{opt.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {paymentMethod === "pago_movil" && (
                      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <p style={{ fontWeight: 700, margin: 0 }}>Datos Pago Móvil:</p>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <p style={{ fontSize: "0.9rem", margin: 0 }}>Banco: Banco de Venezuela (0102)</p>
                          <CopyButton text="0102" />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <p style={{ fontSize: "0.9rem", margin: 0 }}>Teléfono: 0424-4115237</p>
                          <CopyButton text="04244115237" />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                          <p style={{ fontSize: "0.9rem", margin: 0 }}>Cédula: V-20383871</p>
                          <CopyButton text="20383871" />
                        </div>
                        
                        {/* Banco selector estilizado */}
                        <div style={{ position: "relative", marginBottom: "8px" }}>
                          <select
                            required
                            className="input-field"
                            value={paymentData.bank}
                            onChange={e => setPaymentData({...paymentData, bank: e.target.value})}
                            style={{ appearance: "none", WebkitAppearance: "none", paddingRight: "40px", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                          >
                            <option value="">Selecciona tu banco de origen</option>
                            <option value="Banesco (0134)">Banesco (0134)</option>
                            <option value="Banco de Venezuela (0102)">Banco de Venezuela (0102)</option>
                            <option value="BBVA Provincial (0108)">BBVA Provincial (0108)</option>
                            <option value="Banco Mercantil (0105)">Banco Mercantil (0105)</option>
                            <option value="Banco Nacional de Crédito (0191)">Banco Nacional de Crédito (0191)</option>
                            <option value="Bancamiga (0172)">Bancamiga (0172)</option>
                            <option value="Bancaribe (0114)">Bancaribe (0114)</option>
                            <option value="Banco del Tesoro (0163)">Banco del Tesoro (0163)</option>
                            <option value="Banco Bicentenario (0175)">Banco Bicentenario (0175)</option>
                            <option value="Banco Exterior (0115)">Banco Exterior (0115)</option>
                            <option value="Banplus (0174)">Banplus (0174)</option>
                            <option value="Banco Sofitasa (0137)">Banco Sofitasa (0137)</option>
                            <option value="Banco Plaza (0138)">Banco Plaza (0138)</option>
                            <option value="Banco Caroní (0128)">Banco Caroní (0128)</option>
                            <option value="Banco Activo (0171)">Banco Activo (0171)</option>
                            <option value="100% Banco (0156)">100% Banco (0156)</option>
                            <option value="Mi Banco (0169)">Mi Banco (0169)</option>
                            <option value="Banco Agrícola (0166)">Banco Agrícola (0166)</option>
                          </select>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                          <div style={{ position: "relative", width: "70px", flexShrink: 0 }}>
                            <select 
                              className="input-field" 
                              style={{ 
                                width: "100%",
                                padding: "10px", 
                                appearance: "none", 
                                WebkitAppearance: "none", 
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", 
                                backgroundRepeat: "no-repeat", 
                                backgroundPosition: "right 8px center",
                                paddingRight: "24px"
                              }}
                              value={paymentData.paymentIdType}
                              onChange={e => setPaymentData({...paymentData, paymentIdType: e.target.value})}
                            >
                              <option value="V">V</option>
                              <option value="E">E</option>
                            </select>
                          </div>
                          <input required type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Cédula" className="input-field" value={paymentData.paymentId} onChange={e => setPaymentData({...paymentData, paymentId: e.target.value.replace(/\D/g, '')})} style={{ flex: 1 }} />
                        </div>
                        {/* Prefijo teléfono: pills */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                          <div style={{ display: "flex", borderRadius: "10px", border: "1px solid var(--color-border)", overflow: "hidden", flexShrink: 0 }}>
                            {["0414","0424","0412","0416","0426","0212"].map((pfx, i, arr) => (
                              <button key={pfx} type="button"
                                onClick={() => setPaymentData({...paymentData, paymentPhone: pfx + (paymentData.paymentPhone || "0414").substring(4)})}
                                style={{ padding: "12px 9px", fontWeight: 600, fontSize: "0.78rem", border: "none", borderRight: i < arr.length - 1 ? "1px solid var(--color-border)" : "none", cursor: "pointer", background: (paymentData.paymentPhone || "0414").substring(0,4) === pfx ? "#111827" : "#fff", color: (paymentData.paymentPhone || "0414").substring(0,4) === pfx ? "#fff" : "#6b7280", transition: "all 0.15s ease", whiteSpace: "nowrap" }}
                              >{pfx}</button>
                            ))}
                          </div>
                        </div>
                        <input required type="text" inputMode="numeric" pattern="[0-9]*" placeholder="7 dígitos" className="input-field" value={(paymentData.paymentPhone || "0414").substring(4)} onChange={e => setPaymentData({...paymentData, paymentPhone: (paymentData.paymentPhone || "0414").substring(0,4) + e.target.value.replace(/\D/g, '')})} style={{ marginBottom: "8px" }} />
                        <input required type="text" placeholder="Referencia" className="input-field" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
                      </div>
                    )}

                    {paymentMethod === "zelle" && (
                      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
                        <p style={{ fontWeight: 700, marginBottom: "12px" }}>Datos Zelle:</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                          <p style={{ fontSize: "0.9rem", margin: 0 }}>Correo: carlamartinez@email.com</p>
                          <CopyButton text="carlamartinez@email.com" />
                        </div>
                        
                        <input required type="text" placeholder="Nombre del titular Zelle" className="input-field" value={paymentData.bank} onChange={e => setPaymentData({...paymentData, bank: e.target.value})} style={{ marginBottom: "8px" }} />
                        <input required type="text" placeholder="Referencia" className="input-field" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
                      </div>
                    )}

                    {paymentMethod === "binance" && (
                      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
                        <p style={{ fontWeight: 700, marginBottom: "12px" }}>Datos Binance:</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                          <p style={{ fontSize: "0.9rem", margin: 0 }}>Binance Pay ID: 123456789</p>
                          <CopyButton text="123456789" />
                        </div>
                        
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
                    <p className="text-muted" style={{ lineHeight: "1.6", maxWidth: "400px", margin: "0 auto", marginBottom: "32px" }}>
                      Hemos recibido tu pedido correctamente. Nos pondremos en contacto contigo pronto a través de WhatsApp para coordinar los detalles.
                    </p>
                    <button 
                      className="btn-primary" 
                      onClick={() => {
                        setIsCartOpen(false);
                        setCheckoutStep("CART");
                        router.push("/");
                      }}
                      style={{ padding: "14px 32px", fontSize: "1rem" }}
                    >
                      Volver al inicio
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column (Order Summary) */}
              {checkoutStep !== "SUCCESS" && items.length > 0 && (
                <div className="cart-drawer-summary" style={{ width: "320px", backgroundColor: "#fff", borderLeft: "1px solid var(--color-border)", padding: "32px", display: "flex", flexDirection: "column" }}>
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
