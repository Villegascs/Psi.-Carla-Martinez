import ReservationForm from "./ReservationForm";

export default function ReservacionesPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "clamp(90px, 12vw, 130px) clamp(16px, 4vw, 24px) 40px", boxSizing: "border-box" }}>
      <ReservationForm />
    </div>
  );
}
