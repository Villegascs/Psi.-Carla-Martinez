import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import GlobalHeader from "@/components/GlobalHeader";

import GlobalFooter from "@/components/GlobalFooter";

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
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <CartProvider>
          <GlobalHeader />
          <main className="container animate-fade-in" style={{ padding: "40px 24px", flex: "1 0 auto" }}>
            {children}
          </main>
          <GlobalFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
