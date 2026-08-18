"use client";

import { useState, useEffect } from "react";

export default function PlansManager() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    isCoachingAddon: false
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reservation_plans");
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openModal = (plan?: any) => {
    if (plan) {
      setEditingId(plan.id);
      setFormData({
        name: plan.name,
        price: plan.price.toString(),
        description: plan.description || "",
        isCoachingAddon: !!plan.isCoachingAddon
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        price: "",
        description: "",
        isCoachingAddon: false
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const payload = { ...formData, id: editingId };

      const res = await fetch("/api/admin/reservation_plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        fetchPlans();
        closeModal();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este plan?")) return;
    try {
      const res = await fetch(`/api/admin/reservation_plans?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchPlans();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="card" style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2 className="heading-2" style={{ fontSize: "1.25rem" }}>Planes de Consulta y Complementos</h2>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>Configura los precios de las consultas y el extra de Coaching.</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>+ Nuevo Plan</button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : plans.length === 0 ? (
        <p className="text-muted">No hay planes creados todavía.</p>
      ) : (
        <div className="table-container">
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", minWidth: "600px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--color-surface)", textAlign: "left" }}>
              <th style={{ padding: "12px", borderBottom: "1px solid var(--color-border)" }}>Nombre</th>
              <th style={{ padding: "12px", borderBottom: "1px solid var(--color-border)" }}>Tipo</th>
              <th style={{ padding: "12px", borderBottom: "1px solid var(--color-border)" }}>Precio (€)</th>
              <th style={{ padding: "12px", borderBottom: "1px solid var(--color-border)", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <tr key={plan.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "12px" }}>
                  <strong>{plan.name}</strong>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{plan.description}</div>
                </td>
                <td style={{ padding: "12px" }}>
                  {plan.isCoachingAddon ? <span style={{ color: "#3b82f6", fontWeight: "bold" }}>Extra (Complemento)</span> : "Consulta"}
                </td>
                <td style={{ padding: "12px", fontWeight: "bold" }}>€{plan.price}</td>
                <td style={{ padding: "12px", textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button onClick={() => openModal(plan)} style={{ cursor: "pointer", background: "none", border: "1px solid var(--color-border)", padding: "4px 8px", borderRadius: "4px" }}>Editar</button>
                  <button onClick={() => handleDelete(plan.id)} style={{ cursor: "pointer", background: "none", border: "1px solid #ef4444", color: "#ef4444", padding: "4px 8px", borderRadius: "4px" }}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", position: "relative" }}>
            <h3 className="heading-2" style={{ marginBottom: "20px" }}>{editingId ? "Editar Plan" : "Nuevo Plan"}</h3>
            <button onClick={closeModal} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nombre del Plan</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Consulta Económica" />
              </div>
              <div className="form-group">
                <label className="form-label">Precio (€)</label>
                <input required type="number" min="0" step="any" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción (Opcional)</label>
                <textarea className="input-field" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ej. Incluye evaluación..." />
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="checkbox" id="isCoachingAddon" checked={formData.isCoachingAddon} onChange={e => setFormData({...formData, isCoachingAddon: e.target.checked})} style={{ width: "20px", height: "20px" }} />
                <label htmlFor="isCoachingAddon" style={{ cursor: "pointer", fontWeight: "bold" }}>Es un complemento (Ej. Extra por Coaching)</label>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={closeModal} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
