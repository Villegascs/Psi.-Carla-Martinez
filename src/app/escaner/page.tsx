"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function EscanerQRPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [scanResult, setScanResult] = useState<{success: boolean, message: string, detail?: string} | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("scannerAuth");
    const name = localStorage.getItem("scannerName");
    if (auth === "true" && name) {
      setStaffName(name);
      setIsAuthenticated(true);
      setIsScanning(true);
    }
  }, []);

  useEffect(() => {
    // Only initialize scanner if we are in the scanning state and window is available
    if (!isScanning) return;
    
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;
    
    // Slight delay to ensure DOM element exists
    setTimeout(() => {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }, 100);

    return () => {
      if (html5QrcodeScanner) {
        try {
          html5QrcodeScanner.clear();
        } catch (e) {
          console.error("Failed to clear scanner", e);
        }
      }
    };
  }, [isScanning]);

  const onScanSuccess = async (decodedText: string) => {
    // Prevent multiple scans
    setIsScanning(false);
    
    // We expect decodedText to be the ticketId
    const ticketId = decodedText;

    try {
      const res = await fetch("/api/workshops/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, scannedBy: staffName })
      });
      const data = await res.json();
      
      if (data.success) {
        setScanResult({
          success: true,
          message: data.message, // "¡Acceso concedido!"
          detail: `${data.participant} - ${data.workshop}`
        });
      } else {
        setScanResult({
          success: false,
          message: "Acceso Denegado",
          detail: data.error
        });
      }
    } catch (err) {
      setScanResult({
        success: false,
        message: "Error de Red",
        detail: "No se pudo conectar con el servidor para validar."
      });
    }
  };

  const onScanFailure = (error: any) => {
    // Continuously throws errors while scanning if no QR is found. Ignore them.
  };

  const handleReset = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (!staffName || !pin) {
      setLoginError("Por favor ingresa tu nombre y el PIN.");
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/scanner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, staffName })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("scannerAuth", "true");
        localStorage.setItem("scannerName", staffName);
        setIsAuthenticated(true);
        setIsScanning(true);
      } else {
        setLoginError("PIN incorrecto.");
      }
    } catch (err) {
      setLoginError("Error de conexión.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("scannerAuth");
    localStorage.removeItem("scannerName");
    setIsAuthenticated(false);
    setIsScanning(false);
    setScanResult(null);
    setPin("");
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <h2 className="heading-2" style={{ marginBottom: "8px" }}>Validador de Entradas</h2>
          <p className="text-muted" style={{ marginBottom: "24px" }}>Ingresa tus credenciales de personal.</p>
          
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group" style={{ textAlign: "left", marginBottom: 0 }}>
              <label className="form-label">Tu Nombre</label>
              <input 
                type="text" 
                className="input-field" 
                value={staffName} 
                onChange={e => setStaffName(e.target.value)} 
                placeholder="Ej. María" 
              />
            </div>
            <div className="form-group" style={{ textAlign: "left", marginBottom: 0 }}>
              <label className="form-label">PIN de Acceso</label>
              <input 
                type="password" 
                className="input-field" 
                value={pin} 
                onChange={e => setPin(e.target.value)} 
                placeholder="****" 
              />
            </div>
            
            {loginError && <p style={{ color: "var(--color-error)", fontSize: "0.9rem", margin: 0 }}>{loginError}</p>}
            
            <button type="submit" className="btn-primary" disabled={isLoggingIn} style={{ marginTop: "8px" }}>
              {isLoggingIn ? "Validando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto", textAlign: "center", padding: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 className="heading-2" style={{ margin: 0, fontSize: "1.5rem" }}>Escaner QR</h2>
        <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", textDecoration: "underline", cursor: "pointer" }}>Salir</button>
      </div>
      
      <p className="text-muted" style={{ marginBottom: "24px" }}>Hola <strong>{staffName}</strong>. Apunta la cámara al código QR de la entrada del participante.</p>

      {isScanning && (
        <div style={{ backgroundColor: "#000", borderRadius: "12px", overflow: "hidden", marginBottom: "24px" }}>
          <div id="qr-reader" style={{ width: "100%" }}></div>
        </div>
      )}

      {scanResult && (
        <div style={{ 
          padding: "32px 24px", 
          borderRadius: "12px", 
          backgroundColor: scanResult.success ? "#d1fae5" : "#fee2e2",
          border: `2px solid ${scanResult.success ? "#10b981" : "#ef4444"}`
        }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: scanResult.success ? "#047857" : "#b91c1c", marginBottom: "16px" }}>
            {scanResult.message}
          </h3>
          <p style={{ fontSize: "1.1rem", color: scanResult.success ? "#065f46" : "#991b1b", marginBottom: "24px" }}>
            {scanResult.detail}
          </p>
          <button className="btn-primary" onClick={handleReset} style={{ backgroundColor: scanResult.success ? "#10b981" : "#ef4444", color: "#fff", borderColor: "transparent" }}>
            Escanear otro boleto
          </button>
        </div>
      )}
    </div>
  );
}
