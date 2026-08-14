"use client";

import { useState, useEffect } from "react";

type Product = {
  id?: string;
  name: string;
  price: string;
  description: string;
  sizes: string;
  colors: string;
  status: "Publicado" | "Oculto";
  image: string;
};

export default function AdminTiendaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>({
    name: "", price: "", description: "", sizes: "", colors: "", status: "Publicado", image: ""
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: "", price: "10€", description: "", sizes: "", colors: "", status: "Publicado", image: ""
      });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts();
      } else {
        alert("Error al eliminar");
      }
    } catch (e) {
      console.error(e);
    }
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
      let finalImageUrl = formData.image;

      if (imageFile) {
        setUploadingImage(true);
        finalImageUrl = await handleImageUpload(imageFile);
        setUploadingImage(false);
      }

      const method = editingProduct ? "PUT" : "POST";
      const body = JSON.stringify({ ...formData, image: finalImageUrl, id: editingProduct?.id });
      
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body
      });

      if (res.ok) {
        setShowModal(false);
        fetchProducts();
      } else {
        alert("Error al guardar");
      }
    } catch (e) {
      console.error(e);
      alert("Hubo un error");
    }
    setFormLoading(false);
    setUploadingImage(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Inventario de Tienda</h1>
        <button onClick={() => handleOpenModal()} style={{ padding: "10px 20px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
          + Nuevo Producto
        </button>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>PRODUCTO</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>ESTADO</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>PRECIO</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280" }}>TALLAS / COLORES</th>
                <th style={{ padding: "16px", fontWeight: 600, fontSize: "0.85rem", color: "#6b7280", textAlign: "right" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                    {p.image && <img src={p.image} alt={p.name} style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }} />}
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ padding: "4px 8px", backgroundColor: p.status === "Publicado" ? "#d1fae5" : "#fee2e2", color: p.status === "Publicado" ? "#065f46" : "#991b1b", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600 }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>{p.price}</td>
                  <td style={{ padding: "16px", fontSize: "0.85rem", color: "#6b7280" }}>
                    Tallas: {p.sizes || 'N/A'}<br/>
                    Colores: {p.colors || 'N/A'}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button onClick={() => handleOpenModal(p)} style={{ padding: "6px 12px", marginRight: "8px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", fontSize: "0.85rem" }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(p.id!)} style={{ padding: "6px 12px", border: "1px solid #fee2e2", borderRadius: "6px", backgroundColor: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: "0.85rem" }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>No hay productos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>{editingProduct ? "Editar Producto" : "Crear Producto"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Nombre del Producto</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Precio (Ej. 20€)</label>
                  <input required type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Descripción</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", minHeight: "80px" }} />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Tallas (Separadas por coma)</label>
                  <input type="text" placeholder="S, M, L, XL" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Colores (Separados por coma)</label>
                  <input type="text" placeholder="Blanco, Negro" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Estado</label>
                <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }}>
                  <option value="Publicado">Publicado</option>
                  <option value="Oculto">Oculto</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Imagen del Producto</label>
                {formData.image && !imageFile && (
                  <img src={formData.image} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />
                )}
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} style={{ display: "block", marginBottom: "8px" }} required={!formData.image && !imageFile} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 20px", border: "1px solid #d1d5db", backgroundColor: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={formLoading} style={{ padding: "10px 20px", border: "none", backgroundColor: "#000", color: "#fff", borderRadius: "8px", cursor: formLoading ? "not-allowed" : "pointer", fontWeight: 600 }}>
                  {formLoading ? (uploadingImage ? "Subiendo..." : "Guardando...") : "Guardar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
