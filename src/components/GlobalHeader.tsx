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
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "70px" }}>
        <div className="logo" style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.5px" }}>
          <Link href="/">Carla Martinez.</Link>
        </div>
        <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/reservaciones" style={{ fontWeight: 500 }}>Reservaciones</Link>
          <Link href="/talleres" style={{ fontWeight: 500 }}>Talleres</Link>
          <Link href="/tienda" style={{ fontWeight: 500 }}>Tienda</Link>
          <Link href="/contacto" style={{ fontWeight: 500 }}>Contacto</Link>
        </nav>
      </div>
    </header>
  );
}
