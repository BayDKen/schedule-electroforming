// Helper for dynamic sysdate and production shifts
// Shift 1: 07:00 - 15:00 WIB
// Shift 2: 15:00 - 23:00 WIB
// Shift 3: 23:00 - 07:00 WIB

export function getSystemShiftInfo(date = new Date()) {
  const now = new Date(date);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const dayName = days[now.getDay()];
  const dateNum = String(now.getDate()).padStart(2, '0');
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();
  const currentDateStr = `${dayName}, ${dateNum} ${monthName} ${year}`;

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`;

  // Calculate current shift
  let shiftNum = 3;
  let timeRange = '23:00 - 07:00 WIB';
  let badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
  let startHourInDay = 23;
  let durationHours = 8;

  if (hours >= 7 && hours < 15) {
    shiftNum = 1;
    timeRange = '07:00 - 15:00 WIB';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    startHourInDay = 7;
  } else if (hours >= 15 && hours < 23) {
    shiftNum = 2;
    timeRange = '15:00 - 23:00 WIB';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    startHourInDay = 15;
  } else {
    // Shift 3: 23:00 to 07:00
    // If hours < 7, start was yesterday 23:00
    startHourInDay = hours < 7 ? -1 : 23;
  }

  // Exact current position in hours (e.g. 8:30 -> 8.5)
  const currentHourDecimal = hours + minutes / 60;

  return {
    now,
    currentDateStr,
    dayName,
    dateNum,
    monthName,
    year,
    monthYearStr: `${now.toLocaleDateString('id-ID', { month: 'long' })} ${year}`,
    hours,
    minutes,
    timeFormatted,
    shiftNum,
    timeRange,
    badgeColor,
    startHourInDay,
    durationHours,
    currentHourDecimal,
    supervisor: 'Joshua Yordana (ICT)',
    leadOperator: 'Rafael Abiyyu Budiarto'
  };
}
