// Helper for dynamic sysdate, production shifts, and scheduled break times (Jam Istirahat)
// Shift 1: 07:00 - 15:00 WIB (Istirahat: 11:30 - 12:30 WIB)
// Shift 2: 15:00 - 23:00 WIB (Istirahat: 17:30 - 18:30 WIB)
// Shift 3: 23:00 - 07:00 WIB (Istirahat: 02:00 - 03:00 WIB)

export const BREAK_SCHEDULES = {
  shift1: {
    shiftNum: 1,
    name: 'Istirahat Shift 1',
    startHour: 11.5, // 11:30
    endHour: 12.5,   // 12:30
    durationHours: 1.0,
    timeRange: '11:30 - 12:30 WIB',
    shortDisplay: '11:30 - 12:30'
  },
  shift2: {
    shiftNum: 2,
    name: 'Istirahat Shift 2',
    startHour: 17.5, // 17:30
    endHour: 18.5,   // 18:30
    durationHours: 1.0,
    timeRange: '17:30 - 18:30 WIB',
    shortDisplay: '17:30 - 18:30'
  },
  shift3: {
    shiftNum: 3,
    name: 'Istirahat Shift 3',
    startHour: 2.0,  // 02:00
    endHour: 3.0,    // 03:00
    durationHours: 1.0,
    timeRange: '02:00 - 03:00 WIB',
    shortDisplay: '02:00 - 03:00'
  }
};

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

  // Exact current position in hours (e.g. 11:30 -> 11.5)
  const currentHourDecimal = hours + minutes / 60;

  // Calculate current shift (Semua shift bertema hijau / emerald sesuai permintaan)
  let shiftNum = 3;
  let timeRange = '23:00 - 07:00 WIB';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let startHourInDay = 23;
  let durationHours = 8;
  let breakSchedule = BREAK_SCHEDULES.shift3;

  if (hours >= 7 && hours < 15) {
    shiftNum = 1;
    timeRange = '07:00 - 15:00 WIB';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    startHourInDay = 7;
    breakSchedule = BREAK_SCHEDULES.shift1;
  } else if (hours >= 15 && hours < 23) {
    shiftNum = 2;
    timeRange = '15:00 - 23:00 WIB';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    startHourInDay = 15;
    breakSchedule = BREAK_SCHEDULES.shift2;
  } else {
    // Shift 3: 23:00 to 07:00
    startHourInDay = hours < 7 ? -1 : 23;
    breakSchedule = BREAK_SCHEDULES.shift3;
  }

  // Check if right now is within break time
  let isBreakTime = false;
  if (shiftNum === 1 && currentHourDecimal >= 11.5 && currentHourDecimal < 12.5) {
    isBreakTime = true;
  } else if (shiftNum === 2 && currentHourDecimal >= 17.5 && currentHourDecimal < 18.5) {
    isBreakTime = true;
  } else if (shiftNum === 3 && currentHourDecimal >= 2.0 && currentHourDecimal < 3.0) {
    isBreakTime = true;
  }

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
    breakSchedule,
    isBreakTime,
    breakDisplay: breakSchedule.timeRange,
    supervisor: 'Joshua Yordana (ICT)',
    leadOperator: 'Rafael Abiyyu Budiarto'
  };
}
