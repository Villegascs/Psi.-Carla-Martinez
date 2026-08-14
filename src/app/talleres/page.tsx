"use client";

import { useState, useEffect } from "react";



const VENEZUELAN_BANKS = [
  "Banco de Venezuela", "Banesco", "Mercantil", "Provincial", "BNC", 
  "Bancaribe", "Banco Exterior", "Banco del Tesoro", "Banco Bicentenario", "Banplus", "Banco Plaza"
];

const CopyableText = ({ label, text }: { label: string, text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", backgroundColor: "white", padding: "8px 12px", borderRadius: "6px", border: "1px solid #f9dad0" }}>
      <div>
        <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", display: "block" }}>{label}</span>
        <span style={{ fontWeight: 600, color: "var(--color-text)", userSelect: "all" }}>{text}</span>
      </div>
      <button type="button" onClick={handleCopy} style={{ background: copied ? "#fef2f2" : "var(--color-surface)", border: "1px solid #f9dad0", borderRadius: "4px", padding: "6px 10px", fontSize: "0.8rem", cursor: "pointer", color: copied ? "var(--color-accent)" : "var(--color-text-secondary)", fontWeight: copied ? 600 : 400, transition: "0.2s" }}>
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </div>
  );
};

export default function TalleresPage() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);
  const [viewState, setViewState] = useState<"list" | "detail" | "form" | "success">("list");
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [exchangeRates, setExchangeRates] = useState({ usd: 0, eur: 0 });
  const [buyerEmail, setBuyerEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [participants, setParticipants] = useState([{ firstName: "", lastName: "", idType: "V", idNumber: "" }]);
  
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentData, setPaymentData] = useState({
    bank: "",
    paymentIdType: "V",
    paymentId: "",
    paymentPhone: "",
    binanceUser: "",
    reference: "",
    billDenomination: ""
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/workshops")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWorkshops(data.workshops);
          
          // Actualizar el taller seleccionado si estaba cacheado en sessionStorage
          setSelectedWorkshop((current: any) => {
            if (current && current.id) {
              const updated = data.workshops.find((w: any) => w.id === current.id);
              return updated || current;
            }
            return current;
          });
        }
        setLoadingWorkshops(false);
      })
      .catch(e => {
        console.error("Error fetching workshops:", e);
        setLoadingWorkshops(false);
      });
  }, []);

  useEffect(() => {
    const savedState = sessionStorage.getItem("talleresFormState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.viewState && parsed.viewState !== "success") setViewState(parsed.viewState);
        if (parsed.selectedWorkshop) setSelectedWorkshop(parsed.selectedWorkshop);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.buyerEmail) setBuyerEmail(parsed.buyerEmail);
        if (parsed.quantity) setQuantity(parsed.quantity);
        if (parsed.participants) setParticipants(parsed.participants);
        if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
        if (parsed.paymentData) setPaymentData(parsed.paymentData);
      } catch (e) {
        console.error("Error cargando sesión:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (viewState !== "list" && viewState !== "success") {
      sessionStorage.setItem("talleresFormState", JSON.stringify({
        viewState, selectedWorkshop, currentStep, buyerEmail, quantity, participants, paymentMethod, paymentData
      }));
    } else if (viewState === "success" || viewState === "list") {
      sessionStorage.removeItem("talleresFormState");
    }
  }, [viewState, selectedWorkshop, currentStep, buyerEmail, quantity, participants, paymentMethod, paymentData]);

  useEffect(() => {
    fetch("/api/bcv")
      .then(res => res.json())
      .then(data => {
        if (data.usd && data.eur) {
          setExchangeRates({ usd: data.usd, eur: data.eur });
        }
      })
      .catch(e => console.error("Error fetching rates:", e));
  }, []);

  const handleQuantityChange = (qty: number) => {
    if (qty < 1 || qty > 10) return; // Límites entre 1 y 10
    setQuantity(qty);
    
    // Adjust participants array size
    const newParticipants = [...participants];
    if (qty > newParticipants.length) {
      for (let i = newParticipants.length; i < qty; i++) {
        newParticipants.push({ firstName: "", lastName: "", idType: "V", idNumber: "" });
      }
    } else {
      newParticipants.splice(qty);
    }
    setParticipants(newParticipants);
  };

  const handleParticipantChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newParticipants = [...participants];
    let val = e.target.value;
    if (e.target.name === "idNumber") {
      val = val.replace(/\D/g, ''); // Sólo números
    }
    newParticipants[index] = { ...newParticipants[index], [e.target.name]: val };
    setParticipants(newParticipants);
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let val = e.target.value;
    if (e.target.name === "paymentId" || e.target.name === "paymentPhone") {
      val = val.replace(/\D/g, ''); // Sólo números
    }
    setPaymentData({ ...paymentData, [e.target.name]: val });
  };

  const handleOpenDetail = (workshop: any) => {
    setSelectedWorkshop(workshop);
    setViewState("detail");
  };

  const handleOpenForm = () => {
    setErrorMsg("");
    setCurrentStep(1);
    setBuyerEmail("");
    setQuantity(1);
    setParticipants([{ firstName: "", lastName: "", idType: "V", idNumber: "" }]);
    setPaymentMethod("");
    setFile(null);
    setViewState("form");
  };

  const handleNextStep = () => {
    // Validate Step 1
    if (currentStep === 1) {
      const isValid = participants.every(p => p.firstName && p.lastName && p.idNumber);
      if (!isValid) {
        setErrorMsg("Por favor, completa los datos de todos los participantes.");
        return;
      }
      setErrorMsg("");
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) return; // Managed by Next Step

    if (!paymentMethod) {
      setErrorMsg("Debes seleccionar un método de pago.");
      return;
    }
    if (!buyerEmail) {
      setErrorMsg("Debes ingresar un correo electrónico.");
      return;
    }
    if (paymentMethod !== "efectivo" && !file) {
      setErrorMsg("Debes subir el comprobante de pago.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const data = new FormData();
    data.append("workshopName", selectedWorkshop.title);
    data.append("quantity", quantity.toString());
    data.append("participants", JSON.stringify(participants));
    data.append("paymentMethod", paymentMethod);
    data.append("paymentData", JSON.stringify(paymentData));
    data.append("buyerEmail", buyerEmail);
    
    if (file) {
      data.append("paymentProof", file);
    }

    try {
      const res = await fetch("/api/workshops", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const text = await res.text();
        let errorText = "";
        try {
          const errData = JSON.parse(text);
          errorText = errData.error || "Error desconocido";
        } catch (e) {
          errorText = text;
        }
        throw new Error(`Error ${res.status}: ${errorText.substring(0, 150)}...`);
      }

      const resData = await res.json();

      if (resData.success) {
        setViewState("success");
      } else {
        setErrorMsg(resData.error || "Hubo un error en la inscripción.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "60px" }}>
      
      {viewState === "list" && (
        <>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 className="heading-1">Próximos Talleres</h1>
            <p className="text-muted">Inscríbete y participa en nuestros eventos de psicología.</p>
          </div>

          {loadingWorkshops ? (
            <p style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>Cargando talleres...</p>
          ) : workshops.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>No hay talleres disponibles en este momento.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
              {workshops.map((workshop) => (
                <div 
                  key={workshop.id} 
                  className="card" 
                  style={{ position: "relative", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", transition: "transform 0.2s" }}
                  onClick={() => handleOpenDetail(workshop)}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div style={{ position: "absolute", top: "16px", left: "16px", backgroundColor: "rgba(255,255,255,0.9)", padding: "6px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-accent)", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", backdropFilter: "blur(4px)" }}>
                    {workshop.type || 'Presencial'}
                  </div>
                  <img src={workshop.image} alt={workshop.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px", color: "var(--color-text)" }}>{workshop.title}</h3>
                    <p className="text-muted" style={{ fontSize: "0.9rem", flexGrow: 1, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {workshop.description || "Taller de psicología y crecimiento personal."}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)" }}>{workshop.date || 'Próximamente'}</span>
                      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-accent)", padding: "4px 12px", backgroundColor: "var(--color-surface)", borderRadius: "20px" }}>
                        {workshop.price.replace('$', '€')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {viewState === "detail" && selectedWorkshop && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <img src={selectedWorkshop.image} alt={selectedWorkshop.title} style={{ width: "100%", height: "300px", objectFit: "cover" }} />
          <div style={{ padding: "32px" }}>
            <button 
              onClick={() => setViewState("list")}
              style={{ background: "none", border: "none", color: "var(--color-accent)", fontWeight: 600, cursor: "pointer", marginBottom: "16px", padding: 0 }}
            >
              ← Volver a todos los talleres
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
              <h1 className="heading-1" style={{ margin: 0 }}>{selectedWorkshop.title}</h1>
              <span style={{ backgroundColor: "#fef2f2", color: "var(--color-accent)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.9rem", fontWeight: 700, border: "1px solid #f9dad0" }}>
                {selectedWorkshop.type || 'Presencial'}
              </span>
            </div>
            
            <div style={{ display: "flex", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ backgroundColor: "var(--color-surface)", padding: "12px 20px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                <strong style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>FECHA</strong>
                <span>{selectedWorkshop.date}</span>
              </div>
              <div style={{ backgroundColor: "var(--color-surface)", padding: "12px 20px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                <strong style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>PRECIO</strong>
                <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>
                  {selectedWorkshop.price.replace('$', '€')}
                  {exchangeRates.eur > 0 && (
                    <span style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", fontWeight: 500, marginLeft: "8px" }}>
                      | {(parseFloat(selectedWorkshop.price.replace(/[^\d.]/g, '')) * exchangeRates.eur).toFixed(2)} Bs
                    </span>
                  )}
                </span>
              </div>

            </div>

            <h3 className="heading-2" style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Descripción</h3>
            <p className="text-muted" style={{ marginBottom: "24px", lineHeight: "1.6" }}>{selectedWorkshop.description}</p>

            {selectedWorkshop.points && (
              <div style={{ marginBottom: "24px" }}>
                <h3 className="heading-2" style={{ fontSize: "1.2rem", marginBottom: "12px" }}>Lo que incluye:</h3>
                <ul style={{ paddingLeft: "24px", color: "var(--color-text-secondary)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedWorkshop.points.split('\n').filter((p: string) => p.trim()).map((point: string, i: number) => (
                    <li key={i}>{point.trim()}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className="btn-primary" style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }} onClick={handleOpenForm}>
              Reservar mi Cupo Ahora
            </button>
          </div>
        </div>
      )}

      {viewState === "form" && selectedWorkshop && (
        <div className="card" style={{ maxWidth: "700px", margin: "0 auto", padding: "32px", position: "relative" }}>
          <button 
            onClick={() => setViewState("detail")}
            style={{ background: "none", border: "none", color: "var(--color-accent)", fontWeight: 600, cursor: "pointer", marginBottom: "16px", padding: 0 }}
          >
            ← Volver a detalles
          </button>
          
          {/* Stepper Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", position: "relative" }}>
            <div style={{ position: "absolute", top: "15px", left: "10%", right: "10%", height: "2px", background: "var(--color-border)", zIndex: 0 }}></div>
            <div style={{ position: "absolute", top: "15px", left: "10%", right: "50%", height: "2px", background: currentStep === 2 ? "var(--color-accent)" : "transparent", transition: "0.3s", zIndex: 0 }}></div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginBottom: "8px" }}>1</div>
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Selección</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: currentStep === 2 ? "var(--color-accent)" : "var(--color-surface)", border: currentStep === 2 ? "none" : "2px solid var(--color-border)", color: currentStep === 2 ? "white" : "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginBottom: "8px", transition: "0.3s" }}>2</div>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: currentStep === 2 ? "var(--color-text)" : "var(--color-text-secondary)" }}>Pago</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem" }}>
                {errorMsg}
              </div>
            )}

            {currentStep === 1 && (
              <div className="fade-in">
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px" }}>¿Cuántas entradas deseas?</h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button 
                      type="button" 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      style={{ width: "40px", height: "40px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "white", fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: quantity <= 1 ? "not-allowed" : "pointer", color: quantity <= 1 ? "#ccc" : "var(--color-text)", paddingBottom: "4px" }}
                    >-</button>
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold", width: "30px", textAlign: "center" }}>{quantity}</span>
                    <button 
                      type="button" 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 10}
                      style={{ width: "40px", height: "40px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "white", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: quantity >= 10 ? "not-allowed" : "pointer", color: quantity >= 10 ? "#ccc" : "var(--color-text)" }}
                    >+</button>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "8px" }}>Total a pagar:</span>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                      <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>
                        {quantity * parseInt(selectedWorkshop.price.replace('$', '').replace('€', ''))}€
                      </span>
                      <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-accent)", lineHeight: 1 }}>
                        {exchangeRates.eur > 0 ? (quantity * parseInt(selectedWorkshop.price.replace('$', '').replace('€', '')) * exchangeRates.eur).toFixed(2) : "..."} Bs
                      </span>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px" }}>Datos de los Participantes</h3>
                {participants.map((participant, index) => (
                  <div key={index} style={{ marginBottom: "24px", padding: "20px", backgroundColor: "var(--color-surface)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "16px", color: "var(--color-accent)" }}>Participante {index + 1}</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Nombre</label>
                        <input required type="text" name="firstName" value={participant.firstName} onChange={(e) => handleParticipantChange(index, e)} className="input-field" placeholder="Ej. Ana" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Apellido</label>
                        <input required type="text" name="lastName" value={participant.lastName} onChange={(e) => handleParticipantChange(index, e)} className="input-field" placeholder="Ej. Gómez" />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.8rem" }}>Cédula de Identidad</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select name="idType" value={participant.idType} onChange={(e) => handleParticipantChange(index, e)} className="input-field" style={{ width: "70px", padding: "12px 8px" }}>
                          <option value="V">V</option>
                          <option value="E">E</option>
                          <option value="J">J</option>
                          <option value="G">G</option>
                          <option value="P">P</option>
                        </select>
                        <input required type="text" inputMode="numeric" pattern="[0-9]*" name="idNumber" value={participant.idNumber} onChange={(e) => handleParticipantChange(index, e)} className="input-field" placeholder="12345678" style={{ flexGrow: 1 }} />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={handleNextStep} className="btn-primary" style={{ width: "100%", padding: "16px", marginTop: "16px" }}>
                  Continuar al Pago →
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="fade-in">
                <button 
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{ background: "none", border: "none", color: "var(--color-text-secondary)", fontSize: "0.9rem", cursor: "pointer", marginBottom: "16px", padding: 0 }}
                >
                  ← Volver a participantes
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--color-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "24px" }}>
                  <div>
                    <h4 style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "4px" }}>Total a Pagar</h4>
                    <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>{quantity * parseInt(selectedWorkshop.price.replace('$', '').replace('€', ''))}€</span>
                      <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-secondary)", margin: "0 8px" }}>|</span>
                      <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}>
                        {exchangeRates.eur > 0 ? (quantity * parseInt(selectedWorkshop.price.replace('$', '').replace('€', '')) * exchangeRates.eur).toFixed(2) : "..."} Bs
                      </span>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "8px", marginBottom: "16px" }}>Método de Pago</h3>
                <div className="form-group">
                  <select required className="input-field" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="">Selecciona un método</option>
                    <option value="pago_movil">Pago Móvil (Bs)</option>
                    <option value="zelle">Zelle (€)</option>
                    <option value="binance">Binance USDT (€)</option>
                    <option value="efectivo">Efectivo (Presencial)</option>
                  </select>
                </div>

                {paymentMethod && paymentMethod !== "efectivo" && (
                  <div style={{ backgroundColor: "#fdf8f6", padding: "20px", borderRadius: "8px", marginBottom: "24px", border: "1px solid #f9dad0" }}>
                    <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", marginBottom: "24px" }}>
                      <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-text)" }}>
                        {quantity * parseInt(selectedWorkshop.price.replace('$', '').replace('€', ''))}€
                      </span>
                      <span style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--color-text-secondary)", margin: "0 10px" }}>|</span>
                      <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-accent)" }}>
                        {exchangeRates.eur > 0 ? (quantity * parseInt(selectedWorkshop.price.replace('$', '').replace('€', '')) * exchangeRates.eur).toFixed(2) : "..."} Bs
                      </span>
                    </div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "16px" }}>Datos para realizar el pago:</h4>
                    
                    {paymentMethod === "pago_movil" && (
                      <>
                        <CopyableText label="Banco" text="Banesco (0134)" />
                        <CopyableText label="Cédula de Identidad" text="V-25417859" />
                        <CopyableText label="Teléfono" text="04144083780" />
                      </>
                    )}
                    
                    {paymentMethod === "zelle" && (
                      <>
                        <CopyableText label="Correo Zelle" text="carlamartinez@email.com" />
                        <CopyableText label="Titular" text="Carla Martinez" />
                      </>
                    )}
                    
                    {paymentMethod === "binance" && (
                      <>
                        <CopyableText label="Binance Pay ID" text="254897125" />
                      </>
                    )}
                  </div>
                )}

                {paymentMethod === "pago_movil" && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Banco Emisor</label>
                        <select required name="bank" className="input-field" value={paymentData.bank} onChange={handlePaymentChange}>
                          <option value="">Seleccione Banco</option>
                          {VENEZUELAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Teléfono Emisor</label>
                        <input required type="text" inputMode="numeric" pattern="[0-9]*" name="paymentPhone" value={paymentData.paymentPhone} onChange={handlePaymentChange} className="input-field" placeholder="0414..." />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: "16px" }}>
                      <label className="form-label">Cédula del Titular</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select name="paymentIdType" value={paymentData.paymentIdType} onChange={handlePaymentChange} className="input-field" style={{ width: "70px", padding: "12px 8px" }}>
                          <option value="V">V</option>
                          <option value="E">E</option>
                          <option value="J">J</option>
                          <option value="G">G</option>
                          <option value="P">P</option>
                        </select>
                        <input required type="text" inputMode="numeric" pattern="[0-9]*" name="paymentId" value={paymentData.paymentId} onChange={handlePaymentChange} className="input-field" placeholder="12345678" style={{ flexGrow: 1 }} />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === "binance" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Usuario Binance</label>
                      <input required type="text" name="binanceUser" value={paymentData.binanceUser} onChange={handlePaymentChange} className="input-field" placeholder="Ej. AnaGomez22" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Referencia</label>
                      <input required type="text" name="reference" value={paymentData.reference} onChange={handlePaymentChange} className="input-field" placeholder="Últimos 6 dígitos" />
                    </div>
                  </div>
                )}

                {paymentMethod === "zelle" && (
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label className="form-label">Número de Referencia Zelle</label>
                    <input required type="text" name="reference" value={paymentData.reference} onChange={handlePaymentChange} className="input-field" placeholder="Referencia completa" />
                  </div>
                )}

                {paymentMethod === "efectivo" && (
                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label className="form-label">Denominación del Billete</label>
                    <input required type="text" name="billDenomination" value={paymentData.billDenomination} onChange={handlePaymentChange} className="input-field" placeholder="Ej. Un billete de $20, dos de $10" />
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>Nota: Pagarás el día del evento en la entrada.</p>
                  </div>
                )}

                {paymentMethod && paymentMethod !== "efectivo" && (
                  <div className="form-group" style={{ marginBottom: "32px" }}>
                    <label className="form-label">Capture de Pago</label>
                    <input required type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input-field" style={{ padding: "8px" }} />
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: "32px" }}>
                  <label className="form-label" style={{ fontSize: "1.1rem" }}>Correo Electrónico para recibir Entradas</label>
                  <input required type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} className="input-field" placeholder="tu@correo.com" />
                </div>


                <button type="submit" className="btn-primary" style={{ width: "100%", padding: "16px", marginTop: "16px" }} disabled={loading}>
                  {loading ? "Procesando Inscripción..." : "Completar Inscripción"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {viewState === "success" && (
        <div style={{ textAlign: "center", padding: "60px 20px", maxWidth: "600px", margin: "0 auto", backgroundColor: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
          <h2 className="heading-2" style={{ color: "var(--color-accent)", marginBottom: "16px" }}>¡Gracias por tu compra! 🎉</h2>
          <p className="text-muted" style={{ marginBottom: "32px", fontSize: "1.1rem" }}>
            Una vez aprobada, recibirás tus <strong>entradas</strong> en el correo electrónico proporcionado.
          </p>
          <button className="btn-primary" onClick={() => setViewState("list")}>Volver a Talleres</button>
        </div>
      )}

    </div>
  );
}
