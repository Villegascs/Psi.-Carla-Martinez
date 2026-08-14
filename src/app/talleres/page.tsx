"use client";

import { useState } from "react";

export default function TalleresPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    idNumber: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Debes subir el comprobante de pago.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("idNumber", formData.idNumber);
    data.append("workshopName", "Taller de Inteligencia Emocional (Mock)");
    data.append("paymentProof", file);

    try {
      const res = await fetch("/api/workshops", {
        method: "POST",
        body: data,
      });

      const resData = await res.json();
      if (resData.success) {
        setSuccess(true);
      } else {
        setErrorMsg(resData.error || "Hubo un error en la inscripción.");
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
        <h2 className="heading-2" style={{ color: "var(--color-accent)" }}>¡Inscripción Recibida!</h2>
        <p className="text-muted" style={{ marginBottom: "24px" }}>
          Hemos enviado tu comprobante de pago a revisión. Recibirás un correo electrónico con tu <strong>Entrada QR</strong> cuando sea aprobado.
        </p>
        <button className="btn-primary" onClick={() => { setSuccess(false); setFile(null); }}>Volver</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="heading-1">Próximos Talleres</h1>
        <p className="text-muted">Inscríbete y participa en nuestros eventos de psicología.</p>
      </div>

      <div className="card" style={{ marginBottom: "32px", padding: "24px" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>Taller de Inteligencia Emocional</h3>
        <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "16px" }}>
          Aprende a gestionar tus emociones en el día a día. <br/>
          <strong>Fecha:</strong> 25 de Octubre, 2026 <br/>
          <strong>Precio:</strong> $20
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <h3 className="heading-2" style={{ fontSize: "1.25rem", marginBottom: "24px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>Datos de Inscripción</h3>
        
        {errorMsg && (
          <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input-field" placeholder="Ej. Ana" />
          </div>
          <div className="form-group">
            <label className="form-label">Apellido</label>
            <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input-field" placeholder="Ej. Gómez" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Cédula de Identidad</label>
          <input required type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="input-field" placeholder="V-12345678" />
        </div>

        <div className="form-group" style={{ marginBottom: "40px" }}>
          <label className="form-label">Capture de Pago</label>
          <input required type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input-field" style={{ padding: "12px 16px" }} />
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "8px" }}>
            Solo se aceptan imágenes (JPG, PNG). Se enviará directo al equipo por Telegram.
          </p>
        </div>

        <button type="submit" className="btn-primary" style={{ width: "100%", padding: "16px" }} disabled={loading}>
          {loading ? "Enviando e Inscribiendo..." : "Completar Inscripción"}
        </button>
      </form>
    </div>
  );
}
