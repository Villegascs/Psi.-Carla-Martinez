"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

export default function GlobalFooter() {
  const pathname = usePathname();

  // Ocultar el footer global en todas las rutas de /admin o rutas específicas si es necesario
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer style={{ backgroundColor: "#ffffff", color: "#111827", padding: "60px 24px 24px 24px", marginTop: "auto", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
      <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "space-between", paddingBottom: "40px", borderBottom: "1px solid rgba(0, 0, 0, 0.1)" }}>
        
        {/* Brand Column */}
        <div style={{ flex: "1 1 250px" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "16px", letterSpacing: "1px", textTransform: "uppercase", color: "#111827" }}>
            Carla Martinez
          </h3>
          <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "300px" }}>
            Especialista en psicología clínica, comprometida con tu bienestar mental y crecimiento personal.
          </p>
        </div>

        {/* Links Column */}
        <div style={{ flex: "1 1 250px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px", color: "#111827" }}>
            Enlaces Rápidos
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link href="/" style={{ color: "#4b5563", textDecoration: "none", fontSize: "0.95rem" }} className="footer-link">Inicio</Link>
            <Link href="/reservaciones" style={{ color: "#4b5563", textDecoration: "none", fontSize: "0.95rem" }} className="footer-link">Reservaciones</Link>
            <Link href="/talleres" style={{ color: "#4b5563", textDecoration: "none", fontSize: "0.95rem" }} className="footer-link">Talleres</Link>
            <Link href="/tienda" style={{ color: "#4b5563", textDecoration: "none", fontSize: "0.95rem" }} className="footer-link">Tienda</Link>
          </div>
        </div>

        {/* Contact Column */}
        <div style={{ flex: "1 1 250px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px", color: "#111827" }}>
            Contacto
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", color: "#4b5563", fontSize: "0.95rem" }}>
            <p>Email: contacto@carlamartinez.com</p>
            <p>Ubicación: Caracas, Venezuela</p>
            <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
              <a href="https://www.instagram.com/carla___martinez/" target="_blank" rel="noopener noreferrer" className="social-icon instagram-icon">
                <FaInstagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon facebook-icon">
                <FaFacebook size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon youtube-icon">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: "24px", color: "#6b7280", fontSize: "0.85rem" }}>
        <p>© 2026 Psi Carla Martinez | Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
