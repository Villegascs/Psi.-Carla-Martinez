"use client";

import { useState } from "react";

export default function ReservationForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement API call to save reservation
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <h2 className="heading-2" style={{ color: "var(--color-accent)" }}>¡Solicitud Enviada!</h2>
        <p className="text-muted" style={{ marginBottom: "24px" }}>
          Hemos recibido tu solicitud de cita. Por favor espera a que sea aprobada.
        </p>
        <button className="btn-primary" onClick={() => setSuccess(false)}>Nueva Reserva</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="heading-2" style={{ fontSize: "1.5rem", marginBottom: "24px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>Tus Datos</h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Nombre</label>
          <input required type="text" className="input-field" placeholder="Ej. Pedro" />
        </div>
        <div className="form-group">
          <label className="form-label">Apellido</label>
          <input required type="text" className="input-field" placeholder="Ej. Pérez" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Cédula de Identidad</label>
          <input required type="text" className="input-field" placeholder="V-12345678" />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de Nacimiento</label>
          <input required type="date" className="input-field" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Motivo de la consulta</label>
        <textarea required className="input-field" rows={4} placeholder="Describe brevemente el motivo..." style={{ resize: "vertical" }}></textarea>
      </div>

      <h3 className="heading-2" style={{ fontSize: "1.5rem", marginTop: "40px", marginBottom: "24px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>Disponibilidad</h3>
      
      <div className="form-group">
        <label className="form-label">Fecha de la Cita</label>
        <input required type="date" className="input-field" />
      </div>

      {/* Horarios irán aquí, cargados dinámicamente desde el backend */}
      <div className="form-group" style={{ marginBottom: "40px" }}>
        <label className="form-label">Horarios Disponibles</label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ padding: "8px 16px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer", backgroundColor: "var(--color-bg-secondary)" }}>09:00 AM</span>
          <span style={{ padding: "8px 16px", border: "1px solid var(--color-accent)", borderRadius: "var(--radius-md)", cursor: "pointer", backgroundColor: "var(--color-accent)", color: "white" }}>10:00 AM</span>
          <span style={{ padding: "8px 16px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer", backgroundColor: "var(--color-bg-secondary)" }}>02:00 PM</span>
        </div>
        <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "8px" }}>Selecciona una fecha para ver los horarios.</p>
      </div>

      <button type="submit" className="btn-primary" style={{ width: "100%", padding: "16px" }} disabled={loading}>
        {loading ? "Procesando..." : "Solicitar Cita"}
      </button>
    </form>
  );
}
