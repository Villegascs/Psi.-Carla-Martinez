"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Si estamos en la página de login, no mostrar el sidebar
  if (pathname === '/admin/login') {
    return <div style={{ margin: '-40px -24px' }}>{children}</div>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="heading-2" style={{ fontSize: '1.2rem', marginBottom: '32px' }}>Panel Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
          <Link href="/admin/citas" style={{ fontWeight: 500 }}>Reservaciones</Link>
          <Link href="/admin/tienda" style={{ fontWeight: 500 }}>Tienda (Inventario)</Link>
          <Link href="/admin/tienda/ordenes" style={{ fontWeight: 500 }}>Órdenes de Tienda</Link>
          <Link href="/admin/talleres" style={{ fontWeight: 500 }}>Talleres</Link>
          <Link href="/admin/configuracion" style={{ fontWeight: 500 }}>Configuración</Link>
        </nav>
        
        <button 
          onClick={handleLogout}
          style={{ 
            marginTop: 'auto', 
            padding: '10px 16px', 
            backgroundColor: '#fee2e2', 
            color: '#ef4444', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: 600, 
            cursor: 'pointer',
            textAlign: 'center',
            transition: '0.2s',
            width: '100%'
          }}
        >
          Cerrar Sesión
        </button>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
