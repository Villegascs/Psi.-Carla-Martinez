"use client";

import { useState, useEffect } from "react";

export default function AdminTalleresPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/workshops/approve");
      const data = await res.json();
      if (data.success) {
        setOrders(data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, email: string) => {
    if (!email) {
      alert("Para aprobar y enviar los QRs, necesitas ingresar el correo del comprador.");
      return;
    }
    
    try {
      const res = await fetch("/api/workshops/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, email })
      });
      const data = await res.json();
      
      if (data.success) {
        alert("¡Entradas aprobadas y enviadas por correo exitosamente!");
        fetchOrders();
      } else {
        alert("Error al enviar el correo: " + data.error);
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const pendingList = orders.filter(o => o.status === "PENDING_APPROVAL");
  const approvedList = orders.filter(o => o.status === "APPROVED");

  return (
    <div className="card">
      <h2 className="heading-2" style={{ marginBottom: "24px" }}>Control de Talleres y Entradas</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        
        {/* Columna Pendientes */}
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "16px", color: "#f59e0b" }}>
            Órdenes Pendientes ({pendingList.length})
          </h3>
          <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "16px" }}>Revisa el capture en Telegram antes de aprobar.</p>
          
          {loading ? <p>Cargando...</p> : pendingList.map(order => (
            <div key={order.id} style={{ border: "1px solid var(--color-border)", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontWeight: 700, color: "var(--color-accent)" }}>{order.quantity} Cupos</span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>{order.paymentMethod}</span>
              </div>
              <p className="text-muted" style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>Taller: {order.workshopName}</p>
              
              <div style={{ marginBottom: "12px", padding: "8px", backgroundColor: "var(--color-surface)", borderRadius: "4px" }}>
                <strong style={{ fontSize: "0.8rem", display: "block" }}>Participantes:</strong>
                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.85rem" }}>
                  {order.participants?.map((p: any, i: number) => (
                    <li key={i}>{p.firstName} {p.lastName} (V-{p.idNumber})</li>
                  ))}
                </ul>
              </div>
              
              <div style={{ marginTop: "12px" }}>
                <input 
                  type="email" 
                  id={`email-${order.id}`} 
                  placeholder="Correo del comprador" 
                  className="input-field" 
                  style={{ marginBottom: "8px", padding: "8px", fontSize: "0.9rem" }}
                />
                <button 
                  className="btn-primary" 
                  style={{ width: "100%", padding: "8px", fontSize: "0.9rem" }}
                  onClick={() => {
                    const emailInput = document.getElementById(`email-${order.id}`) as HTMLInputElement;
                    handleApprove(order.id, emailInput.value);
                  }}
                >
                  Aprobar y Enviar QRs
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Columna Aprobados */}
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "16px", color: "#10b981" }}>
            Órdenes Aprobadas ({approvedList.length})
          </h3>
          
          {loading ? <p>Cargando...</p> : approvedList.map(order => (
            <div key={order.id} style={{ border: "1px solid var(--color-border)", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontWeight: 700, color: "var(--color-accent)" }}>{order.quantity} Cupos</span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Enviado a: {order.emailSentTo}</span>
              </div>
              
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.85rem", marginTop: "8px" }}>
                  {order.participants?.map((p: any, i: number) => (
                    <li key={i} style={{ marginBottom: "4px" }}>
                      {p.firstName} {p.lastName}
                      {p.used ? 
                        <span style={{ marginLeft: "8px", color: "#b91c1c", fontWeight: 600, fontSize: "0.7rem", backgroundColor: "#fee2e2", padding: "2px 4px", borderRadius: "4px" }}>USADO</span> : 
                        <span style={{ marginLeft: "8px", color: "#047857", fontWeight: 600, fontSize: "0.7rem", backgroundColor: "#d1fae5", padding: "2px 4px", borderRadius: "4px" }}>VÁLIDO</span>
                      }
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
