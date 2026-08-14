"use client";

import { useState, useEffect } from "react";

export default function AppointmentsList() {
  const [tab, setTab] = useState<'pending' | 'accepted'>('pending');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/reservations");
        const data = await res.json();
        if (data.success) {
          setAppointments(data.appointments);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const pendingList = appointments.filter(a => a.status === "PENDING");
  const acceptedList = appointments.filter(a => a.status === "ACCEPTED");

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
        <button 
          onClick={() => setTab('pending')}
          style={{ 
            padding: '12px 0', 
            fontWeight: 600, 
            color: tab === 'pending' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            borderBottom: tab === 'pending' ? '2px solid var(--color-accent)' : '2px solid transparent'
          }}
        >
          Citas Pendientes ({pendingList.length})
        </button>
        <button 
          onClick={() => setTab('accepted')}
          style={{ 
            padding: '12px 0', 
            fontWeight: 600, 
            color: tab === 'accepted' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            borderBottom: tab === 'accepted' ? '2px solid var(--color-accent)' : '2px solid transparent'
          }}
        >
          Citas Aceptadas ({acceptedList.length})
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Cargando citas...</p>
      ) : (
        <div>
          {tab === 'pending' ? (
            pendingList.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {pendingList.map(cita => (
                  <div key={cita.id} style={{ border: "1px solid var(--color-border)", padding: "16px", borderRadius: "8px" }}>
                    <h4 style={{ fontWeight: 600 }}>{cita.patientName} {cita.patientLastName} (C.I: {cita.patientId})</h4>
                    <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "8px" }}>
                      Fecha Solicitada: {new Date(cita.date).toLocaleString()}
                    </p>
                    <p style={{ fontSize: "0.95rem" }}><strong>Motivo:</strong> {cita.reason}</p>
                    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                      <button className="btn-primary" style={{ padding: "6px 16px", fontSize: "0.85rem" }}>Aceptar Cita</button>
                      <button className="btn-secondary" style={{ padding: "6px 16px", fontSize: "0.85rem", color: "#d32f2f", borderColor: "#d32f2f" }}>Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted">No hay citas pendientes por el momento.</p>
          ) : (
            acceptedList.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {acceptedList.map(cita => (
                  <div key={cita.id} style={{ border: "1px solid var(--color-border)", padding: "16px", borderRadius: "8px" }}>
                    <h4 style={{ fontWeight: 600 }}>{cita.patientName} {cita.patientLastName}</h4>
                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                      Fecha Aceptada: {new Date(cita.date).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted">No hay citas aceptadas por el momento.</p>
          )}
        </div>
      )}
    </div>
  );
}
