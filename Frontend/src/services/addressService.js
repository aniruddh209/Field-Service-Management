// ====================================
// Address Service
// ====================================
//
// Operations on customer service addresses.
//
// Current: modifies local dummy copy in memory (resets on reload).
// Future: GET/POST/PUT/DELETE /api/addresses
//
// ====================================

import { addressesData } from '../data/addressesData.js';

let addresses = [...addressesData];

/**
 * Fetches all addresses for a customer.
 * Future: GET /api/addresses/my
 * @param {number} customerId - Customer identifier
 * @returns {Promise<Array>} List of addresses
 */
export async function getMyAddresses(customerId) {
  return new Promise((resolve) => {
    resolve(addresses.filter(a => a.customerId === customerId));
  });
}

/**
 * Retrieves a single address.
 * Future: GET /api/addresses/{id}
 * @param {number} id - Address ID
 * @returns {Promise<Object|null>} Address entry or null
 */
export async function getAddressById(id) {
  return new Promise((resolve) => {
    resolve(addresses.find(a => a.id === Number(id)) || null);
  });
}

/**
 * Saves a new address.
 * Future: POST /api/addresses
 * @param {Object} data - Address DTO
 * @returns {Promise<Object>} Created address
 */
export async function createAddress(data) {
  return new Promise((resolve) => {
    const newAddress = {
      ...data,
      id: Math.max(...addresses.map(a => a.id), 0) + 1,
      isDefault: addresses.length === 0 ? true : !!data.isDefault
    };

    if (newAddress.isDefault) {
      addresses = addresses.map(a => 
        a.customerId === newAddress.customerId ? { ...a, isDefault: false } : a
      );
    }

    addresses.push(newAddress);
    resolve(newAddress);
  });
}

/**
 * Updates an address.
 * Future: PUT /api/addresses/{id}
 * @param {number} id - Address ID
 * @param {Object} data - Address patch
 * @returns {Promise<Object|null>} Updated address
 */
export async function updateAddress(id, data) {
  return new Promise((resolve) => {
    const targetIdx = addresses.findIndex(a => a.id === Number(id));
    if (targetIdx === -1) return resolve(null);

    const updated = { ...addresses[targetIdx], ...data };
    
    if (data.isDefault && !addresses[targetIdx].isDefault) {
      addresses = addresses.map(a => 
        a.customerId === updated.customerId ? { ...a, isDefault: false } : a
      );
    }

    addresses[targetIdx] = updated;
    resolve(updated);
  });
}

/**
 * Deletes an address.
 * Future: DELETE /api/addresses/{id}
 * @param {number} id - Address ID
 * @returns {Promise<boolean>} True if found and deleted
 */
export async function deleteAddress(id) {
  return new Promise((resolve) => {
    const originalLen = addresses.length;
    addresses = addresses.filter(a => a.id !== Number(id));
    resolve(addresses.length < originalLen);
  });
}

/**
 * Sets default location flag.
 * Future: PUT /api/addresses/{id}/set-default
 * @param {number} customerId - Customer ID
 * @param {number} addressId - Address ID
 * @returns {Promise<boolean>} True if modified
 */
export async function setDefaultAddress(customerId, addressId) {
  return new Promise((resolve) => {
    addresses = addresses.map(a => {
      if (a.customerId === customerId) {
        return { ...a, isDefault: a.id === Number(addressId) };
      }
      return a;
    });
    resolve(true);
  });
}
