# Field Service Management System: Frontend to Backend API Integration Guide

Welcome! This document is a complete, beginner-friendly step-by-step masterclass explaining how the React Frontend is connected to the ASP.NET Core Web API backend.

---

## 📚 1. Core Concepts (Beginner Introduction)

### What is an API?
An **API (Application Programming Interface)** acts as a bridge between the User Interface (React Frontend) and the Database (SQL Server via ASP.NET Core Backend).
- **Frontend (React)**: Handles visuals, forms, buttons, and user interaction.
- **Backend (ASP.NET Core Web API)**: Handles database persistence, security, role checks, and business rules.
- **HTTP Requests**: The language spoken between frontend and backend:
  - `GET`: Fetch data (e.g., get list of technicians).
  - `POST`: Create new data (e.g., submit a service request, login).
  - `PUT` / `PATCH`: Update existing data (e.g., update technician status).
  - `DELETE`: Remove data.

---

## 🔐 2. Authentication & JWT Tokens Explained

### How JWT (JSON Web Token) Works
1. **User Login (`POST /api/Auth/login`)**:
   - Customer or Staff submits email & password.
   - Backend verifies credentials with BCrypt password hashing.
   - Backend responds with a signed **JWT Token**.
2. **Token Storage**:
   - Frontend saves token in browser `localStorage.setItem('authToken', token)`.
   - User profile details stored in `localStorage.setItem('authUser', JSON.stringify(user))`.
3. **Automatic Bearer Header**:
   - Axios interceptor attaches token to every HTTP request header:
     `Authorization: Bearer <token>`
4. **Role Enforcement**:
   - Backend reads claims from token (`Roles = "Owner,Manager"` or `"Customer"` or `"Technician"`).

---

## 🏗️ 3. Architecture & Unified Axios Client Setup

### Unified Client: `src/api/api.js`
All services communicate through a single, configured Axios instance:

