"use client";

import { useState, useEffect } from "react";

export default function AdminTalleresPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // Reusing the approve route with GET just for simplicity or create a new one.
      // Wait, let's create a GET handler in /api/workshops/approve/route.ts to fetch them.
      const res = await fetch("/api/workshops/approve");
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, email: string) => {
    if (!email) {
      alert("Para aprobar y enviar el QR, necesitas ingresar el correo del participante.");
      return;
    }
    
    try {
      const res = await fetch("/api/workshops/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: id, email })
      });
      const data = await res.json();
      
      if (data.success) {
        alert("¡Entrada aprobada y enviada por correo exitosamente!");
        fetchTickets();
      } else {
        alert("Error al enviar el correo: " + data.error);
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const pendingList = tickets.filter(t => t.status === "PENDING_APPROVAL");
  const approvedList = tickets.filter(t => t.status === "APPROVED");

  return (
    <div className="card">
      <h2 className="heading-2" style={{ marginBottom: "24px" }}>Control de Talleres y Entradas</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        
        {/* Columna Pendientes */}
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "16px", color: "#f59e0b" }}>
            Inscripciones Pendientes ({pendingList.length})
          </h3>
          <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "16px" }}>Revisa el capture en Telegram antes de aprobar.</p>
          
          {loading ? <p>Cargando...</p> : pendingList.map(ticket => (
            <div key={ticket.id} style={{ border: "1px solid var(--color-border)", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              <h4 style={{ fontWeight: 600 }}>{ticket.firstName} {ticket.lastName}</h4>
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>C.I: {ticket.idNumber}</p>
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>Taller: {ticket.workshopName}</p>
              
              <div style={{ marginTop: "12px" }}>
                <input 
                  type="email" 
                  id={`email-${ticket.id}`} 
                  placeholder="Correo electrónico para enviar QR" 
                  className="input-field" 
                  style={{ marginBottom: "8px", padding: "8px", fontSize: "0.9rem" }}
                />
                <button 
                  className="btn-primary" 
                  style={{ width: "100%", padding: "8px", fontSize: "0.9rem" }}
                  onClick={() => {
                    const emailInput = document.getElementById(`email-${ticket.id}`) as HTMLInputElement;
                    handleApprove(ticket.id, emailInput.value);
                  }}
                >
                  Aprobar y Enviar QR
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Columna Aprobados */}
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "16px", color: "#10b981" }}>
            Entradas Enviadas ({approvedList.length})
          </h3>
          
          {loading ? <p>Cargando...</p> : approvedList.map(ticket => (
            <div key={ticket.id} style={{ border: "1px solid var(--color-border)", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              <h4 style={{ fontWeight: 600 }}>{ticket.firstName} {ticket.lastName}</h4>
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>C.I: {ticket.idNumber}</p>
              <div style={{ marginTop: "8px", display: "inline-block", padding: "4px 8px", backgroundColor: ticket.used ? "#fee2e2" : "#d1fae5", color: ticket.used ? "#b91c1c" : "#047857", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600 }}>
                {ticket.used ? "QR UTILIZADO" : "QR VÁLIDO (Aún no asiste)"}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
