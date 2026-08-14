"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function EscanerQRPage() {
  const [scanResult, setScanResult] = useState<{success: boolean, message: string, detail?: string} | null>(null);
  const [isScanning, setIsScanning] = useState(true);

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
        body: JSON.stringify({ ticketId })
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

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
      <h2 className="heading-2" style={{ marginBottom: "24px" }}>Validador de Entradas</h2>
      <p className="text-muted" style={{ marginBottom: "24px" }}>Apunta la cámara al código QR de la entrada del participante.</p>

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
