import FadeIn from "@/components/FadeIn";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";

export default function ContactoPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "120px", paddingBottom: "100px", minHeight: "80vh" }}>
      <FadeIn delay={100} direction="up" style={{ width: "100%", maxWidth: "1100px", padding: "0 24px" }}>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "80px", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* Left Column - Photo */}
          <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: "450px", aspectRatio: "3/4", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", border: "4px solid #fff" }}>
              <img 
                src="/contacto.png" 
                alt="Carla Martinez" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div style={{ flex: "1 1 400px" }}>
            <span style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Conéctate conmigo</span>
            <h1 className="heading-1" style={{ fontSize: "3.5rem", margin: "12px 0 24px 0", letterSpacing: "-1px" }}>Contacto</h1>
            <p className="text-muted" style={{ fontSize: "1.15rem", lineHeight: 1.8, marginBottom: "40px" }}>
              Si tienes alguna duda sobre mis servicios, talleres o simplemente quieres dar el primer paso hacia tu bienestar, no dudes en escribirme. Estoy aquí para escucharte y guiarte.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "48px" }}>
              
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ backgroundColor: "rgba(0,0,0,0.05)", padding: "12px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Phone size={24} style={{ color: "var(--foreground)" }} />
                </div>
                <div>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "4px", fontWeight: 600 }}>Teléfono / WhatsApp</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: 500 }}>+58 0414-4083780</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ backgroundColor: "rgba(0,0,0,0.05)", padding: "12px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mail size={24} style={{ color: "var(--foreground)" }} />
                </div>
                <div>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "4px", fontWeight: 600 }}>Correo Electrónico</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: 500 }}>webcarlamartinez@gmail.com</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ backgroundColor: "rgba(0,0,0,0.05)", padding: "12px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin size={24} style={{ color: "var(--foreground)" }} />
                </div>
                <div>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "4px", fontWeight: 600 }}>Ubicación</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: 500 }}>Valencia, Estado Carabobo, Venezuela</p>
                </div>
              </div>

            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <a href="https://www.instagram.com/carla___martinez/" target="_blank" rel="noopener noreferrer" className="social-icon instagram-icon">
                <FaInstagram size={24} />
              </a>
              <a href="https://youtube.com/@carla___martinez?si=aOGZwa25JQls-CDb" target="_blank" rel="noopener noreferrer" className="social-icon youtube-icon">
                <FaYoutube size={24} />
              </a>
            </div>

          </div>
        </div>

      </FadeIn>
    </div>
  );
}
