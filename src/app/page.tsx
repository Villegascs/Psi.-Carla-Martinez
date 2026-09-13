import FadeIn from "@/components/FadeIn";
import { Play, Laptop, Users } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";

export default function Home() {
  return (
    <div style={{ width: "100%" }}>
      {/* Hero Section — Imagen completa, sin recortes */}
      <div style={{ 
        /* Rompe el padding del container para ancho completo */
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginTop: "-40px",
        backgroundColor: "#ffffff",
        lineHeight: 0,
      }}>
        {/* width: 100% + height: auto = imagen NUNCA se recorta */}
        <img
          src="/Portada.png"
          alt="Dra. Carla Martinez — Portada"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "240px", alignItems: "stretch", paddingTop: "140px", paddingBottom: "160px" }}>

      {/* Reservaciones Section — separado 85px de la izquierda, foto a la derecha a futuro */}
      <FadeIn delay={200} direction="up" style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        paddingLeft: "85px",
        paddingRight: "24px",
        boxSizing: "border-box",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "60px",
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
              fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
              fontWeight: 700,
              letterSpacing: "-2px",
              lineHeight: 1.05,
              margin: "0 0 12px 0",
              color: "#111111",
            }}>Reservaciones</h2>
            <p style={{ fontSize: "1rem", color: "#555", marginBottom: "56px" }}>
              Agenda tu cita virtual de forma rápida y segura.
            </p>

            {/* 3 Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginBottom: "52px" }}>
              {/* Step 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <img src="/reservaciones/usuario.png" alt="Ingresa tus datos" style={{ width: "64px", height: "64px", flexShrink: 0 }} />
                <span style={{ fontSize: "1.35rem", fontWeight: 500, color: "#111111" }}>Ingresa tus Datos</span>
              </div>
              {/* Step 2 */}
              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <img src="/reservaciones/fecha.png" alt="Elige fecha y plan" style={{ width: "64px", height: "64px", flexShrink: 0 }} />
                <span style={{ fontSize: "1.35rem", fontWeight: 500, color: "#111111" }}>Elige fecha, hora y Plan</span>
              </div>
              {/* Step 3 */}
              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <img src="/reservaciones/check.png" alt="Realiza el pago" style={{ width: "64px", height: "64px", flexShrink: 0 }} />
                <span style={{ fontSize: "1.35rem", fontWeight: 500, color: "#111111" }}>Realiza el pago y te verificamos</span>
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
          <div style={{ flex: "1 1 0", minWidth: 0 }} />

        </div>
      </FadeIn>


      {/* Talleres Section — foto a la izquierda a futuro, contenido a la derecha con separación de 85px */}
      <FadeIn delay={300} direction="up" style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        paddingLeft: "24px",
        paddingRight: "85px",
        boxSizing: "border-box",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "60px",
          width: "100%",
        }}>

          {/* LEFT — espacio limpio para futura foto */}
          <div style={{ flex: "1 1 0", minWidth: 0 }} />

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
              fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
              fontWeight: 700,
              letterSpacing: "-2px",
              lineHeight: 1.05,
              margin: "0 0 12px 0",
              color: "#111111",
            }}>Talleres</h2>
            <p style={{ fontSize: "1rem", color: "#555", marginBottom: "40px", maxWidth: "460px", lineHeight: 1.45 }}>
              Formación Practica para tu Desarrollo Personal y Profesional
            </p>

            {/* 2 Cards: Virtuales y Presenciales — Diseñadas con HTML/CSS prémium */}
            <div style={{
              display: "flex",
              gap: "24px",
              alignItems: "stretch",
              marginBottom: "44px",
              maxWidth: "520px",
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
        <div style={{
          paddingLeft: "85px",
          paddingRight: "24px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "60px",
          width: "100%",
        }}>
          {/* LEFT — contenido */}
          <div style={{ flex: "0 1 580px", maxWidth: "580px", minWidth: 0, width: "100%" }}>
            {/* Title + subtitle */}
            <h2 style={{
              fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
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

            {/* Logos Tienda: Envíos a todo el país, Pagos seguros, Productos con propósito */}
            <div style={{ marginTop: "44px", maxWidth: "480px" }}>
              <img
                src="/tienda/logos.png"
                alt="Envíos a todo el país - Pagos seguros - Productos con propósito"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>{/* END LEFT */}

          {/* RIGHT — espacio limpio reservado para futura foto */}
          <div style={{ flex: "1 1 0", minWidth: 0 }} />
        </div>

        {/* Carrusel de Productos en movimiento continuo derecha a izquierda */}
        <ProductCarousel />
      </FadeIn>

    </div>
    </div>
  );
}
