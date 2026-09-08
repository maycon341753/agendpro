export function minuteToTime(mins) {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function timeToMinute(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export function slotsForDay(openTime, closeTime, breakStart, breakEnd, interval = 30) {
  const slots = [];
  const open = timeToMinute(openTime);
  const close = timeToMinute(closeTime);
  const breakS = breakStart ? timeToMinute(breakStart) : null;
  const breakE = breakEnd ? timeToMinute(breakEnd) : null;

  for (let time = open; time + interval <= close; time += interval) {
    if (breakS && breakE && time + interval > breakS && time < breakE) {
      continue;
    }
    slots.push(minuteToTime(time));
  }

  return slots;
}

export function checkConflict({ existingAppointments, start, end, excludeId = null }) {
  const startTime = start instanceof Date ? start.getTime() : new Date(start).getTime();
  const endTime = end instanceof Date ? end.getTime() : new Date(end).getTime();

  return existingAppointments.some((apt) => {
    if (excludeId && apt.id === excludeId) return false;

    const aptStart = apt.start instanceof Date ? apt.start.getTime() : new Date(apt.start).getTime();
    const aptEnd = apt.end instanceof Date ? apt.end.getTime() : new Date(apt.end).getTime();

    return startTime < aptEnd && endTime > aptStart;
  });
}

export function getAvailableSlots({
  companyHours,
  professionalHours,
  holidays = [],
  blocks = [],
  appointments = [],
  serviceDuration,
  date,
  intervalMinutes = 30,
}) {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();
  const dateStr = targetDate.toISOString().split("T")[0];

  const isHoliday = holidays.some((h) => {
    const hDate = new Date(h.date);
    return hDate.toISOString().split("T")[0] === dateStr;
  });

  const isFullBlock = blocks.some((b) => {
    const bDate = new Date(b.date);
    return bDate.toISOString().split("T")[0] === dateStr && b.isFullDay;
  });

  if (isHoliday || isFullBlock) {
    return [];
  }

  const workHours = professionalHours && professionalHours[dayOfWeek]?.enabled
    ? professionalHours[dayOfWeek]
    : companyHours?.[dayOfWeek]?.enabled
      ? companyHours[dayOfWeek]
      : null;

  if (!workHours || !workHours.enabled) {
    return [];
  }

  let slots = slotsForDay(
    workHours.openTime,
    workHours.closeTime,
    workHours.breakStart,
    workHours.breakEnd,
    intervalMinutes
  );

  const now = new Date();
  const isToday = now.toISOString().split("T")[0] === dateStr;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (isToday) {
    slots = slots.filter((slot) => timeToMinute(slot) > nowMinutes);
  }

  const dayBlocks = blocks.filter((b) => {
    const bDate = new Date(b.date);
    return bDate.toISOString().split("T")[0] === dateStr && !b.isFullDay;
  });

  const dayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.start);
    return aptDate.toISOString().split("T")[0] === dateStr;
  });

  const duration = serviceDuration || intervalMinutes;

  slots = slots.filter((slot) => {
    const slotStartMin = timeToMinute(slot);
    const slotEndMin = slotStartMin + duration;

    for (const block of dayBlocks) {
      const blkStart = timeToMinute(block.startTime);
      const blkEnd = timeToMinute(block.endTime);
      if (slotStartMin < blkEnd && slotEndMin > blkStart) {
        return false;
      }
    }

    for (const apt of dayAppointments) {
      const aptDate = new Date(apt.start);
      const aptStartMin = aptDate.getHours() * 60 + aptDate.getMinutes();
      const aptEndDate = new Date(apt.end);
      const aptEndMin = aptEndDate.getHours() * 60 + aptEndDate.getMinutes();
      if (slotStartMin < aptEndMin && slotEndMin > aptStartMin) {
        return false;
      }
    }

    const closeMin = timeToMinute(workHours.closeTime);
    if (slotEndMin > closeMin) {
      return false;
    }

    return true;
  });

  return slots;
}

const availabilityLib = {
  minuteToTime,
  timeToMinute,
  slotsForDay,
  checkConflict,
  getAvailableSlots,
};

export default availabilityLib;
