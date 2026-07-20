import { useState, useEffect } from "react";
import { Package, Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getMyAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../../services/assetService.js";
import { LoadingState, EmptyState } from "../../components/ui/PageStates.jsx";
import Modal from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";

const EMPTY_FORM = {
  name: "",
  brand: "",
  model: "",
  serialNumber: "",
  purchaseDate: "",
  warrantyExpiry: "",
  notes: "",
};

function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  async function load() {
    setIsLoading(true);
    const data = await getMyAssets(user.id);
    setAssets(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if (user?.id) load();
  }, [user?.id]);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  }

  function openEdit(asset) {
    setEditingId(asset.id);
    setForm({
      name: asset.name,
      brand: asset.brand || "",
      model: asset.model || "",
      serialNumber: asset.serialNumber || "",
      purchaseDate: asset.purchaseDate || "",
      warrantyExpiry: asset.warrantyExpiry || "",
      notes: asset.notes || "",
    });
    setErrors({});
    setShowModal(true);
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const data = { ...form, customerId: user.id };
    if (editingId) {
      await updateAsset(editingId, data);
    } else {
      await createAsset(data);
    }
    setShowModal(false);
    load();
  }

  async function handleDelete() {
    await deleteAsset(deletingId);
    setShowConfirm(false);
    setDeletingId(null);
    load();
  }

  if (isLoading)
    return (
      <PageContainer>
        <LoadingState message="Loading assets..." />
      </PageContainer>
    );

  return (
    <PageContainer>
      <div className="page-header">
        <div className="page-header__info">
          <h1 className="page-header__title">My Equipment & Assets</h1>
          <p className="page-header__subtitle">
            Register your equipment for faster and better service
          </p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={openAdd}>
            <Plus size={16} /> Add Asset
          </button>
        </div>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No assets registered"
          message="Register your equipment to help technicians serve you faster."
          actionLabel="Add Asset"
          onAction={openAdd}
        />
      ) : (
        <div className="cards-grid">
          {assets.map((asset) => (
            <div key={asset.id} className="data-card">
              <div className="data-card__header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                      {asset.name}
                    </h3>
                    {asset.brand && (
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {asset.brand} {asset.model && `· ${asset.model}`}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => openEdit(asset)}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className="btn btn--ghost btn--sm"
                    style={{ color: "var(--color-danger)" }}
                    onClick={() => {
                      setDeletingId(asset.id);
                      setShowConfirm(true);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="data-card__body">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {asset.serialNumber && (
                    <span>Serial: {asset.serialNumber}</span>
                  )}
                  {asset.purchaseDate && (
                    <span>
                      Purchased:{" "}
                      {new Date(asset.purchaseDate).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </span>
                  )}
                  {asset.warrantyExpiry && (
                    <span>
                      Warranty expires:{" "}
                      {new Date(asset.warrantyExpiry).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </span>
                  )}
                  {asset.notes && (
                    <span style={{ marginTop: 4, fontStyle: "italic" }}>
                      Note: {asset.notes}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Asset" : "Add Asset"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label--required">Name</label>
            <input
              className={`form-input ${errors.name ? "form-input--error" : ""}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Living Room AC, Samsung Washing Machine"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                className="form-input"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Samsung, LG"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                className="form-input"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="e.g. AR18TY"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Serial Number</label>
            <input
              className="form-input"
              value={form.serialNumber}
              onChange={(e) =>
                setForm({ ...form, serialNumber: e.target.value })
              }
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                className="form-input"
                value={form.purchaseDate}
                onChange={(e) =>
                  setForm({ ...form, purchaseDate: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Warranty Expires</label>
              <input
                type="date"
                className="form-input"
                value={form.warrantyExpiry}
                onChange={(e) =>
                  setForm({ ...form, warrantyExpiry: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {editingId ? "Save Changes" : "Add Asset"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Asset"
        message="Are you sure you want to remove this asset?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </PageContainer>
  );
}

export default AssetsPage;
