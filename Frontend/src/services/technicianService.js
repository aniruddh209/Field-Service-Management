import api from "../api/api";
import { usersData } from "../data/usersData";

let techniciansList = [
  {
    id: 1,
    userId: 4,
    name: 'Ravi Kumar',
    employeeCode: 'TECH-001',
    email: 'ravi.kumar@fieldservice.demo',
    phone: '9876500001',
    specialization: 'AC & Cooling',
    rating: 4.8,
    totalJobs: 42,
    completedJobs: 40,
    activeJobs: 2,
    isActive: true,
    workStatus: 'Available'
  },
  {
    id: 2,
    userId: 8,
    name: 'Amit Singh',
    employeeCode: 'TECH-002',
    email: 'amit.singh@fieldservice.demo',
    phone: '9876500003',
    specialization: 'Appliance & CCTV',
    rating: 4.6,
    totalJobs: 28,
    completedJobs: 26,
    activeJobs: 2,
    isActive: true,
    workStatus: 'On Job'
  },
  {
    id: 3,
    userId: 9,
    name: 'Suresh Patel',
    employeeCode: 'TECH-003',
    email: 'suresh.patel@fieldservice.demo',
    phone: '9876500004',
    specialization: 'Plumbing & Electrical',
    rating: 4.9,
    totalJobs: 55,
    completedJobs: 54,
    activeJobs: 1,
    isActive: true,
    workStatus: 'Available'
  }
];

export async function getTechnicians() {
  try {
    const response = await api.get("/Technicians");
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local technicians store:", err.message);
  }
  return techniciansList;
}

export async function getTechnicianById(id) {
  try {
    const response = await api.get(`/Technicians/${id}`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local technicians store:", err.message);
  }
  const tech = techniciansList.find(t => t.id === Number(id) || String(t.id) === String(id));
  return tech || null;
}

export async function getTechnicianByUserId(userId) {
  try {
    const response = await api.get(`/Technicians/user/${userId}`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local technicians store:", err.message);
  }
  const tech = techniciansList.find(t => t.userId === Number(userId));
  if (tech) return tech;

  // Fallback match user by id
  const user = usersData.find(u => u.id === Number(userId));
  if (user && user.role === 'Technician') {
    return {
      id: user.id,
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      employeeCode: `TECH-00${user.id}`,
      email: user.email,
      phone: user.phoneNumber,
      specialization: 'General Maintenance',
      rating: 4.8,
      totalJobs: 10,
      completedJobs: 9,
      activeJobs: 1,
      isActive: true,
      workStatus: 'Available'
    };
  }
  return null;
}

export async function createTechnician(techData) {
  try {
    const response = await api.post("/Technicians", techData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local technicians store:", err.message);
  }

  const newId = techniciansList.length ? Math.max(...techniciansList.map(t => t.id)) + 1 : 1;
  const newTech = {
    id: newId,
    userId: techData.userId || (newId + 10),
    rating: 5.0,
    totalJobs: 0,
    completedJobs: 0,
    activeJobs: 0,
    isActive: true,
    workStatus: 'Available',
    ...techData
  };
  techniciansList.push(newTech);
  return newTech;
}

export async function updateTechnician(id, techData) {
  try {
    const response = await api.put(`/Technicians/${id}`, techData);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local technicians store:", err.message);
  }

  techniciansList = techniciansList.map(t => t.id === Number(id) ? { ...t, ...techData } : t);
  return techniciansList.find(t => t.id === Number(id));
}

export async function toggleTechnicianActive(id) {
  try {
    const response = await api.put(`/Technicians/${id}/toggle-active`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local technicians store:", err.message);
  }

  techniciansList = techniciansList.map(t => 
    t.id === Number(id) ? { ...t, isActive: !t.isActive } : t
  );
  return techniciansList.find(t => t.id === Number(id));
}

export async function changeWorkStatus(id, workStatus) {
  try {
    const response = await api.put(`/Technicians/${id}/work-status`, { workStatus });
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local technicians store:", err.message);
  }

  techniciansList = techniciansList.map(t => 
    t.id === Number(id) ? { ...t, workStatus } : t
  );
  return techniciansList.find(t => t.id === Number(id));
}
