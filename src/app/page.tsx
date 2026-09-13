import FadeIn from "@/components/FadeIn";
import { Play, Laptop, Users, Truck, ShieldCheck, Leaf } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";

export default function Home() {
  return (
    <div style={{ width: "100%" }}>
      {/* Hero Section — Portada Adaptable Desktop / Mobile (sin recortes) */}
      <div className="hero-cover-container" style={{ 
        /* Rompe el padding de 24px exacto del container */
        width: "calc(100% + 48px)",
        marginLeft: "-24px",
        marginRight: "-24px",
        marginTop: "-40px",
        backgroundColor: "transparent",
        lineHeight: 0,
        overflow: "hidden",
        display: "flex",
        justifyContent: "center"
      }}>
        {/* En móvil (<= 768px) carga la portada vertical 1080x1920 y en desktop la horizontal */}
        <picture style={{ display: "block", width: "100%" }}>
          <source media="(max-width: 768px)" srcSet="/Portada-telefono.png" />
          <img
            src="/Portada.png"
            alt="Dra. Carla Martinez — Portada"
            className="hero-cover-img"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </picture>
      </div>

      <div className="home-sections-flow">

      {/* Reservaciones Section — separado 85px de la izquierda, foto a la derecha a futuro */}
      <FadeIn delay={0} direction="up" className="section-reservaciones-padding" style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        boxSizing: "border-box",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "clamp(20px, 4vw, 60px)",
          width: "100%",
        }}>

          {/* LEFT — contenido */}
          <div style={{ flex: "0 1 580px", maxWidth: "580px", minWidth: 0, width: "100%" }}>
            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
              <span style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#111111",
              }}>TU TIEMPO SÍ IMPORTA</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#111111", maxWidth: "80px" }} />
            </div>

            {/* Title + subtitle */}
            <h2 style={{
              fontSize: "clamp(2.1rem, 7vw, 4.2rem)",
              fontWeight: 700,
              letterSpacing: "-2px",
              lineHeight: 1.05,
              margin: "0 0 12px 0",
              color: "#111111",
            }}>Reservaciones</h2>
            <p style={{ fontSize: "1rem", color: "#555", marginBottom: "clamp(24px, 4vw, 56px)" }}>
              Agenda tu cita virtual de forma rápida y segura.
            </p>

            {/* 3 Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 3.5vw, 32px)", marginBottom: "clamp(28px, 5vw, 52px)" }}>
              {/* Step 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 3vw, 24px)" }}>
                <img src="/reservaciones/usuario.png" alt="Ingresa tus datos" style={{ width: "clamp(48px, 11vw, 64px)", height: "clamp(48px, 11vw, 64px)", flexShrink: 0 }} />
                <span style={{ fontSize: "clamp(1.05rem, 3.8vw, 1.35rem)", fontWeight: 500, color: "#111111" }}>Ingresa tus Datos</span>
              </div>
              {/* Step 2 */}
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 3vw, 24px)" }}>
                <img src="/reservaciones/fecha.png" alt="Elige fecha y plan" style={{ width: "clamp(48px, 11vw, 64px)", height: "clamp(48px, 11vw, 64px)", flexShrink: 0 }} />
                <span style={{ fontSize: "clamp(1.05rem, 3.8vw, 1.35rem)", fontWeight: 500, color: "#111111" }}>Elige fecha, hora y Plan</span>
              </div>
              {/* Step 3 */}
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 3vw, 24px)" }}>
                <img src="/reservaciones/check.png" alt="Realiza el pago" style={{ width: "clamp(48px, 11vw, 64px)", height: "clamp(48px, 11vw, 64px)", flexShrink: 0 }} />
                <span style={{ fontSize: "clamp(1.05rem, 3.8vw, 1.35rem)", fontWeight: 500, color: "#111111" }}>Realiza el pago y te verificamos</span>
              </div>
            </div>

            {/* CTA Button */}
            <a href="/reservaciones" className="btn-reserva">
              RESERVA AHORA
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 8H19M19 8L12 1M19 8L12 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>{/* END LEFT */}

          {/* RIGHT — espacio reservado para futura foto (limpio, sin caja) */}
          <div className="desktop-spacer" style={{ flex: "1 1 0", minWidth: 0 }} />

        </div>
      </FadeIn>


      {/* Talleres Section — foto a la izquierda a futuro, contenido a la derecha con separación de 85px */}
      <FadeIn delay={300} direction="up" className="section-talleres-padding" style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        boxSizing: "border-box",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "clamp(20px, 4vw, 60px)",
          width: "100%",
        }}>

          {/* LEFT — espacio limpio para futura foto */}
          <div className="desktop-spacer" style={{ flex: "1 1 0", minWidth: 0 }} />

          {/* RIGHT — contenido de Talleres */}
          <div style={{ flex: "0 1 580px", maxWidth: "580px", minWidth: 0, width: "100%" }}>
            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
              <span style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#111111",
              }}>APRENDE - CONECTA - CRECE</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#111111", maxWidth: "80px" }} />
            </div>

            {/* Title + subtitle */}
            <h2 style={{
              fontSize: "clamp(2.1rem, 7vw, 4.2rem)",
              fontWeight: 700,
              letterSpacing: "-2px",
              lineHeight: 1.05,
              margin: "0 0 12px 0",
              color: "#111111",
            }}>Talleres</h2>
            <p style={{ fontSize: "1rem", color: "#555", marginBottom: "clamp(24px, 4vw, 40px)", maxWidth: "460px", lineHeight: 1.45 }}>
              Formación Practica para tu Desarrollo Personal y Profesional
            </p>

            {/* 2 Cards: Virtuales y Presenciales — Diseñadas con HTML/CSS prémium */}
            <div className="card-taller-grid" style={{
              display: "flex",
              gap: "24px",
              alignItems: "stretch",
              marginBottom: "44px",
              maxWidth: "520px",
              width: "100%",
              flexWrap: "wrap",
            }}>
              <a href="/talleres" className="card-taller">
                <div className="card-taller-icon-wrapper">
                  <Laptop size={32} strokeWidth={1.9} />
                </div>
                <h3 className="card-taller-title">Virtuales</h3>
                <p className="card-taller-desc">Aprende desde donde estés</p>
              </a>

              <a href="/talleres" className="card-taller">
                <div className="card-taller-icon-wrapper">
                  <Users size={32} strokeWidth={1.9} />
                </div>
                <h3 className="card-taller-title">Presenciales</h3>
                <p className="card-taller-desc">Vive la experiencia en persona</p>
              </a>
            </div>

            {/* CTA Button */}
            <a href="/talleres" className="btn-reserva">
              CONOCE NUESTROS TALLERES
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 8H19M19 8L12 1M19 8L12 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>{/* END RIGHT */}

        </div>
      </FadeIn>

      {/* Tienda Section — diseño oficial: contenido a la izquierda (separado 85px) + carrusel continuo abajo */}
      <FadeIn delay={400} direction="up" style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        boxSizing: "border-box",
      }}>
        {/* Top: Intro a la izquierda (referencia TIENDA.png) */}
        <div className="section-tienda-padding" style={{
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "clamp(20px, 4vw, 60px)",
          width: "100%",
        }}>
          {/* LEFT — contenido */}
          <div style={{ flex: "0 1 580px", maxWidth: "580px", minWidth: 0, width: "100%" }}>
            {/* Title + subtitle */}
            <h2 style={{
              fontSize: "clamp(2.1rem, 7vw, 4.2rem)",
              fontWeight: 700,
              letterSpacing: "-2px",
              lineHeight: 1.05,
              margin: "0 0 14px 0",
              color: "#111111",
            }}>Tienda</h2>
            <p style={{ fontSize: "1rem", color: "#555", marginBottom: "40px", lineHeight: 1.45 }}>
              Productos que inspiran tu crecimiento
            </p>

            {/* CTA Button */}
            <a href="/tienda" className="btn-reserva">
              EXPLORA NUESTRA TIENDA
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 8H19M19 8L12 1M19 8L12 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>

            {/* Beneficios / Garantías Tienda diseñados con alta estética */}
            <div className="tienda-features-grid">
              <div className="tienda-feature-card">
                <div className="tienda-feature-icon">
                  <Truck size={22} strokeWidth={1.9} />
                </div>
                <div className="tienda-feature-info">
                  <span className="tienda-feature-title">Envíos a todo el país</span>
                  <span className="tienda-feature-sub">Rápidos y asegurados</span>
                </div>
              </div>

              <div className="tienda-feature-card">
                <div className="tienda-feature-icon">
                  <ShieldCheck size={22} strokeWidth={1.9} />
                </div>
                <div className="tienda-feature-info">
                  <span className="tienda-feature-title">Pagos seguros</span>
                  <span className="tienda-feature-sub">100% protegidos</span>
                </div>
              </div>

              <div className="tienda-feature-card">
                <div className="tienda-feature-icon">
                  <Leaf size={22} strokeWidth={1.9} />
                </div>
                <div className="tienda-feature-info">
                  <span className="tienda-feature-title">Con propósito</span>
                  <span className="tienda-feature-sub">Para tu bienestar</span>
                </div>
              </div>
            </div>
          </div>{/* END LEFT */}

          {/* RIGHT — espacio limpio reservado para futura foto */}
          <div className="desktop-spacer" style={{ flex: "1 1 0", minWidth: 0 }} />
        </div>

        {/* Carrusel de Productos en movimiento continuo derecha a izquierda */}
        <ProductCarousel />
      </FadeIn>

    </div>
    </div>
  );
}
