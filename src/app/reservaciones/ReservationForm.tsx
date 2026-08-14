"use client";

import { useState } from "react";

export default function ReservationForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    patientName: "",
    patientLastName: "",
    patientId: "",
    dateOfBirth: "",
    reason: "",
    date: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, price: 50 }) // Default price for now
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setErrorMsg(data.error || "Hubo un error al agendar la cita.");
      }
    } catch (err) {
      setErrorMsg("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <h2 className="heading-2" style={{ color: "var(--color-accent)" }}>¡Solicitud Enviada!</h2>
        <p className="text-muted" style={{ marginBottom: "24px" }}>
          Hemos recibido tu solicitud de cita. Por favor espera a que sea aprobada.
        </p>
        <button className="btn-primary" onClick={() => { setSuccess(false); setFormData({patientName: "", patientLastName: "", patientId: "", dateOfBirth: "", reason: "", date: ""}); }}>Nueva Reserva</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="heading-2" style={{ fontSize: "1.5rem", marginBottom: "24px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>Tus Datos</h3>
      
      {errorMsg && (
        <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Nombre</label>
          <input required type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="input-field" placeholder="Ej. Pedro" />
        </div>
        <div className="form-group">
          <label className="form-label">Apellido</label>
          <input required type="text" name="patientLastName" value={formData.patientLastName} onChange={handleChange} className="input-field" placeholder="Ej. Pérez" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Cédula de Identidad</label>
          <input required type="text" name="patientId" value={formData.patientId} onChange={handleChange} className="input-field" placeholder="V-12345678" />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de Nacimiento</label>
          <input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input-field" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Motivo de la consulta</label>
        <textarea required name="reason" value={formData.reason} onChange={handleChange} className="input-field" rows={4} placeholder="Describe brevemente el motivo..." style={{ resize: "vertical" }}></textarea>
      </div>

      <h3 className="heading-2" style={{ fontSize: "1.5rem", marginTop: "40px", marginBottom: "24px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>Disponibilidad</h3>
      
      <div className="form-group" style={{ marginBottom: "40px" }}>
        <label className="form-label">Fecha y Hora de la Cita</label>
        <input required type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="input-field" />
      </div>

      <button type="submit" className="btn-primary" style={{ width: "100%", padding: "16px" }} disabled={loading}>
        {loading ? "Procesando..." : "Solicitar Cita"}
      </button>
    </form>
  );
}
