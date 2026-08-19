"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: copied ? "#dcfce7" : "none",
        border: "none",
        color: copied ? "#166534" : "#2563eb",
        fontSize: "0.8rem",
        cursor: "pointer",
        fontWeight: 600,
        padding: "4px 8px",
        borderRadius: "4px",
        transition: "all 0.2s ease"
      }}
    >
      {copied ? <Check style={{ width: "14px", height: "14px" }} /> : <Copy style={{ width: "14px", height: "14px" }} />}
      {copied ? "¡Copiado!" : label}
    </button>
  );
}
