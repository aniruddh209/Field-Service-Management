import api from "../api/api";
import { addressesData as initialAddresses } from "../data/addressesData";

let addressList = [...initialAddresses];

export async function getMyAddresses(customerId = 1) {
  try {
    const response = await api.get(`/CustomerAddresses?customerId=${customerId}`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local addresses store:", err.message);
  }
  return addressList.filter(a => a.customerId === Number(customerId));
}

export async function createAddress(addressData) {
  try {
    const response = await api.post("/CustomerAddresses", addressData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local addresses store:", err.message);
  }

  const newAddress = {
    id: addressList.length ? Math.max(...addressList.map(a => a.id)) + 1 : 1,
    customerId: addressData.customerId || 1,
    isDefault: false,
    ...addressData
  };

  if (newAddress.isDefault) {
    addressList = addressList.map(a => 
      a.customerId === newAddress.customerId ? { ...a, isDefault: false } : a
    );
  }

  addressList.push(newAddress);
  return newAddress;
}

export async function updateAddress(id, addressData) {
  try {
    const response = await api.put(`/CustomerAddresses/${id}`, addressData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local addresses store:", err.message);
  }

  addressList = addressList.map(a => a.id === Number(id) ? { ...a, ...addressData } : a);
  return addressList.find(a => a.id === Number(id));
}

export async function deleteAddress(id) {
  try {
    await api.delete(`/CustomerAddresses/${id}`);
    return { success: true };
  } catch (err) {
    console.warn("Backend API unavailable, using local addresses store:", err.message);
  }

  addressList = addressList.filter(a => a.id !== Number(id));
  return { success: true };
}

export async function setDefaultAddress(id, customerId = 1) {
  try {
    const response = await api.put(`/CustomerAddresses/${id}/set-default`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local addresses store:", err.message);
  }

  addressList = addressList.map(a => {
    if (a.customerId === Number(customerId)) {
      return { ...a, isDefault: a.id === Number(id) };
    }
    return a;
  });
  return addressList.find(a => a.id === Number(id));
}
