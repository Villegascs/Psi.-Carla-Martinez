"use client";

import { useState } from "react";

const WORKSHOPS = [
  {
    id: "taller-1",
    title: "Taller de Inteligencia Emocional",
    date: "25 de Octubre, 2026",
    price: "$20",
    description: "Aprende a gestionar tus emociones en el día a día con técnicas prácticas y sencillas. En este taller descubrirás cómo tus emociones influyen en tus decisiones y aprenderás a utilizarlas a tu favor.",
    points: [
      "Reconocimiento de emociones básicas",
      "Técnicas de autorregulación rápida",
      "Inteligencia emocional en las relaciones",
      "Dinámicas y ejercicios prácticos"
    ],
    capacity: 25,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "taller-2",
    title: "Manejo de Ansiedad y Estrés",
    date: "10 de Noviembre, 2026",
    price: "$25",
    description: "Técnicas de respiración y mindfulness para controlar los picos de ansiedad. Un espacio seguro para desconectar del estrés diario y reconectar contigo mismo.",
    points: [
      "¿Qué es la ansiedad y cómo identificarla?",
      "Técnicas de respiración diafragmática",
      "Mindfulness y atención plena",
      "Creación de rutinas anti-estrés"
    ],
    capacity: 20,
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "taller-3",
    title: "Autoestima y Crecimiento Personal",
    date: "5 de Diciembre, 2026",
    price: "$30",
    description: "Descubre tu verdadero valor y aprende a poner límites sanos en tus relaciones. Ideal para quienes buscan fortalecer su amor propio y tomar las riendas de su vida.",
    points: [
      "Los pilares de la autoestima",
      "Identificando creencias limitantes",
      "Aprender a decir NO sin culpa",
      "Plan de acción para el crecimiento personal"
    ],
    capacity: 15,
    image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=800&q=80"
  }
];

const VENEZUELAN_BANKS = [
  "Banco de Venezuela", "Banesco", "Mercantil", "Provincial", "BNC", 
  "Bancaribe", "Banco Exterior", "Banco del Tesoro", "Banco Bicentenario", "Banplus", "Banco Plaza"
];

