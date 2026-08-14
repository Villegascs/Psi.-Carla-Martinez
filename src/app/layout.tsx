import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "Carla Martinez | Psicóloga",
  description: "Reservación de citas psicológicas, talleres y tienda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
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
          <main className="container animate-fade-in" style={{ padding: "40px 24px", minHeight: "calc(100vh - 70px)" }}>
            {children}
          </main>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
