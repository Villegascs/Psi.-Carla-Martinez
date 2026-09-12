"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function GlobalHeader() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY.current;

        if (currentScrollY < 80) {
          // At the top — always show
          nav.style.transform = "translateY(0)";
        } else if (diff > 0) {
          // Scrolling DOWN — hide header
          nav.style.transform = "translateY(calc(-100% - 24px))";
        } else if (diff < 0) {
          // Scrolling UP — show header
          nav.style.transform = "translateY(0)";
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
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      paddingTop: "16px",
      pointerEvents: "none",
    }}>
      <nav
        ref={navRef}
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "40px",
          backgroundColor: "rgba(28, 22, 18, 0.82)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "999px",
          padding: "10px 16px 10px 20px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.08)",
          maxWidth: "900px",
          width: "calc(100% - 48px)",
          /* Directionally-aware slide animation */
          transform: "translateY(0)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform",
        }}
      >

        {/* Logo */}
        <Link href="/" style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          letterSpacing: "-0.5px",
          color: "#ffffff",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          Carla Martinez.
        </Link>

        {/* Nav links */}
        <div style={{
          display: "flex",
          gap: "32px",
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
        }}>
          <Link href="/" className="luzen-nav-link">Inicio</Link>
          <Link href="/reservaciones" className="luzen-nav-link">Reservaciones</Link>
          <Link href="/talleres" className="luzen-nav-link">Talleres</Link>
          <Link href="/tienda" className="luzen-nav-link">Tienda</Link>
          <Link href="/contacto" className="luzen-nav-link">Contacto</Link>
        </div>

        {/* CTA Button */}
        <Link
          href="/reservaciones"
          style={{
            backgroundColor: "#ffffff",
            color: "#1a1a1a",
            fontWeight: 600,
            fontSize: "0.9rem",
            padding: "10px 22px",
            borderRadius: "999px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "background-color 0.2s ease, transform 0.2s ease",
            display: "inline-flex",
            alignItems: "center",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#f0f0f0";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#ffffff";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          Agendar cita
        </Link>

      </nav>
    </header>
  );
}
