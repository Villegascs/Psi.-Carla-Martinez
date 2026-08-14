"use client";

import { useState } from "react";

export default function AppointmentsList() {
  const [tab, setTab] = useState<'pending' | 'accepted'>('pending');

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
        <button 
          onClick={() => setTab('pending')}
          style={{ 
            padding: '12px 0', 
            fontWeight: 600, 
            color: tab === 'pending' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            borderBottom: tab === 'pending' ? '2px solid var(--color-accent)' : '2px solid transparent'
          }}
        >
          Citas Pendientes
        </button>
        <button 
          onClick={() => setTab('accepted')}
          style={{ 
            padding: '12px 0', 
            fontWeight: 600, 
            color: tab === 'accepted' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            borderBottom: tab === 'accepted' ? '2px solid var(--color-accent)' : '2px solid transparent'
          }}
        >
          Citas Aceptadas
        </button>
      </div>

      {tab === 'pending' ? (
        <div>
          <p className="text-muted">No hay citas pendientes por el momento.</p>
        </div>
      ) : (
        <div>
          <p className="text-muted">No hay citas aceptadas por el momento.</p>
        </div>
      )}
    </div>
  );
}
