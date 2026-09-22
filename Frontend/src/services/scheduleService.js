import api from "../api/api";
import { getAssignedServiceRequests } from "./serviceRequestService";

export async function getTechnicianSchedule() {
  const jobs = await getAssignedServiceRequests().catch(() => []);
  const todayStr = new Date().toISOString().split('T')[0];
  
  const today = jobs.filter(j => {
    if (!j.preferredDate) return true;
    return j.preferredDate.startsWith(todayStr) || ['Assigned', 'InProgress'].includes(j.status);
  });

  const upcoming = jobs.filter(j => !today.includes(j));
  
  return { today, upcoming, all: jobs };
}

export async function getFullSchedule() {
  const response = await api.get("/ServiceRequests");
  const requests = response.data?.data || response.data || [];
  
  const today = requests.filter(r => ['Assigned', 'InProgress'].includes(r.status));
  const upcoming = requests.filter(r => r.status === 'Pending');
  
  return { today, upcoming, all: requests };
}
