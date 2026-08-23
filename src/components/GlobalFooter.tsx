"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Facebook, Youtube } from "lucide-react";

export default function GlobalFooter() {
  const pathname = usePathname();

  // Ocultar el footer global en todas las rutas de /admin o rutas específicas si es necesario
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer style={{ backgroundColor: "#1e1b4b", color: "#f3f4f6", padding: "60px 24px 24px 24px", marginTop: "auto" }}>
      <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "space-between", paddingBottom: "40px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
        
        {/* Brand Column */}
        <div style={{ flex: "1 1 250px" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "16px", letterSpacing: "1px", textTransform: "uppercase" }}>
            Carla Martinez
          </h3>
          <p style={{ color: "#d1d5db", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "300px" }}>
            Especialista en psicología clínica, comprometida con tu bienestar mental y crecimiento personal.
          </p>
        </div>

        {/* Links Column */}
        <div style={{ flex: "1 1 250px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Enlaces Rápidos
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link href="/" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "0.95rem" }} className="footer-link">Inicio</Link>
            <Link href="/reservaciones" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "0.95rem" }} className="footer-link">Reservaciones</Link>
            <Link href="/talleres" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "0.95rem" }} className="footer-link">Talleres</Link>
            <Link href="/tienda" style={{ color: "#d1d5db", textDecoration: "none", fontSize: "0.95rem" }} className="footer-link">Tienda</Link>
          </div>
        </div>

        {/* Contact Column */}
        <div style={{ flex: "1 1 250px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Contacto
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", color: "#d1d5db", fontSize: "0.95rem" }}>
            <p>Email: contacto@carlamartinez.com</p>
            <p>Ubicación: Caracas, Venezuela</p>
            <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", backgroundColor: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "50%" }}>
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", backgroundColor: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "50%" }}>
                <Facebook size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", backgroundColor: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "50%" }}>
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", paddingTop: "24px", color: "#9ca3af", fontSize: "0.85rem" }}>
        <p>© 2026 Carla Martinez. Todos los derechos reservados.</p>
        <p>Diseñado por Villegas.</p>
      </div>
    </footer>
  );
}
