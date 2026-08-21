"use client";

import { useState, useEffect } from 'react';

export default function ConfiguracionPage() {
  const [pin, setPin] = useState("");
  const [savedPin, setSavedPin] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          if (data.settings?.scannerPin) {
            setPin(data.settings.scannerPin);
            setSavedPin(data.settings.scannerPin);
          }
          if (data.scannerLogs) {
            setLogs(data.scannerLogs);
          }
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scannerPin: pin })
      });
      const data = await res.json();
      if (data.success) {
        setSavedPin(pin);
        setMsg(pin === "" ? "✅ PIN eliminado con éxito." : "✅ PIN guardado con éxito.");
      } else {
        setMsg("❌ Error al guardar el PIN.");
      }
    } catch (e) {
      setMsg("❌ Error inesperado.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "40px" }}>Cargando configuración...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "800px" }}>
      <h1 className="heading-1" style={{ marginBottom: "8px" }}>Configuración del Sistema</h1>
      <p className="text-muted" style={{ marginBottom: "32px" }}>
        Administra las configuraciones globales y de seguridad de la plataforma.
      </p>

      <div className="card">
        <h2 className="heading-2" style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Validador de Entradas (Escáner QR)</h2>
        <p className="text-muted" style={{ marginBottom: "24px", fontSize: "0.95rem" }}>
          Establece un PIN de seguridad. El personal encargado de escanear los boletos en la puerta deberá ingresar a <strong>/escaner</strong> y colocar este PIN junto con su nombre para poder usar la cámara.
        </p>

        {savedPin && (
          <div style={{ marginBottom: "24px", padding: "12px", backgroundColor: "#f3f4f6", borderRadius: "8px", border: "1px solid #e5e7eb", display: "inline-block" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>PIN Actual Configurado:</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "2px", color: "var(--color-accent)" }}>{savedPin}</div>
          </div>
        )}

        <div className="form-group" style={{ maxWidth: "300px" }}>
          <label className="form-label">{savedPin ? "Cambiar PIN de Acceso" : "Establecer PIN de Acceso"}</label>
          <input 
            type="text" 
            className="input-field" 
            value={pin} 
            onChange={(e) => setPin(e.target.value)} 
            placeholder="Ej. 1234" 
            maxLength={10}
          />
        </div>

        {msg && <div style={{ marginBottom: "16px", fontWeight: 500 }}>{msg}</div>}

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={saving}
            style={{ padding: "10px 24px" }}
          >
            {saving ? "Guardando..." : "Guardar PIN"}
          </button>

          {savedPin && (
            <button 
              onClick={() => {
                setPin("");
                setSavedPin("");
                fetch('/api/admin/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ scannerPin: "" })
                }).then(() => setMsg("✅ PIN eliminado. El escáner estará inaccesible."));
              }}
              disabled={saving}
              style={{ padding: "10px 24px", backgroundColor: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
            >
              Eliminar PIN
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: "32px" }}>
        <h2 className="heading-2" style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Registro de Accesos al Escáner</h2>
        <p className="text-muted" style={{ marginBottom: "24px", fontSize: "0.95rem" }}>
          Aquí puedes ver quién ha intentado ingresar a la ruta <strong>/escaner</strong> y si colocaron el PIN correcto.
        </p>

        {logs.length === 0 ? (
          <p className="text-muted">No hay registros de acceso todavía.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)", textAlign: "left" }}>
                  <th style={{ padding: "12px 8px" }}>Fecha y Hora</th>
                  <th style={{ padding: "12px 8px" }}>Nombre del Personal</th>
                  <th style={{ padding: "12px 8px" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "12px 8px" }}>{new Date(log.timestamp).toLocaleString('es-ES')}</td>
                    <td style={{ padding: "12px 8px", fontWeight: 500 }}>{log.staffName}</td>
                    <td style={{ padding: "12px 8px" }}>
                      {log.success ? (
                        <span style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "4px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 600 }}>Acceso Exitoso</span>
                      ) : (
                        <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "4px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 600 }}>PIN Incorrecto</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
