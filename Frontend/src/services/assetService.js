import api from "../api/api";
import { assetsData as initialAssets } from "../data/assetsData";

let assetsList = [...initialAssets];

export async function getMyAssets(customerId = 1) {
  try {
    const response = await api.get(`/Assets?customerId=${customerId}`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local assets store:", err.message);
  }
  return assetsList.filter(a => a.customerId === Number(customerId));
}

export async function createAsset(assetData) {
  try {
    const response = await api.post("/Assets", assetData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local assets store:", err.message);
  }

  const newAsset = {
    id: assetsList.length ? Math.max(...assetsList.map(a => a.id)) + 1 : 1,
    customerId: assetData.customerId || 1,
    isActive: true,
    ...assetData
  };
  assetsList.push(newAsset);
  return newAsset;
}

export async function updateAsset(id, assetData) {
  try {
    const response = await api.put(`/Assets/${id}`, assetData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local assets store:", err.message);
  }

  assetsList = assetsList.map(a => a.id === Number(id) ? { ...a, ...assetData } : a);
  return assetsList.find(a => a.id === Number(id));
}

export async function deleteAsset(id) {
  try {
    await api.delete(`/Assets/${id}`);
    return { success: true };
  } catch (err) {
    console.warn("Backend API unavailable, using local assets store:", err.message);
  }

  assetsList = assetsList.filter(a => a.id !== Number(id));
  return { success: true };
}
