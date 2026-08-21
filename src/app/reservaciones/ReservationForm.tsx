"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/DatePicker";
import { CopyButton } from "@/components/ui/CopyButton";
import Image from "next/image";

export default function ReservationForm() {
  const [checkoutStep, setCheckoutStep] = useState<"CONTACT" | "PLAN" | "PAYMENT" | "SUCCESS">("CONTACT");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookedHours, setBookedHours] = useState<string[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);

  const [contactData, setContactData] = useState({
    patientName: "",
    patientLastName: "",
    patientIdType: "V",
    patientId: "",
    patientPhone: "",
    dateOfBirth: "",
    reason: "",
    date: "",
    patientEmail: ""
  });

  const [plans, setPlans] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [hasCoaching, setHasCoaching] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentData, setPaymentData] = useState({
    bank: "", paymentIdType: "V", paymentId: "", paymentPhone: "", binanceUser: "", reference: "", billDenomination: ""
  });
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [eurRate, setEurRate] = useState<number | null>(null);

  useEffect(() => {
    // Fetch rates
    fetch("/api/bcv").then(r => r.json()).then(data => {
      if (data.usd) setBcvRate(data.usd);
      if (data.eur) setEurRate(data.eur);
    }).catch(console.error);

    // Fetch plans
    fetch("/api/admin/reservation_plans").then(r => r.json()).then(data => {
      if (data.success && data.plans) {
        setPlans(data.plans.filter((p: any) => !p.isCoachingAddon));
        setAddons(data.plans.filter((p: any) => p.isCoachingAddon));
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchBookedHours() {
      if (!contactData.date) {
        setBookedHours([]);
        return;
      }
      
      const dateOnly = contactData.date.split('T')[0];
      setLoadingHours(true);
      try {
        const res = await fetch(`/api/reservations/booked?date=${dateOnly}`);
        const data = await res.json();
        if (data.success) {
          setBookedHours(data.bookedHours || []);
        } else {
          setBookedHours([]);
        }
      } catch (error) {
        console.error("Failed to fetch booked hours", error);
        setBookedHours([]);
      } finally {
        setLoadingHours(false);
      }
    }
    
    fetchBookedHours();
  }, [contactData.date ? contactData.date.split('T')[0] : null]);

  // Load draft from local storage on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem("reservationDraft");
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.checkoutStep && parsed.checkoutStep !== "SUCCESS") setCheckoutStep(parsed.checkoutStep);
        if (parsed.contactData) setContactData(parsed.contactData);
        if (parsed.selectedPlanId) setSelectedPlanId(parsed.selectedPlanId);
        if (parsed.hasCoaching !== undefined) setHasCoaching(parsed.hasCoaching);
        if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
        if (parsed.paymentData) setPaymentData(parsed.paymentData);
      }
    } catch (e) {
      console.error("Error loading draft", e);
    }
  }, []);

  // Save draft whenever state changes
  useEffect(() => {
    if (checkoutStep === "SUCCESS") {
      localStorage.removeItem("reservationDraft");
      return;
    }
    const draft = {
      checkoutStep,
      contactData,
      selectedPlanId,
      hasCoaching,
      paymentMethod,
      paymentData
    };
    localStorage.setItem("reservationDraft", JSON.stringify(draft));
  }, [checkoutStep, contactData, selectedPlanId, hasCoaching, paymentMethod, paymentData]);

  const handleNextStep = () => {
    setErrorMsg("");
    if (checkoutStep === "CONTACT") {
      if (!contactData.patientName || !contactData.patientLastName || !contactData.patientId || !contactData.patientPhone || !contactData.patientEmail) {
        setErrorMsg("Por favor, completa todos los datos obligatorios, incluyendo tu correo.");
        return;
      }
      setCheckoutStep("PLAN");
      return;
    }
    if (checkoutStep === "PLAN") {
      if (!selectedPlanId) {
        setErrorMsg("Debes seleccionar un plan");
        return;
      }
      if (!contactData.date) {
        setErrorMsg("Debes seleccionar una fecha y hora");
        return;
      }
      const selectedTime = contactData.date.split('T')[1];
      if (selectedTime && bookedHours.includes(selectedTime)) {
        setErrorMsg("La hora seleccionada ya está ocupada para este día. Por favor, elige otra.");
        return;
      }
      setCheckoutStep("PAYMENT");
      return;
    }
    if (checkoutStep === "PAYMENT") {
      if (!paymentMethod) {
        setErrorMsg("Por favor selecciona un método de pago.");
        return;
      }
      if (paymentMethod === "Zelle" && (!paymentData.reference)) return setErrorMsg("Ingresa la referencia de Zelle");
      if (paymentMethod === "Pago Movil" && (!paymentData.bank || !paymentData.paymentId || !paymentData.paymentPhone || !paymentData.reference)) return setErrorMsg("Completa los datos del Pago Móvil");
      if (paymentMethod === "Binance" && (!paymentData.binanceUser || !paymentData.reference)) return setErrorMsg("Completa los datos de Binance");
      if (paymentMethod === "Efectivo" && (!paymentData.billDenomination)) return setErrorMsg("Indica la denominación de tus billetes");
      
      if (paymentMethod !== "Efectivo" && !proofFile) {
        return setErrorMsg("Debes adjuntar el comprobante de pago");
      }

      handleCheckout();
    }
  };

  const getSelectedPlan = () => plans.find(p => p.id === selectedPlanId);
  const getCoachingAddon = () => addons[0]; // Assuming there's one main coaching addon
  
  const calculateTotal = () => {
    const plan = getSelectedPlan();
    if (!plan) return 0;
    let t = plan.price;
    if (hasCoaching) {
      const addon = getCoachingAddon();
      if (addon) t += addon.price;
    }
    return t;
  };

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      let proofUrl = "";

      const plan = getSelectedPlan();
      const addon = getCoachingAddon();

      const reservationPayload = {
        ...contactData,
        planId: plan?.id,
        planName: plan?.name,
        planPrice: plan?.price,
        hasCoaching,
        coachingPrice: hasCoaching ? addon?.price : 0,
        total: calculateTotal(),
        paymentMethod,
        paymentData,
        proofUrl
      };

      const finalFormData = new FormData();
      finalFormData.append("data", JSON.stringify(reservationPayload));
      
      if (proofFile) {
        if (proofFile.size > 4 * 1024 * 1024) {
          setErrorMsg("La imagen del comprobante es muy pesada. Por favor, sube una imagen de menos de 4MB.");
          setLoading(false);
          return;
        }
        finalFormData.append("file", proofFile);
      }

      const res = await fetch("/api/reservation_checkout", {
        method: "POST",
        body: finalFormData
      });
      const data = await res.json();
      
      if (data.success) {
        setCheckoutStep("SUCCESS");
      } else {
        setErrorMsg(data.error || "Hubo un error al crear la cita.");
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Ocurrió un error inesperado al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  if (checkoutStep === "SUCCESS") {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
        <h2 className="heading-2" style={{ color: "var(--color-accent)", fontSize: "2rem", marginBottom: "16px" }}>¡Cita Agendada!</h2>
        <p className="text-muted" style={{ marginBottom: "24px", fontSize: "1.1rem" }}>
          Hemos recibido tu solicitud de cita y el pago está en verificación. Serás notificado una vez sea aprobada.
        </p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Finalizar</button>
      </div>
    );
  }

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="heading-1" style={{ fontSize: "2.5rem" }}>Reserva tu Cita</h1>
        <p className="text-muted" style={{ fontSize: "1.1rem" }}>
          Completa tus datos y selecciona un horario disponible para agendar tu consulta psicológica.
        </p>
      </div>

      <div className="card">
      {/* STEPS INDICATOR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", fontSize: "0.9rem", fontWeight: 600 }}>
        <span style={{ color: checkoutStep === "CONTACT" ? "var(--color-accent)" : "inherit" }}>1. Datos</span>
        <div style={{ flex: 1, height: "2px", backgroundColor: "var(--color-border)", margin: "0 12px" }}></div>
        <span style={{ color: checkoutStep === "PLAN" ? "var(--color-accent)" : "inherit" }}>2. Plan</span>
        <div style={{ flex: 1, height: "2px", backgroundColor: "var(--color-border)", margin: "0 12px" }}></div>
        <span style={{ color: checkoutStep === "PAYMENT" ? "var(--color-accent)" : "inherit" }}>3. Pago</span>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
          {errorMsg}
        </div>
      )}

      {/* CONTACT STEP */}
      {checkoutStep === "CONTACT" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 className="heading-2" style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "8px" }}>Tus Datos</h3>
          <div className="responsive-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nombre</label>
              <input type="text" className="input-field" value={contactData.patientName} onChange={e => setContactData({...contactData, patientName: e.target.value})} placeholder="Ej. Pedro" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Apellido</label>
              <input type="text" className="input-field" value={contactData.patientLastName} onChange={e => setContactData({...contactData, patientLastName: e.target.value})} placeholder="Ej. Pérez" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: "0.85rem" }}>Cédula / Documento de Identidad</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select className="input-field" style={{ width: "80px", padding: "10px" }} value={contactData.patientIdType} onChange={e => setContactData({...contactData, patientIdType: e.target.value})}>
                <option value="V">V</option><option value="E">E</option><option value="J">J</option><option value="G">G</option><option value="P">P</option>
              </select>
              <input type="text" className="input-field" style={{ flex: 1 }} placeholder="Solo números" value={contactData.patientId} onChange={e => setContactData({...contactData, patientId: e.target.value.replace(/\D/g, '')})} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Correo Electrónico</label>
            <input type="email" className="input-field" placeholder="Ej. correo@gmail.com" value={contactData.patientEmail || ''} onChange={e => setContactData({...contactData, patientEmail: e.target.value})} />
          </div>

          <div className="responsive-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Teléfono (WhatsApp)</label>
              <input type="tel" className="input-field" placeholder="Solo números" value={contactData.patientPhone} onChange={e => setContactData({...contactData, patientPhone: e.target.value.replace(/\D/g, '')})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Fecha de Nacimiento</label>
              <DatePicker 
                date={contactData.dateOfBirth ? new Date(contactData.dateOfBirth + 'T12:00:00') : undefined} 
                setDate={(date) => setContactData({...contactData, dateOfBirth: date ? format(date, 'yyyy-MM-dd') : ''})} 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Motivo de la Consulta</label>
            <textarea className="input-field" rows={3} value={contactData.reason} onChange={e => setContactData({...contactData, reason: e.target.value})} placeholder="Breve descripción..." />
          </div>
        </div>
      )}

      {/* PLAN STEP */}
      {checkoutStep === "PLAN" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <button onClick={() => setCheckoutStep("CONTACT")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer", padding: 0 }}>
            ← Volver a datos
          </button>
          
          <h3 className="heading-2" style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "8px" }}>Selecciona el Plan</h3>
          
          {plans.length === 0 ? <p>Cargando planes...</p> : (
            <div style={{ display: "grid", gap: "12px" }}>
              {plans.map(p => (
                <label key={p.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", border: selectedPlanId === p.id ? "2px solid var(--color-accent)" : "1px solid var(--color-border)", borderRadius: "8px", cursor: "pointer", backgroundColor: selectedPlanId === p.id ? "var(--color-surface)" : "transparent" }}>
                  <input type="radio" name="plan" value={p.id} checked={selectedPlanId === p.id} onChange={() => setSelectedPlanId(p.id)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {p.description && (
                      <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: "4px", whiteSpace: "pre-wrap" }}>
                        {p.description}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>€{p.price}</div>
                </label>
              ))}
            </div>
          )}

          {addons.length > 0 && (
            <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "var(--color-surface)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <input type="checkbox" checked={hasCoaching} onChange={e => setHasCoaching(e.target.checked)} style={{ width: "20px", height: "20px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>Añadir {addons[0].name} (+€{addons[0].price})</div>
                  {addons[0].description && (
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: "4px", whiteSpace: "pre-wrap" }}>
                      {addons[0].description}
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}

          <div className="form-group" style={{ marginTop: "24px" }}>
            <label className="form-label">Fecha y Hora Preferida</label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ flex: 2 }}>
                <DatePicker 
                  date={contactData.date ? new Date(contactData.date) : undefined} 
                  setDate={(date) => {
                    if (!date) {
                      setContactData({...contactData, date: ''});
                      return;
                    }
                    const existingTime = contactData.date ? contactData.date.split('T')[1] || "10:00" : "10:00";
                    setContactData({...contactData, date: format(date, 'yyyy-MM-dd') + 'T' + existingTime});
                  }} 
                  placeholder="Seleccionar Fecha"
                />
              </div>
              <div style={{ flex: 1 }}>
                <select 
                  className="input-field" 
                  value={contactData.date ? (contactData.date.split('T')[1] || "10:00") : "10:00"} 
                  onChange={e => {
                    if (contactData.date) {
                      setContactData({...contactData, date: contactData.date.split('T')[0] + 'T' + e.target.value});
                    } else {
                      setContactData({...contactData, date: format(new Date(), 'yyyy-MM-dd') + 'T' + e.target.value});
                    }
                  }}
                  style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", height: "42px" }}
                  disabled={loadingHours || !contactData.date}
                >
                  <option value="09:00" disabled={bookedHours.includes("09:00")}>09:00 AM {bookedHours.includes("09:00") && "(Ocupado)"}</option>
                  <option value="10:00" disabled={bookedHours.includes("10:00")}>10:00 AM {bookedHours.includes("10:00") && "(Ocupado)"}</option>
                  <option value="11:00" disabled={bookedHours.includes("11:00")}>11:00 AM {bookedHours.includes("11:00") && "(Ocupado)"}</option>
                  <option value="13:00" disabled={bookedHours.includes("13:00")}>01:00 PM {bookedHours.includes("13:00") && "(Ocupado)"}</option>
                  <option value="14:00" disabled={bookedHours.includes("14:00")}>02:00 PM {bookedHours.includes("14:00") && "(Ocupado)"}</option>
                  <option value="15:00" disabled={bookedHours.includes("15:00")}>03:00 PM {bookedHours.includes("15:00") && "(Ocupado)"}</option>
                  <option value="16:00" disabled={bookedHours.includes("16:00")}>04:00 PM {bookedHours.includes("16:00") && "(Ocupado)"}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT STEP */}
      {checkoutStep === "PAYMENT" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <button onClick={() => setCheckoutStep("PLAN")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer", padding: 0 }}>
            ← Volver a planes
          </button>
          
          <div style={{ padding: "16px", backgroundColor: "var(--color-surface)", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>Resumen</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>{getSelectedPlan()?.name}</span>
              <span>€{getSelectedPlan()?.price}</span>
            </div>
            {hasCoaching && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>{getCoachingAddon()?.name}</span>
                <span>€{getCoachingAddon()?.price}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid var(--color-border)", paddingTop: "12px", marginTop: "12px" }}>
              <span>Total a Pagar</span>
              <span>€{total}</span>
            </div>
            {eurRate && bcvRate && (
              <div style={{ textAlign: "right", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: "8px" }}>
                Aprox: {(total * eurRate).toFixed(2)} Bs
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.9rem" }}>Método de Pago</label>
            <select className="input-field" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="">Seleccione un método</option>
              <option value="Pago Movil">Pago Móvil</option>
              <option value="Zelle">Zelle</option>
              <option value="Binance">Binance (USDT)</option>
              <option value="Efectivo">Efectivo (Solo retiro presencial)</option>
            </select>
          </div>

          {paymentMethod === "Pago Movil" && (
            <div style={{ backgroundColor: "var(--color-bg-primary)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
              <div style={{ marginBottom: "16px", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ margin: 0 }}><strong>Banco:</strong> Banesco (0134)</p>
                  <CopyButton text="0134" />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ margin: 0 }}><strong>Cédula:</strong> V-12345678</p>
                  <CopyButton text="V-12345678" />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ margin: 0 }}><strong>Teléfono:</strong> 0414-1234567</p>
                  <CopyButton text="04141234567" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <select className="input-field" value={paymentData.bank} onChange={e => setPaymentData({...paymentData, bank: e.target.value})}>
                  <option value="">Selecciona Banco de Origen</option>
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
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <select className="input-field" style={{ width: "70px" }} value={paymentData.paymentIdType} onChange={e => setPaymentData({...paymentData, paymentIdType: e.target.value})}>
                  <option value="V">V</option><option value="E">E</option>
                </select>
                <input type="text" inputMode="numeric" pattern="[0-9]*" className="input-field" style={{ flex: 1 }} placeholder="Cédula" value={paymentData.paymentId} onChange={e => setPaymentData({...paymentData, paymentId: e.target.value.replace(/\D/g, '')})} />
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <select className="input-field" style={{ width: "90px" }} value={(paymentData.paymentPhone || "0414").substring(0,4)} onChange={e => setPaymentData({...paymentData, paymentPhone: e.target.value + (paymentData.paymentPhone || "0414").substring(4)})}>
                  <option value="0414">0414</option>
                  <option value="0424">0424</option>
                  <option value="0412">0412</option>
                  <option value="0416">0416</option>
                  <option value="0426">0426</option>
                  <option value="0212">0212</option>
                </select>
                <input type="text" inputMode="numeric" pattern="[0-9]*" className="input-field" style={{ flex: 1 }} placeholder="1234567" value={(paymentData.paymentPhone || "0414").substring(4)} onChange={e => setPaymentData({...paymentData, paymentPhone: (paymentData.paymentPhone || "0414").substring(0,4) + e.target.value.replace(/\D/g, '')})} />
              </div>
              <input type="text" className="input-field" placeholder="Referencia" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
            </div>
          )}

          {paymentMethod === "Zelle" && (
            <div style={{ backgroundColor: "var(--color-bg-primary)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ margin: 0, fontSize: "0.9rem" }}><strong>Correo:</strong> zelle@ejemplo.com</p>
                <CopyButton text="zelle@ejemplo.com" />
              </div>
              <input type="text" className="input-field" placeholder="Número de Referencia" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
            </div>
          )}

          {paymentMethod === "Binance" && (
            <div style={{ backgroundColor: "var(--color-bg-primary)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ margin: 0, fontSize: "0.9rem" }}><strong>Binance Pay ID:</strong> 123456789</p>
                <CopyButton text="123456789" />
              </div>
              <input type="text" className="input-field" style={{ marginBottom: "12px" }} placeholder="Tu Usuario de Binance" value={paymentData.binanceUser} onChange={e => setPaymentData({...paymentData, binanceUser: e.target.value})} />
              <input type="text" className="input-field" placeholder="Referencia" value={paymentData.reference} onChange={e => setPaymentData({...paymentData, reference: e.target.value})} />
            </div>
          )}

          {paymentMethod === "Efectivo" && (
            <div style={{ backgroundColor: "var(--color-bg-primary)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.9rem" }}>Indica con qué billetes vas a pagar para prever el vuelto.</p>
              <input type="text" className="input-field" placeholder="Ej. Un billete de 50 y uno de 10" value={paymentData.billDenomination} onChange={e => setPaymentData({...paymentData, billDenomination: e.target.value})} />
            </div>
          )}

          {paymentMethod && paymentMethod !== "Efectivo" && (
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Subir Comprobante</label>
              <input type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)} className="input-field" style={{ padding: "8px" }} />
            </div>
          )}
        </div>
      )}

      {/* ACTION BUTTON */}
      <div style={{ marginTop: "32px" }}>
        <button className="btn-primary" style={{ width: "100%", padding: "16px" }} onClick={handleNextStep} disabled={loading}>
          {loading ? "Procesando..." : checkoutStep === "PAYMENT" ? "Finalizar Reserva" : "Continuar"}
        </button>
      </div>
      </div>
    </>
  );
}
