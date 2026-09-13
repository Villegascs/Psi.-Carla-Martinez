import FadeIn from "@/components/FadeIn";
import { Play, Laptop, Users } from "lucide-react";

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

      {/* Tienda Section */}
      <FadeIn delay={400} direction="up" style={{ width: "100%", maxWidth: "1100px", padding: "0 24px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "60px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 500px" }}>
            <h2 className="heading-2" style={{ fontSize: "3.5rem", margin: "0 0 32px 0", letterSpacing: "-1px" }}>Tienda</h2>
            <p className="text-muted" style={{ fontSize: "1.15rem", lineHeight: 1.8, marginBottom: "24px", textAlign: "justify" }}>
              <b>Nuestra tienda oficial</b> ofrece recursos terapéuticos cuidadosamente seleccionados. Desde libretas para journaling y apuntes emocionales, hasta libros recomendados y mercancía exclusiva para acompañarte a diario.
            </p>
            <p className="text-muted" style={{ fontSize: "1.15rem", lineHeight: 1.8, marginBottom: "40px", textAlign: "justify" }}>
              Lleva tu proceso de sanación a todas partes con herramientas físicas que complementan tu desarrollo personal.
            </p>
            <a href="/tienda" className="btn-primary" style={{ display: "inline-block", padding: "16px 32px", fontSize: "1.05rem", borderRadius: "8px" }}>Ir a la tienda</a>
          </div>
          
          <div style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", alignItems: "center", margin: "0 auto" }}>
            <div style={{ width: "100%", aspectRatio: "9/16", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", border: "4px solid #fff" }}>
              <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80" alt="Tienda oficial" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#ff0050", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", boxShadow: "0 10px 20px rgba(255, 0, 80, 0.4)" }}>
                <Play size={32} fill="currentColor" style={{ marginLeft: "4px" }} />
              </div>
            </div>
            <p style={{ marginTop: "20px", fontSize: "0.95rem", color: "#6b7280", textAlign: "center", maxWidth: "280px" }}>
              Recursos físicos que complementan y potencian tu trabajo interno.
            </p>
          </div>
        </div>
      </FadeIn>

    </div>
    </div>
  );
}
