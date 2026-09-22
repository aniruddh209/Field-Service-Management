import api from "../api/api";

export async function getAllInventoryItems() {
  const response = await api.get("/Inventory");
  return response.data?.data || response.data || [];
}

export const getInventoryItems = getAllInventoryItems;

export async function getInventoryItemById(id) {
  const response = await api.get(`/Inventory/${id}`);
  return response.data?.data || response.data;
}

export async function searchInventoryItems(term) {
  const response = await api.get(`/Inventory/search?name=${encodeURIComponent(term)}`);
  return response.data?.data || response.data || [];
}

export async function getLowStockItems() {
  const response = await api.get("/Inventory/low-stock");
  return response.data?.data || response.data || [];
}

export async function createInventoryItem(dto) {
  const response = await api.post("/Inventory", dto);
  return response.data?.data || response.data;
}

export async function updateInventoryItem(id, dto) {
  const response = await api.put(`/Inventory/${id}`, dto);
  return response.data?.data || response.data;
}

export async function adjustStock(id, payloadOrQuantity, reason = "Stock level adjustment") {
  const payload = typeof payloadOrQuantity === 'object'
    ? payloadOrQuantity
    : { quantityChange: Number(payloadOrQuantity), reason };
  const response = await api.patch(`/Inventory/${id}/stock`, payload);
  return response.data?.data || response.data;
}

export async function deactivateInventoryItem(id) {
  const response = await api.patch(`/Inventory/${id}/deactivate`);
  return response.data?.data || response.data;
}

const inventoryService = {
  getAllInventoryItems,
  getInventoryItems,
  getInventoryItemById,
  searchInventoryItems,
  getLowStockItems,
  createInventoryItem,
  updateInventoryItem,
  adjustStock,
  deactivateInventoryItem
};

export default inventoryService;

