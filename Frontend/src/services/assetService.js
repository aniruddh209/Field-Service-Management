// ====================================
// Asset Service
// ====================================
//
// Operations on customer service assets/equipment.
//
// Current: modifies local dummy copy in memory (resets on reload).
// Future: GET/POST/PUT/DELETE /api/assets
//
// ====================================

import { assetsData } from '../data/assetsData.js';

let assets = [...assetsData];

/**
 * Fetches all assets for a customer.
 * Future: GET /api/assets/my
 * @param {number} customerId - Customer identifier
 * @returns {Promise<Array>} List of assets
 */
export async function getMyAssets(customerId) {
  return new Promise((resolve) => {
    resolve(assets.filter(a => a.customerId === customerId));
  });
}

/**
 * Retrieves a single asset details.
 * Future: GET /api/assets/{id}
 * @param {number} id - Asset ID
 * @returns {Promise<Object|null>} Asset details or null
 */
export async function getAssetById(id) {
  return new Promise((resolve) => {
    resolve(assets.find(a => a.id === Number(id)) || null);
  });
}

/**
 * Saves a new asset to customer list.
 * Future: POST /api/assets
 * @param {Object} data - Asset DTO
 * @returns {Promise<Object>} Created asset
 */
export async function createAsset(data) {
  return new Promise((resolve) => {
    const newAsset = {
      ...data,
      id: Math.max(...assets.map(a => a.id), 0) + 1,
      isActive: true
    };
    assets.push(newAsset);
    resolve(newAsset);
  });
}

/**
 * Updates an asset.
 * Future: PUT /api/assets/{id}
 * @param {number} id - Asset ID
 * @param {Object} data - Asset patch
 * @returns {Promise<Object|null>} Updated asset
 */
export async function updateAsset(id, data) {
  return new Promise((resolve) => {
    const targetIdx = assets.findIndex(a => a.id === Number(id));
    if (targetIdx === -1) return resolve(null);

    const updated = { ...assets[targetIdx], ...data };
    assets[targetIdx] = updated;
    resolve(updated);
  });
}

/**
 * Deletes an asset.
 * Future: DELETE /api/assets/{id}
 * @param {number} id - Asset ID
 * @returns {Promise<boolean>} True if found and deleted
 */
export async function deleteAsset(id) {
  return new Promise((resolve) => {
    const originalLen = assets.length;
    assets = assets.filter(a => a.id !== Number(id));
    resolve(assets.length < originalLen);
  });
}
