"use client";

import { useState, useEffect } from 'react';

export default function ConfiguracionPage() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.settings?.scannerPin) {
          setPin(data.settings.scannerPin);
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
        setMsg("✅ PIN guardado con éxito.");
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

        <div className="form-group" style={{ maxWidth: "300px" }}>
          <label className="form-label">PIN de Acceso</label>
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

        <button 
          className="btn-primary" 
          onClick={handleSave} 
          disabled={saving}
          style={{ padding: "10px 24px" }}
        >
          {saving ? "Guardando..." : "Guardar PIN"}
        </button>
      </div>
    </div>
  );
}
