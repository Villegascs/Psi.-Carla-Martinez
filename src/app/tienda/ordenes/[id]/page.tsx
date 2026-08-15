import { getAdminDb } from '@/lib/firebase/admin';
import Link from 'next/link';

export const revalidate = 0; // Disable static rendering

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const adminDb = getAdminDb();
  const orderDoc = await adminDb.collection('store_orders').doc(id).get();
  
  if (!orderDoc.exists) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="heading-2">Pedido no encontrado</h1>
          <p className="text-muted" style={{ marginBottom: "24px" }}>El número de orden ingresado no existe.</p>
          <Link href="/tienda" className="btn-primary">Volver a la tienda</Link>
        </div>
      </div>
    );
  }

  const order = orderDoc.data();
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Pendiente": return "#f59e0b"; // Yellow/Orange
      case "En Proceso": return "#3b82f6"; // Blue
      case "Aprobado": return "#10b981"; // Green
      case "Cancelado": return "#ef4444"; // Red
      default: return "#6b7280"; // Gray
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-secondary)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "var(--color-surface)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
        
        {/* Header */}
        <div style={{ backgroundColor: getStatusColor(order?.status), padding: "32px 24px", color: "#fff", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", margin: "0 0 8px 0" }}>
            {order?.status === "Aprobado" ? "¡Pago Aprobado!" :
             order?.status === "Cancelado" ? "Pedido Cancelado" :
             order?.status === "En Proceso" ? "Orden en Proceso" : "Pago Pendiente de Verificar"}
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "1.1rem" }}>Orden #{id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Content */}
        <div style={{ padding: "32px 24px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>Resumen del Pedido</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
            {order?.items?.map((item: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: 600, margin: "0 0 4px 0" }}>{item.name} x{item.quantity}</p>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    {item.size && `Talla: ${item.size} `}
                    {item.color && `Color: ${item.color}`}
                  </p>
                </div>
                <p style={{ fontWeight: 600 }}>€{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "var(--color-bg-primary)", padding: "20px", borderRadius: "12px", marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "1rem", color: "var(--color-text-secondary)" }}>
              <span>Envío</span>
              <span>Por calcular</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem", fontWeight: 800, color: "var(--color-accent)", borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
              <span>Total (EUR)</span>
              <span>€{order?.total}</span>
            </div>
          </div>

          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>Datos del Cliente</h2>
          
          <div style={{ fontSize: "0.95rem", color: "var(--color-text-primary)", lineHeight: "1.8" }}>
            <p style={{ margin: 0 }}><strong>Nombre:</strong> {order?.customerName}</p>
            <p style={{ margin: 0 }}><strong>Correo:</strong> {order?.customerEmail}</p>
            <p style={{ margin: 0 }}><strong>Teléfono:</strong> {order?.customerPhone}</p>
            <p style={{ margin: 0 }}>
              <strong>Entrega:</strong> {order?.deliveryMethod === 'Pickup' ? 'Retiro en consultorio' : 'Delivery / Envío Nacional'}
            </p>
            {order?.deliveryMethod === 'Delivery' && (
              <>
                <p style={{ margin: 0 }}><strong>Zona:</strong> {order?.deliveryZone}</p>
                <p style={{ margin: 0 }}><strong>Dirección:</strong> {order?.address}</p>
              </>
            )}
          </div>

          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <Link href="/tienda" className="btn-primary" style={{ display: "inline-block", padding: "12px 32px" }}>
              Volver a la Tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
