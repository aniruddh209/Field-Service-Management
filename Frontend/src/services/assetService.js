// ====================================
// Asset Service
// ====================================
// Endpoints match backend AssetsController exactly.
// GET /api/Assets
// GET /api/Assets/{id}
// POST /api/Assets
// PUT /api/Assets/{id}
// DELETE /api/Assets/{id}
// NO mock data fallbacks.
// ====================================

import api from "../api/api";

export async function getMyAssets() {
  const response = await api.get("/Assets");
  return response.data?.data || response.data || [];
}

export async function getAssetById(id) {
  const response = await api.get(`/Assets/${id}`);
  return response.data?.data || response.data;
}

export async function createAsset(assetData) {
  const response = await api.post("/Assets", assetData);
  return response.data?.data || response.data;
}

export async function updateAsset(id, assetData) {
  const response = await api.put(`/Assets/${id}`, assetData);
  return response.data?.data || response.data;
}

export async function deleteAsset(id) {
  const response = await api.delete(`/Assets/${id}`);
  return response.data;
}
