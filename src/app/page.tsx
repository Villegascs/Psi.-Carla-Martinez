import FadeIn from "@/components/FadeIn";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "center", textAlign: "center", paddingTop: "60px" }}>
      <FadeIn delay={100} direction="up">
        <h1 className="heading-1">Salud mental, <br/>al alcance de tu mano.</h1>
        <p className="text-muted" style={{ maxWidth: "600px", margin: "0 auto", fontSize: "1.1rem" }}>
          Reserva tu cita psicológica, explora nuestros talleres exclusivos para tu desarrollo personal, o visita la tienda de mercancía oficial.
        </p>
      </FadeIn>

      <FadeIn delay={250} direction="up">
        <div style={{ display: "flex", gap: "16px" }}>
          <a href="/reservaciones" className="btn-primary">Reservar Cita</a>
          <a href="/talleres" className="btn-secondary">Ver Talleres</a>
        </div>
      </FadeIn>

      <div className="mobile-wrap" style={{ display: "flex", gap: "24px", marginTop: "40px", justifyContent: "center", width: "100%" }}>
        <FadeIn delay={400} direction="up" className="card" style={{ flex: "1 1 300px", maxWidth: "350px", textAlign: "left" }}>
          <h3 className="heading-2" style={{ fontSize: "1.25rem", marginBottom: "8px" }}>Reservaciones</h3>
          <p className="text-muted" style={{ fontSize: "0.95rem", marginBottom: "16px" }}>Agenda tu consulta presencial o virtual con facilidad.</p>
          <a href="/reservaciones" style={{ fontWeight: 600, fontSize: "0.9rem" }}>Agendar ahora &rarr;</a>
        </FadeIn>
        <FadeIn delay={500} direction="up" className="card" style={{ flex: "1 1 300px", maxWidth: "350px", textAlign: "left" }}>
          <h3 className="heading-2" style={{ fontSize: "1.25rem", marginBottom: "8px" }}>Talleres</h3>
          <p className="text-muted" style={{ fontSize: "0.95rem", marginBottom: "16px" }}>Participa en eventos y talleres de bienestar.</p>
          <a href="/talleres" style={{ fontWeight: 600, fontSize: "0.9rem" }}>Explorar talleres &rarr;</a>
        </FadeIn>
        <FadeIn delay={600} direction="up" className="card" style={{ flex: "1 1 300px", maxWidth: "350px", textAlign: "left" }}>
          <h3 className="heading-2" style={{ fontSize: "1.25rem", marginBottom: "8px" }}>Tienda</h3>
          <p className="text-muted" style={{ fontSize: "0.95rem", marginBottom: "16px" }}>Merch oficial y recursos exclusivos.</p>
          <a href="/tienda" style={{ fontWeight: 600, fontSize: "0.9rem" }}>Ir a la tienda &rarr;</a>
        </FadeIn>
      </div>
    </div>
  );
}
