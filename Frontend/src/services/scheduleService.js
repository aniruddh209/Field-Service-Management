import api from "../api/api";
import { serviceRequestsData } from "../data/serviceRequestsData";

export async function getTechnicianSchedule(technicianId) {
  try {
    const response = await api.get(`/Technicians/${technicianId}/schedule`);
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local schedule data:", err.message);
  }

  const techRequests = serviceRequestsData.filter(r => 
    r.assignedTechnicianId === Number(technicianId)
  );

  const today = techRequests.filter(r => r.status === 'InProgress' || r.status === 'Assigned' || r.status === 'Accepted' || r.status === 'OnTheWay');
  const upcoming = techRequests.filter(r => r.status === 'Pending' || r.status === 'UnderReview');

  return { today, upcoming };
}

export async function getFullSchedule() {
  try {
    const response = await api.get("/Technicians/schedule");
    if (response.data) return response.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local schedule data:", err.message);
  }

  const today = serviceRequestsData.filter(r => 
    ['InProgress', 'Assigned', 'Accepted', 'OnTheWay'].includes(r.status)
  );
  const upcoming = serviceRequestsData.filter(r => 
    ['Pending', 'UnderReview'].includes(r.status)
  );

  return { today, upcoming };
}
