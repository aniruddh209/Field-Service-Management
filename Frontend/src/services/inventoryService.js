import api from "../api/api";
import { inventoryData as initialInventory } from "../data/inventoryData";

let inventoryList = [...initialInventory];

export async function getInventoryItems() {
  try {
    const response = await api.get("/Inventory");
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local inventory store:", err.message);
  }
  return inventoryList;
}

export async function createInventoryItem(itemData) {
  try {
    const response = await api.post("/Inventory", itemData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local inventory store:", err.message);
  }

  const newItem = {
    id: inventoryList.length ? Math.max(...inventoryList.map(i => i.id)) + 1 : 1,
    sku: itemData.sku || `PART-GEN-${String(inventoryList.length + 1).padStart(3, '0')}`,
    isActive: true,
    ...itemData
  };
  inventoryList.push(newItem);
  return newItem;
}

export async function updateInventoryItem(id, itemData) {
  try {
    const response = await api.put(`/Inventory/${id}`, itemData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local inventory store:", err.message);
  }

  inventoryList = inventoryList.map(i => i.id === Number(id) ? { ...i, ...itemData } : i);
  return inventoryList.find(i => i.id === Number(id));
}

export async function adjustStock(id, amount, reason = "Manual Adjustment") {
  try {
    const response = await api.post(`/Inventory/${id}/adjust`, { amount, reason });
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local inventory store:", err.message);
  }

  inventoryList = inventoryList.map(i => {
    if (i.id === Number(id)) {
      const newQty = Math.max(0, (i.quantityInStock || 0) + Number(amount));
      return { ...i, quantityInStock: newQty };
    }
    return i;
  });
  return inventoryList.find(i => i.id === Number(id));
}
