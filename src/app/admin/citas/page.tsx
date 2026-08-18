import AppointmentsList from './AppointmentsList';
import PlansManager from './PlansManager';

export default function AdminCitasPage() {
  return (
    <div>
      <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '24px' }}>Gestión de Reservaciones</h1>
      
      <PlansManager />

      <AppointmentsList />
    </div>
  );
}
