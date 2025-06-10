import dayjs from "dayjs";

export function useTimeCalculations() {
  const calculateWorkingHours = (startTime, endTime, pauseMinutes) => {
    let start = dayjs(startTime);
    let end = dayjs(endTime);
    
    if (end.isBefore(start)) {
      end = end.add(1, 'day');
    }
    
    const totalHours = end.diff(start, 'hour', true);
    const pauseHours = pauseMinutes / 60;
    const workingHours = totalHours - pauseHours;
    
    return workingHours > 0 ? workingHours : 0;
  };

  const calculatePause = (startTime, endTime) => {
    let start = dayjs(startTime);
    let end = dayjs(endTime);
    
    if (end.isBefore(start)) {
      end = end.add(1, 'day');
    }
    
    const totalHours = end.diff(start, 'hour', true);
    
    if (totalHours >= 9) {
      return 45;
    } else if (totalHours >= 6) {
      return 30;
    } else {
      return 0;
    }
  };

  const calculateWorkingHoursAndPause = (startTime, endTime) => {
    let start = dayjs(startTime);
    let end = dayjs(endTime);
    
    if (end.isBefore(start)) {
      end = end.add(1, 'day');
    }
    
    const totalHours = end.diff(start, 'hour', true);
    
    let pauseMinutes = 0;
    if (totalHours >= 9) {
      pauseMinutes = 45;
    } else if (totalHours >= 6) {
      pauseMinutes = 30;
    }
    
    const pauseHours = pauseMinutes / 60;
    const workingHours = totalHours - pauseHours;
    
    return {
      workingHours: workingHours > 0 ? workingHours : 0,
      pauseMinutes: pauseMinutes
    };
  };

  const formatHoursAndMinutes = (decimalHours) => {
    if (decimalHours <= 0) return "-";
    
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} Std`;
    } else {
      return `${hours} Std ${minutes} min`;
    }
  };

  return {
    calculateWorkingHours,
    calculatePause,
    calculateWorkingHoursAndPause,
    formatHoursAndMinutes
  };
}
export default useTimeCalculations;