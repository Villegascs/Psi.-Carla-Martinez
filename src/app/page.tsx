import FadeIn from "@/components/FadeIn";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "80px", alignItems: "center", paddingTop: "40px", paddingBottom: "60px" }}>
      
      {/* Hero Section */}
      <FadeIn delay={100} direction="up" style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="heading-1">Salud mental, <br/>al alcance de tu mano.</h1>
        <p className="text-muted" style={{ maxWidth: "600px", margin: "0 auto", fontSize: "1.1rem" }}>
          Un espacio seguro para tu desarrollo personal, talleres que transforman tu vida y recursos exclusivos para acompañarte en tu proceso.
        </p>
      </FadeIn>

      {/* Reservaciones Section */}
      <FadeIn delay={200} direction="up" style={{ width: "100%", maxWidth: "1000px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center", backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ flex: "1 1 400px", borderRadius: "16px", overflow: "hidden", minHeight: "350px", position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000&q=80" alt="Consultas Psicológicas" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
          </div>
          <div style={{ flex: "1 1 300px", padding: "20px 0" }}>
            <span style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Consultas</span>
            <h2 className="heading-2" style={{ fontSize: "2.2rem", margin: "12px 0 20px 0" }}>Reservaciones</h2>
            <p className="text-muted" style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "32px" }}>
              Agenda tu consulta presencial o virtual. Un espacio confidencial y seguro diseñado para escucharte, orientarte y brindarte las herramientas necesarias para alcanzar tu bienestar emocional y mental.
            </p>
            <a href="/reservaciones" className="btn-primary" style={{ display: "inline-block", padding: "14px 28px", fontSize: "1rem" }}>Agendar tu cita</a>
          </div>
        </div>
      </FadeIn>

      {/* Talleres Section */}
      <FadeIn delay={300} direction="up" style={{ width: "100%", maxWidth: "1000px" }}>
        <div style={{ display: "flex", flexWrap: "wrap-reverse", gap: "40px", alignItems: "center", backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ flex: "1 1 300px", padding: "20px 0" }}>
            <span style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Eventos</span>
            <h2 className="heading-2" style={{ fontSize: "2.2rem", margin: "12px 0 20px 0" }}>Talleres</h2>
            <p className="text-muted" style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "32px" }}>
              Participa en eventos y talleres grupales enfocados en el desarrollo personal, manejo de emociones y crecimiento integral. Aprende en comunidad y descubre nuevas perspectivas para tu vida diaria.
            </p>
            <a href="/talleres" className="btn-secondary" style={{ display: "inline-block", padding: "14px 28px", fontSize: "1rem" }}>Explorar talleres</a>
          </div>
          <div style={{ flex: "1 1 400px", borderRadius: "16px", overflow: "hidden", minHeight: "350px", position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80" alt="Talleres de bienestar" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
          </div>
        </div>
      </FadeIn>

      {/* Tienda Section */}
      <FadeIn delay={400} direction="up" style={{ width: "100%", maxWidth: "1000px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center", backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ flex: "1 1 400px", borderRadius: "16px", overflow: "hidden", minHeight: "350px", position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80" alt="Tienda oficial" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
          </div>
          <div style={{ flex: "1 1 300px", padding: "20px 0" }}>
            <span style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Mercancía</span>
            <h2 className="heading-2" style={{ fontSize: "2.2rem", margin: "12px 0 20px 0" }}>Tienda</h2>
            <p className="text-muted" style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "32px" }}>
              Adquiere mercancía oficial, libros recomendados, libretas de apuntes terapéuticos y recursos exclusivos para llevar tu proceso de sanación a todas partes.
            </p>
            <a href="/tienda" className="btn-primary" style={{ display: "inline-block", padding: "14px 28px", fontSize: "1rem" }}>Ir a la tienda</a>
          </div>
        </div>
      </FadeIn>

    </div>
  );
}
