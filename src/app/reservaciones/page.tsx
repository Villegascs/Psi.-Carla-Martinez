import ReservationForm from "./ReservationForm";

export default function ReservacionesPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="heading-1" style={{ fontSize: "2.5rem" }}>Reserva tu Cita</h1>
        <p className="text-muted" style={{ fontSize: "1.1rem" }}>
          Completa tus datos y selecciona un horario disponible para agendar tu consulta psicológica.
        </p>
      </div>
      
      <div className="card">
        <ReservationForm />
      </div>
    </div>
  );
}
