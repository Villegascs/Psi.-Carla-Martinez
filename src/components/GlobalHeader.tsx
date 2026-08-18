"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GlobalHeader() {
  const pathname = usePathname();

  // Ocultar el header global en todas las rutas de /admin
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="glass-nav">
      <div className="container mobile-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "70px", padding: "12px 24px" }}>
        <div className="logo" style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.5px", marginBottom: "8px" }}>
          <Link href="/">Carla Martinez.</Link>
        </div>
        <nav className="mobile-wrap" style={{ display: "flex", gap: "16px", alignItems: "center", overflowX: "auto", paddingBottom: "4px" }}>
          <Link href="/reservaciones" style={{ fontWeight: 500, whiteSpace: "nowrap" }}>Reservaciones</Link>
          <Link href="/talleres" style={{ fontWeight: 500, whiteSpace: "nowrap" }}>Talleres</Link>
          <Link href="/tienda" style={{ fontWeight: 500, whiteSpace: "nowrap" }}>Tienda</Link>
          <Link href="/contacto" style={{ fontWeight: 500, whiteSpace: "nowrap" }}>Contacto</Link>
        </nav>
      </div>
    </header>
  );
}
