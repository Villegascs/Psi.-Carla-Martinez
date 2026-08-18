"use client";

import { useState, useEffect } from "react";

type Appointment = {
  id: string;
  patientName: string;
  patientLastName: string;
  patientIdType?: string;
  patientId: string;
  patientPhone?: string;
  dateOfBirth: string;
  reason: string;
  date: string;
  planName?: string;
  planPrice?: number;
  hasCoaching?: boolean;
  coachingPrice?: number;
  total?: number;
  paymentMethod?: string;
  paymentData?: any;
  proofUrl?: string;
  status: "PENDING" | "ACCEPTED" | "FINISHED" | "REJECTED";
  createdAt: string;
};

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // We will need a PUT endpoint in api/reservations to update status
      const res = await fetch("/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        fetchAppointments();
        if (selectedAppointment && selectedAppointment.id === id) {
          setSelectedAppointment({ ...selectedAppointment, status: newStatus as any });
        }
      } else {
        alert("Error actualizando la cita");
      }
    } catch (e) {
      console.error(e);
      alert("Error cambiando estado");
    }
  };

  return (
    <div>
      <h2 className="heading-2" style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Historial de Citas</h2>

      {loading ? (
        <p>Cargando citas...</p>
      ) : (
        <div className="table-container">
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", minWidth: "800px" }}>
            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>FECHA CITA</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>PACIENTE</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>PLAN</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>ESTADO</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280", textAlign: "right" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "16px", fontSize: "0.9rem", fontWeight: "bold" }}>
                    {new Date(a.date).toLocaleString()}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ fontWeight: 600, display: "block" }}>{a.patientName} {a.patientLastName}</span>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{a.patientPhone || 'Sin teléfono'}</span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ display: "block", fontSize: "0.9rem" }}>{a.planName || 'Consulta'}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>€{a.total || a.planPrice || 0}</span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <select 
                      value={a.status} 
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="ACCEPTED">Aprobada</option>
                      <option value="FINISHED">Finalizada</option>
                      <option value="REJECTED">Rechazada / Cancelada</option>
                    </select>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button onClick={() => setSelectedAppointment(a)} style={{ padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", fontSize: "0.85rem" }}>
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>No hay citas agendadas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detalles */}
      {selectedAppointment && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Detalles de la Cita</h2>
              <button onClick={() => setSelectedAppointment(null)} style={{ padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer" }}>Cerrar</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div>
                <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "4px" }}>Paciente</p>
                <p style={{ fontWeight: 600 }}>{selectedAppointment.patientName} {selectedAppointment.patientLastName}</p>
                <p style={{ fontSize: "0.9rem" }}>C.I: {selectedAppointment.patientIdType || 'V'}-{selectedAppointment.patientId}</p>
                <p style={{ fontSize: "0.9rem" }}>Nacimiento: {new Date(selectedAppointment.dateOfBirth).toLocaleDateString()}</p>
                <p style={{ fontSize: "0.9rem" }}>Teléfono: {selectedAppointment.patientPhone}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "4px" }}>Cita</p>
                <p style={{ fontWeight: 600 }}>{new Date(selectedAppointment.date).toLocaleString()}</p>
                <p style={{ fontSize: "0.9rem", marginTop: "8px" }}><strong>Motivo:</strong> {selectedAppointment.reason}</p>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "8px" }}>Servicios Solicitados</p>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "12px", borderBottom: selectedAppointment.hasCoaching ? "1px solid #e5e7eb" : "none", display: "flex", justifyContent: "space-between" }}>
                  <p style={{ fontWeight: 600 }}>{selectedAppointment.planName || "Consulta Básica"}</p>
                  <p style={{ fontWeight: 600 }}>€{selectedAppointment.planPrice || 0}</p>
                </div>
                {selectedAppointment.hasCoaching && (
                  <div style={{ padding: "12px", display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontWeight: 600 }}>Complemento: Coaching</p>
                    <p style={{ fontWeight: 600 }}>€{selectedAppointment.coachingPrice || 0}</p>
                  </div>
                )}
                <div style={{ padding: "12px", backgroundColor: "#f9fafb", display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid #e5e7eb" }}>
                  <span>Total a Pagar</span>
                  <span>€{selectedAppointment.total || selectedAppointment.planPrice || 0}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "8px" }}>Pago: {selectedAppointment.paymentMethod || 'No especificado'}</p>
              {selectedAppointment.paymentData && (
                <pre style={{ backgroundColor: "#f9fafb", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", overflowX: "auto" }}>
                  {JSON.stringify(selectedAppointment.paymentData, null, 2)}
                </pre>
              )}
              {selectedAppointment.proofUrl && (
                <div style={{ marginTop: "12px" }}>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "4px" }}>Comprobante:</p>
                  <a href={selectedAppointment.proofUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline", fontSize: "0.9rem" }}>
                    Ver Comprobante
                  </a>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
