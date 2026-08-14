import AppointmentsList from './AppointmentsList';

export default function AdminCitasPage() {
  return (
    <div>
      <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '24px' }}>Gestión de Reservaciones</h1>
      
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 className="heading-2" style={{ fontSize: '1.25rem' }}>Configuración de Disponibilidad</h2>
        <p className="text-muted" style={{ marginBottom: '16px' }}>
          Configura los horarios y precios para las consultas.
        </p>
        <button className="btn-secondary">Configurar Horarios</button>
      </div>

      <AppointmentsList />
    </div>
  );
}
