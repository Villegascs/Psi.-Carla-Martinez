"use client";

import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";

type Product = {
  id: string;
  name: string;
  price: string;
  description: string;
  sizes: string;
  colors: string;
  image: string;
};

export default function TiendaPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // State for the modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.products);
        setLoading(false);
      })
      .catch(e => {
        console.error("Error fetching products:", e);
        setLoading(false);
      });
  }, []);

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    const sizesArr = product.sizes ? product.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
    const colorsArr = product.colors ? product.colors.split(',').map(c => c.trim()).filter(Boolean) : [];
    
    setSelectedSize(sizesArr.length > 0 ? sizesArr[0] : "");
    setSelectedColor(colorsArr.length > 0 ? colorsArr[0] : "");
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    const sizesArr = selectedProduct.sizes ? selectedProduct.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
    const colorsArr = selectedProduct.colors ? selectedProduct.colors.split(',').map(c => c.trim()).filter(Boolean) : [];
    
    if (sizesArr.length > 0 && !selectedSize) {
      alert("Por favor selecciona una talla");
      return;
    }
    if (colorsArr.length > 0 && !selectedColor) {
      alert("Por favor selecciona un color");
      return;
    }

    addToCart(
      {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: parseFloat(selectedProduct.price.replace(/[^\d.]/g, '')),
        imageUrl: selectedProduct.image
      }, 
      selectedSize || undefined, 
      selectedColor || undefined
    );
    
    setSelectedProduct(null);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="heading-1">Tienda Oficial</h1>
        <p className="text-muted">Lleva contigo un recordatorio de tu bienestar diario.</p>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>Cargando tienda...</p>
      ) : products.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>No hay productos disponibles por ahora.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {products.map((product) => (
            <div key={product.id} className="card" style={{ display: "flex", flexDirection: "column", padding: "16px", cursor: "pointer" }} onClick={() => openProductModal(product)}>
              <div style={{ backgroundColor: "var(--color-bg-secondary)", height: "240px", borderRadius: "var(--radius-md)", marginBottom: "16px", overflow: "hidden" }}>
                {product.image ? (
                  <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" }}>Sin imagen</div>
                )}
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 600 }}>{product.name}</h3>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: "8px 0 16px 0", color: "var(--color-accent)" }}>
                {product.price}
              </p>
              <button 
                className="btn-primary" 
                style={{ width: "100%", marginTop: "auto" }}
                onClick={(e) => {
                  e.stopPropagation();
                  openProductModal(product);
                }}
              >
                Ver Detalles
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detalles del Producto */}
      {selectedProduct && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px", animation: "fadeIn 0.3s" }}>
          <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "16px", width: "100%", maxWidth: "850px", maxHeight: "90vh", overflow: "hidden", position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <button onClick={() => setSelectedProduct(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.8)", border: "none", width: "36px", height: "36px", borderRadius: "50%", fontSize: "1.5rem", cursor: "pointer", color: "#000", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>&times;</button>
            
            {/* Columna Izquierda: Imagen */}
            <div style={{ backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", minHeight: "300px" }}>
              <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover", maxHeight: "500px" }} />
            </div>
            
            {/* Columna Derecha: Detalles */}
            <div style={{ padding: "40px 32px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-text-secondary)", fontWeight: 600, marginBottom: "8px" }}>Tienda Oficial</span>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "12px", lineHeight: 1.1 }}>{selectedProduct.name}</h2>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-accent)", marginBottom: "24px" }}>{selectedProduct.price}</p>
              
              <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid var(--color-border)" }}>
                <p style={{ color: "var(--color-text-secondary)", lineHeight: "1.6", fontSize: "1rem" }}>{selectedProduct.description}</p>
              </div>

              {(() => {
                const sizesArr = selectedProduct.sizes ? selectedProduct.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
                return sizesArr.length > 0 ? (
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Selecciona tu talla:</p>
                      <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{selectedSize || "Ninguna seleccionada"}</span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {sizesArr.map(s => (
                        <button 
                          key={s} 
                          onClick={() => setSelectedSize(s)}
                          style={{ 
                            width: "48px",
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `2px solid ${selectedSize === s ? "var(--color-text)" : "var(--color-border)"}`,
                            backgroundColor: selectedSize === s ? "var(--color-text)" : "transparent",
                            color: selectedSize === s ? "var(--color-bg-primary)" : "var(--color-text)",
                            borderRadius: "8px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {(() => {
                const colorsArr = selectedProduct.colors ? selectedProduct.colors.split(',').map(c => c.trim()).filter(Boolean) : [];
                return colorsArr.length > 0 ? (
                  <div style={{ marginBottom: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Color:</p>
                      <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{selectedColor || "Ninguno seleccionado"}</span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {colorsArr.map(c => (
                        <button 
                          key={c} 
                          onClick={() => setSelectedColor(c)}
                          style={{ 
                            padding: "10px 20px", 
                            border: `2px solid ${selectedColor === c ? "var(--color-text)" : "var(--color-border)"}`,
                            backgroundColor: selectedColor === c ? "var(--color-text)" : "transparent",
                            color: selectedColor === c ? "var(--color-bg-primary)" : "var(--color-text)",
                            borderRadius: "30px",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              <button 
                className="btn-primary" 
                style={{ width: "100%", padding: "18px", fontSize: "1.1rem", marginTop: "auto", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", borderRadius: "12px", boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }} 
                onClick={handleAddToCart}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Añadir al Carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