export default function TalleresPage() {
  const [viewState, setViewState] = useState<"list" | "detail" | "form" | "success">("list");
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [participants, setParticipants] = useState([{ firstName: "", lastName: "", idNumber: "" }]);
  
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentData, setPaymentData] = useState({
    bank: "",
    paymentId: "",
    paymentPhone: "",
    binanceUser: "",
    reference: "",
    billDenomination: ""
  });
  const [file, setFile] = useState<File | null>(null);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const qty = parseInt(e.target.value);
    setQuantity(qty);
    
    // Adjust participants array size
    const newParticipants = [...participants];
    if (qty > newParticipants.length) {
      for (let i = newParticipants.length; i < qty; i++) {
        newParticipants.push({ firstName: "", lastName: "", idNumber: "" });
      }
    } else {
      newParticipants.splice(qty);
    }
    setParticipants(newParticipants);
  };

  const handleParticipantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [e.target.name]: e.target.value };
    setParticipants(newParticipants);
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleOpenDetail = (workshop: any) => {
    setSelectedWorkshop(workshop);
    setViewState("detail");
  };

  const handleOpenForm = () => {
    setErrorMsg("");
    setQuantity(1);
    setParticipants([{ firstName: "", lastName: "", idNumber: "" }]);
    setPaymentMethod("");
    setFile(null);
    setViewState("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      setErrorMsg("Debes seleccionar un método de pago.");
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {WORKSHOPS.map((workshop) => (
              <div 
                key={workshop.id} 
                className="card" 
                style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", transition: "transform 0.2s" }}
                onClick={() => handleOpenDetail(workshop)}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <img src={workshop.image} alt={workshop.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px", color: "var(--color-text)" }}>{workshop.title}</h3>
                  <p className="text-muted" style={{ fontSize: "0.9rem", flexGrow: 1, marginBottom: "16px" }}>
                    {workshop.description.substring(0, 80)}...
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)" }}>{workshop.date}</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-accent)" }}>{workshop.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <h1 className="heading-1" style={{ marginBottom: "16px" }}>{selectedWorkshop.title}</h1>
            
            <div style={{ display: "flex", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ backgroundColor: "var(--color-surface)", padding: "12px 20px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                <strong style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>FECHA</strong>
                <span>{selectedWorkshop.date}</span>
              </div>
              <div style={{ backgroundColor: "var(--color-surface)", padding: "12px 20px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                <strong style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>PRECIO</strong>
                <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>{selectedWorkshop.price}</span>
              </div>
              <div style={{ backgroundColor: "var(--color-surface)", padding: "12px 20px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                <strong style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>CUPOS</strong>
                <span>{selectedWorkshop.capacity} personas máximo</span>
              </div>
            </div>

            <h3 className="heading-2" style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Descripción</h3>
            <p className="text-muted" style={{ marginBottom: "24px", lineHeight: "1.6" }}>{selectedWorkshop.description}</p>

            <h3 className="heading-2" style={{ fontSize: "1.2rem", marginBottom: "12px" }}>¿Qué aprenderás?</h3>
            <ul style={{ marginBottom: "32px", paddingLeft: "20px", color: "var(--color-text-secondary)" }}>
              {selectedWorkshop.points.map((pt: string, i: number) => (
                <li key={i} style={{ marginBottom: "8px" }}>{pt}</li>
              ))}
            </ul>

            <button className="btn-primary" style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }} onClick={handleOpenForm}>
              Reservar mi Cupo Ahora
            </button>
          </div>
        </div>
      )}

      {viewState === "form" && selectedWorkshop && (
        <div className="card" style={{ maxWidth: "600px", margin: "0 auto", padding: "32px" }}>
          <button 
            onClick={() => setViewState("detail")}
            style={{ background: "none", border: "none", color: "var(--color-accent)", fontWeight: 600, cursor: "pointer", marginBottom: "16px", padding: 0 }}
          >
            ← Volver a detalles
          </button>
          
          <h2 className="heading-2" style={{ marginBottom: "8px" }}>Formulario de Inscripción</h2>
          <p className="text-muted" style={{ marginBottom: "24px" }}>Estás reservando para: <strong>{selectedWorkshop.title}</strong></p>

          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem" }}>
                {errorMsg}
              </div>
            )}

            {/* Cantidad de Cupos */}
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "8px", marginBottom: "16px" }}>1. Cantidad de Cupos</h3>
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">¿Cuántas entradas deseas comprar?</label>
              <select required className="input-field" value={quantity} onChange={handleQuantityChange}>
                {[1, 2, 3, 4, 5].map(q => (
                  <option key={q} value={q}>{q} {q === 1 ? 'Cupo' : 'Cupos'} - Total: ${q * parseInt(selectedWorkshop.price.replace('$', ''))}</option>
                ))}
              </select>
            </div>

            {/* Datos Personales Dinámicos */}
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "8px", marginBottom: "16px" }}>2. Datos de los Participantes</h3>
            {participants.map((participant, index) => (
              <div key={index} style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--color-surface)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px", color: "var(--color-accent)" }}>Participante {index + 1}</h4>
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
                  <input required type="text" name="idNumber" value={participant.idNumber} onChange={(e) => handleParticipantChange(index, e)} className="input-field" placeholder="V-12345678" />
                </div>
              </div>
            ))}

            {/* Método de Pago */}
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "8px", marginBottom: "16px" }}>3. Reporte de Pago</h3>
            <div className="form-group">
              <label className="form-label">Método de Pago Utilizado</label>
              <select required className="input-field" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">Selecciona un método</option>
                <option value="pago_movil">Pago Móvil (Bs)</option>
                <option value="zelle">Zelle ($)</option>
                <option value="binance">Binance USDT ($)</option>
                <option value="efectivo">Efectivo (Presencial)</option>
              </select>
            </div>

            {/* Info Generica del Metodo */}
            {paymentMethod && paymentMethod !== "efectivo" && (
              <div style={{ backgroundColor: "#fdf8f6", padding: "16px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem", color: "var(--color-text-secondary)", border: "1px solid #f9dad0" }}>
                {paymentMethod === "pago_movil" && <p><strong>Datos para Pago Móvil:</strong><br/>Banco Banesco (0134)<br/>C.I: V-25417859<br/>Tel: 0414-4083780</p>}
                {paymentMethod === "zelle" && <p><strong>Datos Zelle:</strong><br/>carlamartinez@email.com<br/>A nombre de: Carla Martinez</p>}
                {paymentMethod === "binance" && <p><strong>Datos Binance (Pay ID):</strong><br/>254897125</p>}
              </div>
            )}

            {/* Campos Dinamicos de Pago */}
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
                    <input required type="text" name="paymentPhone" value={paymentData.paymentPhone} onChange={handlePaymentChange} className="input-field" placeholder="0414..." />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label">Cédula del Titular</label>
                  <input required type="text" name="paymentId" value={paymentData.paymentId} onChange={handlePaymentChange} className="input-field" placeholder="V-" />
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

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "16px", marginTop: "16px" }} disabled={loading}>
              {loading ? "Procesando Inscripción..." : "Completar Inscripción"}
            </button>
          </form>
        </div>
      )}

      {viewState === "success" && (
        <div style={{ textAlign: "center", padding: "60px 20px", maxWidth: "600px", margin: "0 auto", backgroundColor: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
          <h2 className="heading-2" style={{ color: "var(--color-accent)", marginBottom: "16px" }}>¡Inscripción Recibida! 🎉</h2>
          <p className="text-muted" style={{ marginBottom: "32px", fontSize: "1.1rem" }}>
            Tu reporte de pago ha sido enviado con éxito al equipo para ser verificado. Una vez confirmado, recibirás tus <strong>Entradas QR</strong> en tu correo electrónico.
          </p>
          <button className="btn-primary" onClick={() => setViewState("list")}>Volver a Talleres</button>
        </div>
      )}

    </div>
  );
}
