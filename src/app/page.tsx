import FadeIn from "@/components/FadeIn";
import { Play } from "lucide-react";

export default function Home() {
  return (
    <div style={{ width: "100%" }}>
      {/* Hero Section */}
      <div style={{ position: "relative", width: "100%", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", marginTop: "-100px" }}>
        
        {/* Background Image */}
        <img 
          src="/pagina-de-inicio.jpg" 
          alt="Dra. Carla Martinez" 
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "left bottom", zIndex: -1 }} 
        />
        
        {/* Foreground Content */}
        <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 24px", paddingTop: "100px" }}>
          <FadeIn delay={100} direction="up">
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ maxWidth: "550px" }}>
                <h1 className="heading-1" style={{ textAlign: "left", fontSize: "4.5rem", marginBottom: "24px", lineHeight: 1.1 }}>
                  Salud mental, <br/>al alcance de tu mano.
                </h1>
                <p className="text-muted" style={{ fontSize: "1.25rem", lineHeight: 1.8, textAlign: "left" }}>
                  Un espacio seguro para tu desarrollo personal, talleres que transforman tu vida y recursos exclusivos para acompañarte en tu proceso.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "240px", alignItems: "center", paddingTop: "140px", paddingBottom: "160px" }}>

      {/* Reservaciones Section */}
      <FadeIn delay={200} direction="up" style={{ width: "100%", maxWidth: "1100px", padding: "0 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "60px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 500px" }}>
            <h2 className="heading-2" style={{ fontSize: "3.5rem", margin: "0 0 32px 0", letterSpacing: "-1px" }}>Reservaciones</h2>
            <p className="text-muted" style={{ fontSize: "1.15rem", lineHeight: 1.8, marginBottom: "24px", textAlign: "justify" }}>
              <b>La terapia psicológica</b> es una herramienta fundamental evaluada según tus necesidades personales. Está diseñada para que puedas desarrollar tu inteligencia emocional, manejar la ansiedad y superar obstáculos. <b>Este espacio es confidencial y seguro</b>, ideal para escucharte, orientarte y brindarte las herramientas necesarias para alcanzar tu bienestar emocional y mental.
            </p>
            <p className="text-muted" style={{ fontSize: "1.15rem", lineHeight: 1.8, marginBottom: "40px", textAlign: "justify" }}>
              Agenda tu consulta presencial o virtual. Te guiaremos paso a paso en tu proceso de sanación y crecimiento personal.
            </p>
            <a href="/reservaciones" className="btn-primary" style={{ display: "inline-block", padding: "16px 32px", fontSize: "1.05rem", borderRadius: "8px" }}>Agendar tu cita</a>
          </div>
          
          <div style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", alignItems: "center", margin: "0 auto" }}>
            <div style={{ width: "100%", aspectRatio: "9/16", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", border: "4px solid #fff" }}>
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80" alt="Consultas Psicológicas" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#ff0050", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", boxShadow: "0 10px 20px rgba(255, 0, 80, 0.4)" }}>
                <Play size={32} fill="currentColor" style={{ marginLeft: "4px" }} />
              </div>
            </div>
            <p style={{ marginTop: "20px", fontSize: "0.95rem", color: "#6b7280", textAlign: "center", maxWidth: "280px" }}>
              Te guiamos paso a paso desde cero hasta mejorar completamente tu bienestar.
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Talleres Section */}
      <FadeIn delay={300} direction="up" style={{ width: "100%", maxWidth: "1100px", padding: "0 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap-reverse", gap: "60px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", alignItems: "center", margin: "0 auto" }}>
            <div style={{ width: "100%", aspectRatio: "9/16", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", border: "4px solid #fff" }}>
              <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80" alt="Talleres de bienestar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#ff0050", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", boxShadow: "0 10px 20px rgba(255, 0, 80, 0.4)" }}>
                <Play size={32} fill="currentColor" style={{ marginLeft: "4px" }} />
              </div>
            </div>
            <p style={{ marginTop: "20px", fontSize: "0.95rem", color: "#6b7280", textAlign: "center", maxWidth: "280px" }}>
              Descubre nuevas dinámicas y conecta con personas en tu misma sintonía.
            </p>
          </div>

          <div style={{ flex: "1 1 500px" }}>
            <h2 className="heading-2" style={{ fontSize: "3.5rem", margin: "0 0 32px 0", letterSpacing: "-1px" }}>Talleres</h2>
            <p className="text-muted" style={{ fontSize: "1.15rem", lineHeight: 1.8, marginBottom: "24px", textAlign: "justify" }}>
              <b>Los talleres grupales</b> son experiencias inmersivas diseñadas para profundizar en temas específicos como autoestima, relaciones interpersonales y manejo del estrés. Aprender en comunidad te permite descubrir nuevas perspectivas y sentirte acompañado en tu crecimiento.
            </p>
            <p className="text-muted" style={{ fontSize: "1.15rem", lineHeight: 1.8, marginBottom: "40px", textAlign: "justify" }}>
              Reserva tu lugar en nuestros próximos eventos y comienza a transformar tu vida diaria con herramientas prácticas.
            </p>
            <a href="/talleres" className="btn-secondary" style={{ display: "inline-block", padding: "16px 32px", fontSize: "1.05rem", borderRadius: "8px" }}>Explorar talleres</a>
          </div>
        </div>
      </FadeIn>

      {/* Tienda Section */}
      <FadeIn delay={400} direction="up" style={{ width: "100%", maxWidth: "1100px", padding: "0 24px" }}>
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