```javascript
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5179/api",
    headers: { "Content-Type": "application/json" }
});

// Automatic JWT Token Interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

---

## 🔗 4. Full Endpoint Mapping Reference

Below is the complete table showing every frontend service function mapped to its corresponding ASP.NET Core backend controller endpoint:

| Service File | Function Name | HTTP Method | Backend API Endpoint | Access Role |
|:---|:---|:---|:---|:---|
| **AuthContext.jsx** | `login(email, password)` | `POST` | `/api/Auth/login` | Public |
| **AuthContext.jsx** | `register(data)` | `POST` | `/api/Auth/register` | Public |
| **serviceRequestService.js** | `getMyServiceRequests()` | `GET` | `/api/ServiceRequests/my` | Customer |
| **serviceRequestService.js** | `getCustomerRequestById(id)` | `GET` | `/api/ServiceRequests/my/{id}` | Customer |
| **serviceRequestService.js** | `createServiceRequest(data)` | `POST` | `/api/ServiceRequests` | Customer |
| **serviceRequestService.js** | `updateServiceRequest(id, data)` | `PUT` | `/api/ServiceRequests/{id}` | Customer |
| **serviceRequestService.js** | `cancelServiceRequest(id)` | `PATCH` | `/api/ServiceRequests/{id}/cancel` | Customer |
| **serviceRequestService.js** | `getAllServiceRequests()` | `GET` | `/api/ServiceRequests` | Owner, Manager |
| **serviceRequestService.js** | `getServiceRequestById(id)` | `GET` | `/api/ServiceRequests/{id}` | Owner, Manager |
| **serviceRequestService.js** | `getServiceRequestsByStatus(status)` | `GET` | `/api/ServiceRequests/status/{status}` | Owner, Manager |
| **serviceRequestService.js** | `searchServiceRequests(name)` | `GET` | `/api/ServiceRequests/search?name={name}` | Owner, Manager |
| **serviceRequestService.js** | `assignTechnician(reqId, techId)` | `PATCH` | `/api/ServiceRequests/{id}/assign` | Owner, Manager |
| **serviceRequestService.js** | `getMyTechnicianRequests()` | `GET` | `/api/ServiceRequests/technician/my` | Technician |
| **serviceRequestService.js** | `startWork(id)` | `PATCH` | `/api/ServiceRequests/{id}/start` | Technician |
| **serviceRequestService.js** | `completeJob(id)` | `PATCH` | `/api/ServiceRequests/{id}/complete` | Technician |
| **technicianService.js** | `getTechnicians()` | `GET` | `/api/Technicians` | Owner, Manager |
| **technicianService.js** | `getTechnicianById(id)` | `GET` | `/api/Technicians/{id}` | Owner, Manager |
| **technicianService.js** | `createTechnician(data)` | `POST` | `/api/Technicians` | Owner |
| **technicianService.js** | `updateTechnician(id, data)` | `PUT` | `/api/Technicians/{id}` | Owner, Manager |
| **technicianService.js** | `toggleTechnicianActive(id)` | `PATCH` | `/api/Technicians/{id}/toggle` | Owner |
| **technicianService.js** | `changeWorkStatus(id, status)` | `PATCH` | `/api/Technicians/{id}/work-status` | Owner, Manager |
| **technicianService.js** | `searchTechnicians(name)` | `GET` | `/api/Technicians/search?name={name}` | Owner, Manager |
| **workReportService.js** | `submitWorkReport(data)` | `POST` | `/api/WorkReports` | Technician |
| **workReportService.js** | `getMyWorkReports()` | `GET` | `/api/WorkReports/technician/my` | Technician |
| **workReportService.js** | `updateWorkReport(id, data)` | `PUT` | `/api/WorkReports/{id}` | Technician |
| **workReportService.js** | `addPartToReport(id, partData)` | `POST` | `/api/WorkReports/{id}/parts` | Technician |
| **workReportService.js** | `removePartFromReport(id, partId)` | `DELETE` | `/api/WorkReports/{id}/parts/{partId}` | Technician |
| **workReportService.js** | `getAllWorkReports()` | `GET` | `/api/WorkReports` | Owner, Manager |
| **workReportService.js** | `getWorkReportById(id)` | `GET` | `/api/WorkReports/{id}` | Owner, Manager |
| **workReportService.js** | `approveWorkReport(id)` | `PATCH` | `/api/WorkReports/{id}/approve` | Owner, Manager |
| **workReportService.js** | `returnWorkReportForCorrection(id, reason)` | `PATCH` | `/api/WorkReports/{id}/correction` | Owner, Manager |
| **workReportService.js** | `getWorkReportsByStatus(status)` | `GET` | `/api/WorkReports/status/{status}` | Owner, Manager |
| **serviceCatalogService.js** | `getServices()` | `GET` | `/api/Services` | Authenticated |
| **serviceCatalogService.js** | `getServiceById(id)` | `GET` | `/api/Services/{id}` | Authenticated |
| **serviceCatalogService.js** | `createService(data)` | `POST` | `/api/Services` | Owner, Manager |
| **serviceCatalogService.js** | `updateService(id, data)` | `PUT` | `/api/Services/{id}` | Owner, Manager |
| **serviceCatalogService.js** | `deleteService(id)` | `DELETE` | `/api/Services/{id}` | Owner, Manager |
| **serviceCatalogService.js** | `toggleServiceActive(id)` | `PATCH` | `/api/Services/{id}/toggle` | Owner, Manager |
| **inventoryService.js** | `getInventoryItems()` | `GET` | `/api/Inventory` | Owner, Manager |
| **inventoryService.js** | `getInventoryItemById(id)` | `GET` | `/api/Inventory/{id}` | Owner, Manager |
| **inventoryService.js** | `createInventoryItem(data)` | `POST` | `/api/Inventory` | Owner, Manager |
| **inventoryService.js** | `updateInventoryItem(id, data)` | `PUT` | `/api/Inventory/{id}` | Owner, Manager |
| **inventoryService.js** | `adjustStock(id, qty, reason)` | `PATCH` | `/api/Inventory/{id}/stock` | Owner, Manager |
| **inventoryService.js** | `getLowStockItems()` | `GET` | `/api/Inventory/low-stock` | Owner, Manager |
| **inventoryService.js** | `searchInventory(name)` | `GET` | `/api/Inventory/search?name={name}` | Owner, Manager |
| **inventoryService.js** | `deactivateInventoryItem(id)` | `PATCH` | `/api/Inventory/{id}/deactivate` | Owner, Manager |
| **addressService.js** | `getMyAddresses()` | `GET` | `/api/CustomerAddresses/my` | Customer |
| **addressService.js** | `getAddressById(id)` | `GET` | `/api/CustomerAddresses/{id}` | Customer |
| **addressService.js** | `createAddress(data)` | `POST` | `/api/CustomerAddresses` | Customer |
| **addressService.js** | `updateAddress(id, data)` | `PUT` | `/api/CustomerAddresses/{id}` | Customer |
| **addressService.js** | `deleteAddress(id)` | `DELETE` | `/api/CustomerAddresses/{id}` | Customer |
| **invoiceService.js** | `getAllInvoices()` | `GET` | `/api/Invoices` | Owner, Manager |
| **invoiceService.js** | `getInvoiceById(id)` | `GET` | `/api/Invoices/{id}` | Authenticated |
| **invoiceService.js** | `createInvoice(data)` | `POST` | `/api/Invoices` | Owner, Manager |
| **invoiceService.js** | `updateInvoice(id, data)` | `PUT` | `/api/Invoices/{id}` | Owner, Manager |
| **invoiceService.js** | `deleteInvoice(id)` | `DELETE` | `/api/Invoices/{id}` | Owner, Manager |
| **notificationService.js** | `getAllNotifications()` | `GET` | `/api/Notifications` | Authenticated |
| **notificationService.js** | `getNotificationsForUser(userId)` | `GET` | `/api/Notifications` (filtered) | Authenticated |
| **notificationService.js** | `markAsRead(id)` | `PUT` | `/api/Notifications/{id}` | Authenticated |
| **dashboardService.js** | `getCustomerDashboard()` | `GET` | `/api/ServiceRequests/dashboard` | Customer |
| **dashboardService.js** | `getManagementDashboard()` | `GET` | `/api/ServiceRequests/management-dashboard` | Owner, Manager |
| **dashboardService.js** | `getTechnicianDashboard()` | `GET` | `/api/Technicians/dashboard` | Technician |

---

## 🚀 5. How to Run & Verify

1. **Start ASP.NET Core Backend**:
   ```bash
   cd Backend/FieldServiceManagement.API
   dotnet run
   ```
   *Make sure backend is listening on `http://localhost:5179` or adjust `VITE_API_URL` in `.env` file.*

2. **Start React Frontend**:
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Verify API Connection**:
   - Open browser developer tools -> **Network Tab**.
   - Log in or register an account.
   - You will see HTTP requests hitting `http://localhost:5179/api/...` returning real HTTP 200/201 responses!
