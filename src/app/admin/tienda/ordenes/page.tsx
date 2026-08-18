"use client";

import { useState, useEffect } from "react";

type StoreOrder = {
  id: string;
  customerName: string;
  customerIdType?: string;
  customerId?: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  address: string;
  paymentMethod: string;
  paymentData: any;
  items: any[];
  total: number;
  status: "Pendiente" | "En Proceso" | "Enviado" | "Entregado" | "Finalizado" | "Cancelado";
  createdAt: string;
  proofUrl?: string;
};

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/store_orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/store_orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error cambiando estado");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "24px" }}>Órdenes de Tienda</h1>

      {loading ? (
        <p>Cargando órdenes...</p>
      ) : (
        <div className="table-container" style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>FECHA</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>CLIENTE</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>TOTAL</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>ESTADO</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280", textAlign: "right" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "16px", fontSize: "0.9rem" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ fontWeight: 600, display: "block" }}>{o.customerName}</span>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{o.customerPhone}</span>
                  </td>
                  <td style={{ padding: "16px", fontWeight: 600 }}>€{o.total}</td>
                  <td style={{ padding: "16px" }}>
                    <select 
                      value={o.status} 
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Enviado">Enviado</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button onClick={() => setSelectedOrder(o)} style={{ padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", fontSize: "0.85rem" }}>
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>No hay órdenes recientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detalles */}
      {selectedOrder && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Detalles de la Orden</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer" }}>Cerrar</button>
            </div>

            <div className="responsive-grid" style={{ gap: "16px", marginBottom: "24px" }}>
              <div>
                <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "4px" }}>Cliente</p>
                <p style={{ fontWeight: 600 }}>{selectedOrder.customerName}</p>
                {selectedOrder.customerId && <p style={{ fontSize: "0.9rem" }}>C.I: {selectedOrder.customerIdType}-{selectedOrder.customerId}</p>}
                <p style={{ fontSize: "0.9rem" }}>{selectedOrder.customerEmail}</p>
                <p style={{ fontSize: "0.9rem" }}>{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "4px" }}>Envío</p>
                <p style={{ fontWeight: 600 }}>{selectedOrder.deliveryMethod === 'Pickup' ? 'Retiro en persona' : 'Envío'}</p>
                {selectedOrder.deliveryMethod === 'Delivery' && <p style={{ fontSize: "0.9rem" }}>{selectedOrder.address}</p>}
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "8px" }}>Productos</p>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ padding: "12px", borderBottom: i < selectedOrder.items.length - 1 ? "1px solid #e5e7eb" : "none", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontWeight: 600 }}>{item.quantity}x {item.name}</p>
                      <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                        {item.size && `Talla: ${item.size}`} {item.color && `| Color: ${item.color}`}
                      </p>
                    </div>
                    <p style={{ fontWeight: 600 }}>€{item.price * item.quantity}</p>
                  </div>
                ))}
                <div style={{ padding: "12px", backgroundColor: "#f9fafb", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>Total</span>
                  <span>€{selectedOrder.total}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "8px" }}>Pago: {selectedOrder.paymentMethod}</p>
              {selectedOrder.paymentData && (
                <pre style={{ backgroundColor: "#f9fafb", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", overflowX: "auto" }}>
                  {JSON.stringify(selectedOrder.paymentData, null, 2)}
                </pre>
              )}
              {selectedOrder.proofUrl && (
                <div style={{ marginTop: "12px" }}>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "4px" }}>Comprobante:</p>
                  <a href={selectedOrder.proofUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline", fontSize: "0.9rem" }}>
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
