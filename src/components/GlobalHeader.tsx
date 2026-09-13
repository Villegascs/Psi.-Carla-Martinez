"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

export default function GlobalHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cerrar menú al cambiar de página
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Evitar scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY.current;

        // No ocultar el header si el menú móvil está abierto
        if (mobileOpen) {
          header.style.transform = "translateY(0)";
        } else if (currentScrollY < 80) {
          header.style.transform = "translateY(0)";
        } else if (diff > 0) {
          header.style.transform = "translateY(-100%)";
        } else if (diff < 0) {
          header.style.transform = "translateY(0)";
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileOpen]);

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        ref={headerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transform: "translateY(0)",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform",
          backgroundColor: "transparent",
          borderBottom: "none",
        }}
      >
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "16px clamp(16px, 4vw, 48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}>

          {/* Logo */}
          <Link href="/" style={{
            fontWeight: 700,
            fontSize: "1.15rem",
            letterSpacing: "-0.3px",
            color: "#111111",
            whiteSpace: "nowrap",
            flexShrink: 0,
            textDecoration: "none",
          }}>
            Carla Martinez.
          </Link>

          {/* Nav links — Desktop */}
          <nav className="header-desktop-nav">
            <Link href="/" className="nexbet-nav-link">Inicio</Link>
            <Link href="/reservaciones" className="nexbet-nav-link">Reservaciones</Link>
            <Link href="/talleres" className="nexbet-nav-link">Talleres</Link>
            <Link href="/tienda" className="nexbet-nav-link">Tienda</Link>
            <Link href="/contacto" className="nexbet-nav-link">Contacto</Link>
          </nav>

          {/* CTA Button — Desktop */}
          <Link
            href="/reservaciones"
            className="header-desktop-cta"
            style={{
              color: "#111111",
              fontWeight: 600,
              fontSize: "0.82rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "10px 24px",
              borderRadius: "999px",
              border: "1.5px solid rgba(0,0,0,0.75)",
              background: "transparent",
              whiteSpace: "nowrap",
              flexShrink: 0,
              textDecoration: "none",
              alignItems: "center",
              transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "#111111";
              el.style.color = "#ffffff";
              el.style.borderColor = "#111111";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.color = "#111111";
              el.style.borderColor = "rgba(0,0,0,0.75)";
            }}
          >
            Agendar cita
          </Link>

          {/* Botón menú hamburguesa para Móvil */}
          <button
            type="button"
            className="header-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X size={26} color="#111111" /> : <Menu size={26} color="#111111" />}
          </button>

        </div>
      </header>

      {/* Drawer Móvil Desplegable */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: "65px",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "36px 28px 48px 28px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: pathname === "/" ? "#b08b6e" : "#111111",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "12px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              Inicio
              <span>→</span>
            </Link>
            <Link
              href="/reservaciones"
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: pathname === "/reservaciones" ? "#b08b6e" : "#111111",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "12px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              Reservaciones
              <span>→</span>
            </Link>
            <Link
              href="/talleres"
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: pathname === "/talleres" ? "#b08b6e" : "#111111",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "12px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              Talleres
              <span>→</span>
            </Link>
            <Link
              href="/tienda"
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: pathname === "/tienda" ? "#b08b6e" : "#111111",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "12px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              Tienda
              <span>→</span>
            </Link>
            <Link
              href="/contacto"
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: pathname === "/contacto" ? "#b08b6e" : "#111111",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "12px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              Contacto
              <span>→</span>
            </Link>
          </nav>

          <Link
            href="/reservaciones"
            onClick={() => setMobileOpen(false)}
            className="btn-reserva"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "16px",
              fontSize: "0.95rem",
              borderRadius: "14px",
            }}
          >
            AGENDAR CITA
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 8H19M19 8L12 1M19 8L12 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      )}
    </>
  );
}
