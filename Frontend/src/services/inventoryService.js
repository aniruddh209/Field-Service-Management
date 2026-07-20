// ====================================
// Inventory Service
// ====================================
//
// CRUD + stock adjustment for inventory/spare parts.
//
// Current: modifies local dummy copy in memory (resets on reload).
// Future:
//   GET   /api/inventory
//   GET   /api/inventory/{id}
//   POST  /api/inventory
//   PUT   /api/inventory/{id}
//   PATCH /api/inventory/{id}/stock
//
// ====================================

import { inventoryData } from '../data/inventoryData.js';

let inventory = [...inventoryData];

/**
 * Fetches all inventory items.
 * Future: GET /api/inventory
 * @returns {Promise<Array>}
 */
export async function getInventoryItems() {
  return Promise.resolve([...inventory]);
}

/**
 * Retrieves a single inventory item.
 * Future: GET /api/inventory/{id}
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function getInventoryItemById(id) {
  return Promise.resolve(inventory.find(i => i.id === Number(id)) || null);
}

/**
 * Returns only active inventory items (for technician parts selection).
 * Future: GET /api/inventory?active=true
 * @returns {Promise<Array>}
 */
export async function getActiveInventoryItems() {
  return Promise.resolve(inventory.filter(i => i.isActive && i.quantityInStock > 0));
}

/**
 * Creates a new inventory item.
 * Future: POST /api/inventory
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createInventoryItem(data) {
  const newItem = {
    ...data,
    id: Math.max(...inventory.map(i => i.id), 0) + 1,
    isActive: true
  };
  inventory.push(newItem);
  return Promise.resolve(newItem);
}

/**
 * Updates an inventory item.
 * Future: PUT /api/inventory/{id}
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object|null>}
 */
export async function updateInventoryItem(id, data) {
  const idx = inventory.findIndex(i => i.id === Number(id));
  if (idx === -1) return Promise.resolve(null);
  inventory[idx] = { ...inventory[idx], ...data };
  return Promise.resolve(inventory[idx]);
}

/**
 * Adjusts stock quantity for an item.
 * Future: PATCH /api/inventory/{id}/stock
 * @param {number} id
 * @param {number} quantityChange - positive to add, negative to reduce
 * @returns {Promise<Object|null>}
 */
export async function adjustStock(id, quantityChange) {
  const idx = inventory.findIndex(i => i.id === Number(id));
  if (idx === -1) return Promise.resolve(null);

  const newQty = inventory[idx].quantityInStock + quantityChange;
  if (newQty < 0) return Promise.resolve(null); // Don't allow negative stock

  inventory[idx] = { ...inventory[idx], quantityInStock: newQty };
  return Promise.resolve(inventory[idx]);
}

/**
 * Returns items with low or out-of-stock levels.
 * Future: GET /api/inventory?stockStatus=low
 * @returns {Promise<Array>}
 */
export async function getLowStockItems() {
  return Promise.resolve(
    inventory.filter(i => i.isActive && i.quantityInStock <= i.reorderLevel)
  );
}
