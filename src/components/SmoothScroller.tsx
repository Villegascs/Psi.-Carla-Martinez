"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import "lenis/dist/lenis.css";

interface SmoothScrollerProps {
  children: ReactNode;
}

export default function SmoothScroller({ children }: SmoothScrollerProps) {
  const pathname = usePathname();

  // Desactivar el smooth scrolling en el panel de admin porque rompe el position: fixed
  if (pathname && pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Configured default smooth scrolling parameters
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
