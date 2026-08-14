"use client";

import { useCart } from "@/context/CartContext";

const MOCK_PRODUCTS = [
  { id: "1", name: "Taza 'Amor Propio'", price: 15, imageUrl: "https://via.placeholder.com/300?text=Taza" },
  { id: "2", name: "Agenda de Bienestar", price: 25, imageUrl: "https://via.placeholder.com/300?text=Agenda" },
  { id: "3", name: "Hoodie 'Salud Mental'", price: 40, imageUrl: "https://via.placeholder.com/300?text=Hoodie" },
];

export default function TiendaPage() {
  const { addToCart } = useCart();

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="heading-1">Tienda Oficial</h1>
        <p className="text-muted">Lleva contigo un recordatorio de tu bienestar diario.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        {MOCK_PRODUCTS.map((product) => (
          <div key={product.id} className="card" style={{ display: "flex", flexDirection: "column", padding: "16px" }}>
            <div style={{ backgroundColor: "var(--color-bg-secondary)", height: "200px", borderRadius: "var(--radius-md)", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="text-muted">[Imagen del producto]</span>
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 600 }}>{product.name}</h3>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: "8px 0 16px 0", color: "var(--color-accent)" }}>
              ${product.price}
            </p>
            <button 
              className="btn-primary" 
              style={{ width: "100%", marginTop: "auto" }}
              onClick={() => addToCart(product, product.name.includes("Hoodie") ? "M" : undefined)}
            >
              Agregar al Carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
