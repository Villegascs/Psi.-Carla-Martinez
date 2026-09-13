"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Calendar, Store, ShoppingBag, BookOpen, Settings, User } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Si estamos en la página de login, no mostrar el sidebar
  if (pathname === '/admin/login') {
    return <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f9fafb', zIndex: 9999, overflowY: 'auto' }}>{children}</div>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Reservaciones', path: '/admin/citas', icon: Calendar },
    { name: 'Tienda (Inventario)', path: '/admin/tienda', icon: Store },
    { name: 'Órdenes de Tienda', path: '/admin/tienda/ordenes', icon: ShoppingBag },
    { name: 'Talleres', path: '/admin/talleres', icon: BookOpen },
    { name: 'Configuración', path: '/admin/configuracion', icon: Settings },
  ];

  return (
    <div className="admin-layout" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f3f4f6', zIndex: 9999 }}>
      {/* Sidebar Prémium */}
      <aside style={{ 
        width: '280px', 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid rgba(0,0,0,0.06)', 
        padding: '32px 24px', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#b08b6e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
            C
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111111', letterSpacing: '-0.02em', margin: 0, lineHeight: '1.4', paddingTop: '2px' }}>Panel Admin</h2>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#888888', fontWeight: 500, lineHeight: '1.4' }}>Carla Martinez</span>
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', paddingLeft: '12px' }}>Menú Principal</span>
          
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/admin');
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  fontWeight: isActive ? 600 : 500, 
                  fontSize: '0.95rem',
                  color: isActive ? '#b08b6e' : '#52525b',
                  backgroundColor: isActive ? '#faf6f0' : 'transparent',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#f4f4f5';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? '#b08b6e' : '#a1a1aa' }} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* User / Logout */}
        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px 16px', 
              backgroundColor: '#fff1f2', 
              color: '#e11d48', 
              border: '1px solid #ffe4e6', 
              borderRadius: '12px', 
              fontWeight: 600, 
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%',
              boxShadow: '0 2px 4px rgba(225, 29, 72, 0.05)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#ffe4e6';
              e.currentTarget.style.borderColor = '#fecdd3';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#fff1f2';
              e.currentTarget.style.borderColor = '#ffe4e6';
            }}
          >
            <LogOut size={18} strokeWidth={2.5} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '48px 56px', backgroundColor: '#f3f4f6', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
