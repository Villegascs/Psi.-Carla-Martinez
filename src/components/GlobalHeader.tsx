"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function GlobalHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY.current;

        if (currentScrollY < 80) {
          // At the top — always show
          header.style.transform = "translateY(0)";
        } else if (diff > 0) {
          // Scrolling DOWN — hide header
          header.style.transform = "translateY(-100%)";
        } else if (diff < 0) {
          // Scrolling UP — show header
          header.style.transform = "translateY(0)";
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ocultar el header global en todas las rutas de /admin
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      ref={headerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        /* Directionally-aware slide animation */
        transform: "translateY(0)",
        transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "transform",
      }}
    >
      {/* Inner container — full width transparent, Nexbet style */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "22px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "40px",
      }}>

        {/* Logo */}
        <Link href="/" style={{
          fontWeight: 700,
          fontSize: "1.15rem",
          letterSpacing: "-0.3px",
          color: "#ffffff",
          whiteSpace: "nowrap",
          flexShrink: 0,
          textDecoration: "none",
        }}>
          Carla Martinez.
        </Link>

        {/* Nav links — UPPERCASE, white, Nexbet style */}
        <nav style={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
        }}>
          <Link href="/" className="nexbet-nav-link">Inicio</Link>
          <Link href="/reservaciones" className="nexbet-nav-link">Reservaciones</Link>
          <Link href="/talleres" className="nexbet-nav-link">Talleres</Link>
          <Link href="/tienda" className="nexbet-nav-link">Tienda</Link>
          <Link href="/contacto" className="nexbet-nav-link">Contacto</Link>
        </nav>

        {/* CTA Button — Outlined white pill, Nexbet style */}
        <Link
          href="/reservaciones"
          style={{
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "0.82rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "11px 28px",
            borderRadius: "999px",
            border: "1.5px solid rgba(255,255,255,0.8)",
            background: "transparent",
            whiteSpace: "nowrap",
            flexShrink: 0,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "#ffffff";
            el.style.color = "#111111";
            el.style.borderColor = "#ffffff";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "transparent";
            el.style.color = "#ffffff";
            el.style.borderColor = "rgba(255,255,255,0.8)";
          }}
        >
          Agendar cita
        </Link>

      </div>
    </header>
  );
}
