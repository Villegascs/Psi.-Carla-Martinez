import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', margin: '-40px -24px' }}>
      <aside style={{ width: '250px', backgroundColor: 'var(--color-bg-primary)', borderRight: '1px solid var(--color-border)', padding: '24px' }}>
        <h2 className="heading-2" style={{ fontSize: '1.2rem', marginBottom: '32px' }}>Panel Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link href="/admin/citas" style={{ fontWeight: 500 }}>Reservaciones</Link>
          <Link href="/admin/tienda" style={{ fontWeight: 500 }}>Tienda (Órdenes)</Link>
          <Link href="/admin/talleres" style={{ fontWeight: 500 }}>Talleres</Link>
          <Link href="/admin/escaner" style={{ fontWeight: 500 }}>Escaner QR</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '40px', backgroundColor: 'var(--color-bg-secondary)' }}>
        {children}
      </main>
    </div>
  );
}
