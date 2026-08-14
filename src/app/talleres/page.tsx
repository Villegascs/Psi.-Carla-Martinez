"use client";

import { useState } from "react";

const WORKSHOPS = [
  {
    id: "taller-1",
    title: "Taller de Inteligencia Emocional",
    date: "25 de Octubre, 2026",
    price: "$20",
    description: "Aprende a gestionar tus emociones en el día a día con técnicas prácticas y sencillas.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "taller-2",
    title: "Manejo de Ansiedad y Estrés",
    date: "10 de Noviembre, 2026",
    price: "$25",
    description: "Técnicas de respiración y mindfulness para controlar los picos de ansiedad.",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "taller-3",
    title: "Autoestima y Crecimiento Personal",
    date: "5 de Diciembre, 2026",
    price: "$30",
    description: "Descubre tu verdadero valor y aprende a poner límites sanos en tus relaciones.",
    image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=800&q=80"
  }
];

export default function TalleresPage() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null);
  
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

  const handleOpenModal = (workshop: any) => {
    setSelectedWorkshop(workshop);
    setSuccess(false);
    setErrorMsg("");
    setFormData({ firstName: "", lastName: "", idNumber: "" });
    setFile(null);
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
    data.append("workshopName", selectedWorkshop.title);
    data.append("paymentProof", file);

    try {
      const res = await fetch("/api/workshops", {
        method: "POST",
        body: data,
      });

      let resData;
      try {
        resData = await res.json();
      } catch (parseError) {
        throw new Error("El servidor no devolvió una respuesta válida. Es posible que haya un error interno.");
      }

      if (resData.success) {
        setSuccess(true);
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
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="heading-1">Próximos Talleres</h1>
        <p className="text-muted">Inscríbete y participa en nuestros eventos de psicología.</p>
      </div>

      {/* Listado de Talleres en Cuadritos (Grid) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {WORKSHOPS.map((workshop) => (
          <div key={workshop.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <img src={workshop.image} alt={workshop.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px", color: "var(--color-text)" }}>{workshop.title}</h3>
              <p className="text-muted" style={{ fontSize: "0.9rem", flexGrow: 1, marginBottom: "16px" }}>{workshop.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)" }}>{workshop.date}</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-accent)" }}>{workshop.price}</span>
              </div>
              <button className="btn-primary" style={{ width: "100%" }} onClick={() => handleOpenModal(workshop)}>
                Reservar Cupo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Inscripción */}
      {selectedWorkshop && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px"
        }}>
          <div className="card" style={{ maxWidth: "500px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button 
              onClick={() => setSelectedWorkshop(null)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-text-secondary)" }}
            >
              &times;
            </button>

            {success ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <h2 className="heading-2" style={{ color: "var(--color-accent)", marginBottom: "16px" }}>¡Inscripción Recibida!</h2>
                <p className="text-muted" style={{ marginBottom: "24px" }}>
                  Hemos enviado tu comprobante de pago a revisión. Recibirás un correo electrónico con tu <strong>Entrada QR</strong> cuando sea aprobado.
                </p>
                <button className="btn-primary" onClick={() => setSelectedWorkshop(null)}>Cerrar</button>
              </div>
            ) : (
              <>
                <h2 className="heading-2" style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Inscripción</h2>
                <p className="text-muted" style={{ marginBottom: "24px" }}>Estás reservando: <strong>{selectedWorkshop.title}</strong></p>

                <form onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem" }}>
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Nombre</label>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input-field" placeholder="Ej. Ana" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Apellido</label>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input-field" placeholder="Ej. Gómez" />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label className="form-label">Cédula de Identidad</label>
                    <input required type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="input-field" placeholder="V-12345678" />
                  </div>

                  <div className="form-group" style={{ marginBottom: "32px" }}>
                    <label className="form-label">Capture de Pago</label>
                    <input required type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input-field" style={{ padding: "8px" }} />
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "8px" }}>
                      Solo se aceptan imágenes (JPG, PNG).
                    </p>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: "100%", padding: "16px" }} disabled={loading}>
                    {loading ? "Enviando e Inscribiendo..." : "Completar Inscripción"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
