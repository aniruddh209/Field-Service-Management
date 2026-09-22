// ====================================
// Customer Address Service
// ====================================
// Endpoints match backend CustomerAddressesController exactly.
// NO mock data fallbacks.
// ====================================

import api from "../api/api";

export async function getMyAddresses() {
  const response = await api.get("/CustomerAddresses/my");
  return response.data?.data || response.data || [];
}

export async function getAddressById(id) {
  const response = await api.get(`/CustomerAddresses/${id}`);
  return response.data?.data || response.data;
}

export async function createAddress(addressData) {
  const response = await api.post("/CustomerAddresses", addressData);
  return response.data?.data || response.data;
}

export async function updateAddress(id, addressData) {
  const response = await api.put(`/CustomerAddresses/${id}`, addressData);
  return response.data?.data || response.data;
}

export async function deleteAddress(id) {
  const response = await api.delete(`/CustomerAddresses/${id}`);
  return response.data;
}

export async function setDefaultAddress(id) {
  return updateAddress(id, { isDefault: true });
}

const addressService = {
  getMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};

export default addressService;
