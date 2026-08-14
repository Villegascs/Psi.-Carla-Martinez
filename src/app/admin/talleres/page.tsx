"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as XLSX from "xlsx";

type Workshop = {
  id?: string;
  title: string;
  price: string;
  availableSpots: number;
  type: "Presencial" | "Virtual";
  virtualLink?: string;
  status: "Publicado" | "Oculto";
  image: string;
  date: string;
  description: string;
};

type Participant = {
  firstName: string;
  lastName: string;
  idType: string;
  idNumber: string;
  buyerEmail: string;
  ticketId: string;
  purchaseDate: string;
};

export default function AdminTalleres() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<Workshop>({
    title: "",
    price: "20€",
    availableSpots: 10,
    type: "Presencial",
    virtualLink: "",
    status: "Publicado",
    image: "",
    date: "",
    description: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Participants modal
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [currentWorkshopName, setCurrentWorkshopName] = useState("");

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/workshops");
      const data = await res.json();
      if (data.success) {
        setWorkshops(data.workshops);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleOpenModal = (workshop: Workshop | null = null) => {
    setEditingWorkshop(workshop);
    if (workshop) {
      setFormData(workshop);
    } else {
      setFormData({
        title: "",
        price: "20€",
        availableSpots: 10,
        type: "Presencial",
        virtualLink: "",
        status: "Publicado",
        image: "",
        date: "",
        description: ""
      });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleImageUpload = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let imageUrl = formData.image;
      if (imageFile) {
        setUploadingImage(true);
        imageUrl = await handleImageUpload(imageFile);
        setUploadingImage(false);
      }

      const method = editingWorkshop ? "PUT" : "POST";
      const payload = { ...formData, image: imageUrl };

      const res = await fetch("/api/admin/workshops", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        fetchWorkshops();
      } else {
        alert("Error al guardar el taller");
      }
    } catch (error) {
      console.error(error);
      alert("Error inesperado");
    } finally {
      setFormLoading(false);
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este taller?")) return;
    
    try {
      const res = await fetch(`/api/admin/workshops?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchWorkshops();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadParticipants = async (workshopName: string) => {
    setCurrentWorkshopName(workshopName);
    setShowParticipantsModal(true);
    setLoadingParticipants(true);
    try {
      const res = await fetch(`/api/admin/participants?workshopName=${encodeURIComponent(workshopName)}`);
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingParticipants(false);
  };

  const exportToExcel = () => {
    if (participants.length === 0) return alert("No hay participantes para exportar");
    
    const worksheet = XLSX.utils.json_to_sheet(participants.map(p => ({
      "Nombre": p.firstName,
      "Apellido": p.lastName,
      "Cédula": `${p.idType}-${p.idNumber}`,
      "Correo Comprador": p.buyerEmail,
      "Fecha Compra": new Date(p.purchaseDate).toLocaleString()
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inscritos");
    
    XLSX.writeFile(workbook, `Inscritos_${currentWorkshopName.substring(0, 15)}.xlsx`);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Gestión de Talleres</h1>
        <button onClick={() => handleOpenModal()} style={{ padding: "12px 24px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
          + Crear Taller
        </button>
      </div>

      {loading ? (
        <p>Cargando talleres...</p>
      ) : (
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.9rem", color: "#6b7280" }}>NOMBRE</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.9rem", color: "#6b7280" }}>ESTADO</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.9rem", color: "#6b7280" }}>CUPOS</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.9rem", color: "#6b7280" }}>PRECIO</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.9rem", color: "#6b7280" }}>TIPO</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.9rem", color: "#6b7280", textAlign: "right" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {workshops.map(w => (
                <tr key={w.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                    {w.image && <img src={w.image} alt={w.title} style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }} />}
                    <span style={{ fontWeight: 600 }}>{w.title}</span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ padding: "4px 8px", backgroundColor: w.status === "Publicado" ? "#d1fae5" : "#fee2e2", color: w.status === "Publicado" ? "#065f46" : "#991b1b", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600 }}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px", color: w.availableSpots === 0 ? "#ef4444" : "inherit" }}>
                    {w.availableSpots} disponibles
                  </td>
                  <td style={{ padding: "16px" }}>{w.price}</td>
                  <td style={{ padding: "16px" }}>{w.type || 'Presencial'}</td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button onClick={() => loadParticipants(w.title)} style={{ padding: "6px 12px", marginRight: "8px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", fontSize: "0.85rem" }}>
                      👥 Inscritos
                    </button>
                    <button onClick={() => handleOpenModal(w)} style={{ padding: "6px 12px", marginRight: "8px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", fontSize: "0.85rem" }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(w.id!)} style={{ padding: "6px 12px", border: "1px solid #fee2e2", borderRadius: "6px", backgroundColor: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem" }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {workshops.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>No hay talleres registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear/Editar Taller */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>{editingWorkshop ? "Editar Taller" : "Crear Taller"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Nombre del Taller</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Fecha (Ej. 25 de Octubre)</label>
                  <input required type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Descripción Larga</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", minHeight: "100px" }} />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Cupos Disponibles</label>
                  <input required type="number" min="0" value={formData.availableSpots} onChange={e => setFormData({...formData, availableSpots: parseInt(e.target.value)})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Precio (Ej: 20€)</label>
                  <input required type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Tipo de Taller</label>
                  <select required value={formData.type || "Presencial"} onChange={e => setFormData({...formData, type: e.target.value as any})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }}>
                    <option value="Presencial">Presencial (Ticket con QR)</option>
                    <option value="Virtual">Virtual (Botón de Ingreso)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Estado</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }}>
                    <option value="Publicado">Publicado</option>
                    <option value="Oculto">Oculto</option>
                  </select>
                </div>
              </div>

              {(formData.type === "Virtual" || !formData.type) && (
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Enlace del Curso Virtual (Zoom, Meet, etc)</label>
                  <input required type="url" value={formData.virtualLink || ""} onChange={e => setFormData({...formData, virtualLink: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} placeholder="https://..." />
                </div>
              )}

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Imagen del Taller</label>
                {formData.image && !imageFile && (
                  <img src={formData.image} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />
                )}
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} style={{ display: "block", marginBottom: "8px" }} required={!formData.image && !imageFile} />
                <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Opcional: Si no seleccionas una imagen nueva, se mantendrá la anterior.</p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 20px", border: "1px solid #d1d5db", backgroundColor: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={formLoading} style={{ padding: "10px 20px", border: "none", backgroundColor: "#000", color: "#fff", borderRadius: "8px", cursor: formLoading ? "not-allowed" : "pointer", fontWeight: 600 }}>
                  {formLoading ? (uploadingImage ? "Subiendo Imagen..." : "Guardando...") : "Guardar Taller"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Inscritos */}
      {showParticipantsModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Inscritos: {currentWorkshopName}</h2>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={exportToExcel} style={{ padding: "8px 16px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>
                  📥 Exportar a Excel
                </button>
                <button onClick={() => setShowParticipantsModal(false)} style={{ padding: "8px 16px", border: "1px solid #d1d5db", backgroundColor: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>
                  Cerrar
                </button>
              </div>
            </div>

            {loadingParticipants ? (
              <p>Cargando inscritos...</p>
            ) : participants.length === 0 ? (
              <p style={{ textAlign: "center", color: "#6b7280", padding: "32px 0" }}>Aún no hay inscritos aprobados para este taller.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <tr>
                    <th style={{ padding: "12px", fontWeight: 600, fontSize: "0.9rem", color: "#6b7280" }}>Nombre</th>
                    <th style={{ padding: "12px", fontWeight: 600, fontSize: "0.9rem", color: "#6b7280" }}>Cédula</th>
                    <th style={{ padding: "12px", fontWeight: 600, fontSize: "0.9rem", color: "#6b7280" }}>Correo del Comprador</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px" }}>{p.firstName} {p.lastName}</td>
                      <td style={{ padding: "12px" }}>{p.idType}-{p.idNumber}</td>
                      <td style={{ padding: "12px" }}>{p.buyerEmail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p style={{ marginTop: "16px", fontSize: "0.9rem", color: "#6b7280" }}>Total Inscritos: <strong>{participants.length}</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}
