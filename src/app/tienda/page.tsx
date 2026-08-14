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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px" }}>
          <div style={{ backgroundColor: "var(--color-surface)", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setSelectedProduct(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-text)" }}>&times;</button>
            
            <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }} />
            
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>{selectedProduct.name}</h2>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-accent)", marginBottom: "16px" }}>{selectedProduct.price}</p>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px", lineHeight: "1.5" }}>{selectedProduct.description}</p>

            {(() => {
              const sizesArr = selectedProduct.sizes ? selectedProduct.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
              return sizesArr.length > 0 ? (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ fontWeight: 600, marginBottom: "8px" }}>Talla:</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {sizesArr.map(s => (
                      <button 
                        key={s} 
                        onClick={() => setSelectedSize(s)}
                        style={{ 
                          padding: "8px 16px", 
                          border: `2px solid ${selectedSize === s ? "var(--color-accent)" : "var(--color-border)"}`,
                          backgroundColor: selectedSize === s ? "#fef2f2" : "var(--color-surface)",
                          color: selectedSize === s ? "var(--color-accent)" : "var(--color-text)",
                          borderRadius: "8px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "0.2s"
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
                <div style={{ marginBottom: "24px" }}>
                  <p style={{ fontWeight: 600, marginBottom: "8px" }}>Color:</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {colorsArr.map(c => (
                      <button 
                        key={c} 
                        onClick={() => setSelectedColor(c)}
                        style={{ 
                          padding: "8px 16px", 
                          border: `2px solid ${selectedColor === c ? "var(--color-accent)" : "var(--color-border)"}`,
                          backgroundColor: selectedColor === c ? "#fef2f2" : "var(--color-surface)",
                          color: selectedColor === c ? "var(--color-accent)" : "var(--color-text)",
                          borderRadius: "8px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "0.2s"
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            <button className="btn-primary" style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }} onClick={handleAddToCart}>
              Añadir al Carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
