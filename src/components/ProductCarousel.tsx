"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: string;
  image?: string;
  images?: string[];
  description?: string;
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p-hh",
    name: "HH",
    price: "10€",
    image: "/tienda/producto-hh.webp",
    description: "Lleva contigo un recordatorio de tu bienestar diario.",
  },
];

export default function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products && data.products.length > 0) {
          const parsed = data.products.map((p: any) => ({
            id: p.id,
            name: p.name || "Producto Oficial",
            price: p.price ? (p.price.includes("€") ? p.price : `${p.price}€`) : "10€",
            image: (p.images && p.images[0]) || p.image || "/tienda/producto-hh.webp",
            description: p.description || "",
          }));
          setProducts(parsed);
        }
      })
      .catch((err) => {
        console.warn("Using default carousel product:", err);
      });
  }, []);

  // Make sure we have at least 6 items in the display sequence
  const displayItems: Product[] = [];
  while (displayItems.length < 6) {
    displayItems.push(...products);
  }
  // Trim to 6 if it grew larger
  const sixItems = displayItems.slice(0, 6);

  // For infinite marquee, duplicate the array so -50% translation is completely seamless
  const marqueeItems = [...sixItems, ...sixItems];

  return (
    <div style={{ width: "100%", marginTop: "64px", overflow: "hidden", position: "relative" }}>
      {/* Sutiles sombras de desvanecimiento lateral para efecto infinito prémium */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "80px",
          height: "100%",
          background: "linear-gradient(to right, #f7f7f8 0%, rgba(247, 247, 248, 0) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "80px",
          height: "100%",
          background: "linear-gradient(to left, #f7f7f8 0%, rgba(247, 247, 248, 0) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Marquee Container */}
      <div className="carousel-marquee-wrapper">
        <div className="carousel-marquee-track">
          {marqueeItems.map((prod, idx) => (
            <Link
              key={`${prod.id}-${idx}`}
              href="/tienda"
              className="carousel-product-card"
            >
              <div className="carousel-product-img-box">
                <img
                  src={prod.image || "/tienda/producto-hh.webp"}
                  alt={prod.name}
                  className="carousel-product-img"
                />
                <span className="carousel-badge">
                  <ShoppingBag size={12} strokeWidth={2.2} />
                  Oficial
                </span>
              </div>

              <div className="carousel-product-info">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <h4 className="carousel-product-title">{prod.name}</h4>
                  <span className="carousel-product-price">{prod.price}</span>
                </div>
                <div className="carousel-product-cta">
                  <span>Ver en tienda</span>
                  <ArrowUpRight size={14} strokeWidth={2.2} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
