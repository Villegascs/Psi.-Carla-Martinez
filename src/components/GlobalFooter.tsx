"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaInstagram, FaYoutube } from "react-icons/fa";

export default function GlobalFooter() {
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <style>{`
        .footer-root {
          background: linear-gradient(160deg, #1a0f0a 0%, #0f0806 60%, #130d09 100%);
          color: #e8ddd6;
          padding: 72px 24px 0 24px;
          margin-top: auto;
          position: relative;
          overflow: hidden;
        }

        .footer-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 10% 0%, rgba(176, 139, 110, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 35% at 90% 80%, rgba(176, 139, 110, 0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .footer-root::after {
          content: '';
          position: absolute;
          top: 0;
          left: 24px;
          right: 24px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(176, 139, 110, 0.5) 30%, rgba(176, 139, 110, 0.8) 50%, rgba(176, 139, 110, 0.5) 70%, transparent 100%);
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          gap: 60px;
          padding-bottom: 56px;
          border-bottom: 1px solid rgba(176, 139, 110, 0.15);
        }

        /* Brand */
        .footer-brand-name {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ffffff;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-brand-name::before {
          content: '';
          display: inline-block;
          width: 28px;
          height: 2px;
          background: linear-gradient(90deg, #b08b6e, #d4a882);
          border-radius: 2px;
          flex-shrink: 0;
        }

        .footer-brand-tagline {
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #b08b6e;
          margin-bottom: 20px;
          padding-left: 38px;
        }

        .footer-brand-desc {
          color: rgba(232, 221, 214, 0.65);
          font-size: 0.9rem;
          line-height: 1.75;
          max-width: 280px;
        }

        .footer-social-row {
          display: flex;
          gap: 12px;
          margin-top: 28px;
        }

        .footer-social-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px 9px 12px;
          border-radius: 50px;
          border: 1px solid rgba(176, 139, 110, 0.3);
          background: rgba(176, 139, 110, 0.06);
          color: rgba(232, 221, 214, 0.75);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }

        .footer-social-btn:hover {
          background: rgba(176, 139, 110, 0.18);
          border-color: rgba(176, 139, 110, 0.65);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(176, 139, 110, 0.2);
        }

        .footer-social-btn svg {
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }

        .footer-social-btn:hover svg {
          transform: scale(1.15);
        }

        /* Columns */
        .footer-col-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #b08b6e;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-col-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(176, 139, 110, 0.2);
          border-radius: 1px;
        }

        .footer-nav-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footer-nav-link {
          color: rgba(232, 221, 214, 0.6);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 400;
          padding: 7px 10px 7px 0;
          border-bottom: 1px solid rgba(176, 139, 110, 0.07);
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.22s ease;
          position: relative;
          overflow: hidden;
        }

        .footer-nav-link::before {
          content: '';
          display: inline-block;
          width: 14px;
          height: 1px;
          background: #b08b6e;
          border-radius: 1px;
          flex-shrink: 0;
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.22s ease;
        }

        .footer-nav-link:hover {
          color: #ffffff;
          padding-left: 4px;
        }

        .footer-nav-link:hover::before {
          opacity: 1;
          transform: translateX(0);
        }

        /* Contact */
        .footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          color: rgba(232, 221, 214, 0.6);
          font-size: 0.88rem;
          line-height: 1.5;
        }

        .footer-contact-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(176, 139, 110, 0.1);
          border: 1px solid rgba(176, 139, 110, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.85rem;
        }

        .footer-contact-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(176, 139, 110, 0.8);
          margin-bottom: 2px;
        }

        .footer-contact-value {
          color: rgba(232, 221, 214, 0.75);
          font-size: 0.88rem;
        }

        /* Bottom bar */
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0 24px 0;
          gap: 16px;
          flex-wrap: wrap;
        }

        .footer-copy {
          font-size: 0.8rem;
          color: rgba(232, 221, 214, 0.35);
          letter-spacing: 0.03em;
        }

        .footer-copy span {
          color: rgba(176, 139, 110, 0.7);
        }

        .footer-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: rgba(232, 221, 214, 0.3);
          letter-spacing: 0.05em;
        }

        .footer-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(176, 139, 110, 0.5);
        }

        /* Responsive */
        @media (max-width: 860px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .footer-brand-col {
            grid-column: 1 / -1;
          }
          .footer-brand-desc {
            max-width: 100%;
          }
          .footer-social-row {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 540px) {
          .footer-root {
            padding: 56px 20px 0 20px;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .footer-bottom {
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>

      <footer className="footer-root">
        <div className="footer-inner">
          <div className="footer-grid">

            {/* Brand Column */}
            <div className="footer-brand-col">
              <p className="footer-brand-name">Carla Martinez</p>
              <p className="footer-brand-tagline">Psicología Clínica</p>
              <p className="footer-brand-desc">
                Especialista en psicología clínica, comprometida con tu bienestar mental y crecimiento personal. Un espacio seguro para sanar y crecer.
              </p>

              <div className="footer-social-row">
                <a
                  href="https://www.instagram.com/carla___martinez/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  aria-label="Instagram de Carla Martinez"
                >
                  <FaInstagram size={15} />
                  Instagram
                </a>
                <a
                  href="https://youtube.com/@carla___martinez?si=aOGZwa25JQls-CDb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  aria-label="YouTube de Carla Martinez"
                >
                  <FaYoutube size={15} />
                  YouTube
                </a>
              </div>
            </div>

            {/* Links Column */}
            <div>
              <h3 className="footer-col-title">Navegación</h3>
              <nav className="footer-nav-links">
                <Link href="/" className="footer-nav-link">Inicio</Link>
                <Link href="/reservaciones" className="footer-nav-link">Reservaciones</Link>
                <Link href="/talleres" className="footer-nav-link">Talleres</Link>
                <Link href="/tienda" className="footer-nav-link">Tienda</Link>
              </nav>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="footer-col-title">Contacto</h3>

              <div className="footer-contact-item">
                <div className="footer-contact-icon">✉</div>
                <div>
                  <span className="footer-contact-label">Email</span>
                  <span className="footer-contact-value">contacto@carlamartinez.com</span>
                </div>
              </div>

              <div className="footer-contact-item">
                <div className="footer-contact-icon">📍</div>
                <div>
                  <span className="footer-contact-label">Ubicación</span>
                  <span className="footer-contact-value">Caracas, Venezuela</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <p className="footer-copy">
              © 2026 <span>Psi Carla Martinez</span> · Todos los derechos reservados.
            </p>
            <div className="footer-badge">
              <span className="footer-badge-dot"></span>
              Psicología con propósito
              <span className="footer-badge-dot"></span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
