export async function getAvailableSlotsAPI(companyId, { serviceId, professionalId, date, interval }) {
  console.log("[availabilityService] getAvailableSlotsAPI", {
    companyId,
    serviceId,
    professionalId,
    date,
    interval,
  });

  return Promise.resolve([
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "14:00",
    "14:30",
    "15:00",
    "16:00",
  ]);
}

export async function checkConflictAPI(companyId, appointmentPayload) {
  console.log("[availabilityService] checkConflictAPI", {
    companyId,
    appointmentPayload,
  });

  return Promise.resolve({ hasConflict: false, conflictingAppointments: [] });
}

export default {
  getAvailableSlotsAPI,
  checkConflictAPI,
};
