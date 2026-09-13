"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/Calendar";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ date, setDate, placeholder = "Seleccionar fecha", className = "" }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const safeDate = date && isValid(date) && !isNaN(date.getTime()) ? date : undefined;

  // Close popover when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%" }} ref={popoverRef} className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "10px 12px",
          backgroundColor: "#fff",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "0.95rem",
          color: safeDate ? "#000" : "#6b7280",
          cursor: "pointer",
          textAlign: "left",
          transition: "border-color 0.2s"
        }}
      >
        <CalendarIcon style={{ width: "16px", height: "16px", marginRight: "8px", opacity: 0.7 }} />
        {safeDate ? format(safeDate, "PPP", { locale: es }) : placeholder}
      </button>

      {isOpen && (
        <div className="popover-content">
          <Calendar
            mode="single"
            selected={safeDate}
            onSelect={(day) => {
              setDate(day);
              setIsOpen(false);
            }}
            locale={es}
            captionLayout="dropdown"
            startMonth={new Date(1920, 0)}
            endMonth={new Date(2030, 11)}
            initialFocus
          />
        </div>
      )}
    </div>
  );
}
