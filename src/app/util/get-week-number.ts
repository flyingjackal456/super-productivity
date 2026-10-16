export const getWeekNumber = (
  d: Date,
  firstDayOfWeek: number = 1,
  weekNumberSystem: 'iso' | 'us' = 'iso',
): number => {
  // Copy date so don't modify original
  const date = new Date(d);

  if (weekNumberSystem === 'us') {
    // US Week Number: Week 1 is the week containing January 1
    // Use LOCAL time to match the aria-label date (which is in local time)

    // Get the year, month, day from the local date (not UTC)
    const year = date.getFullYear();
    const jan1 = new Date(year, 0, 1);

    // Get the day of week for Jan 1 (0=Sunday, 1=Monday, ..., 6=Saturday)
    const jan1DayOfWeek = jan1.getDay();

    // Calculate days from the start of the week containing Jan 1 to Jan 1
    // The week starts on: Jan 1 - (days from start of week to Jan 1)
    // days from start of week to Jan 1 = (jan1DayOfWeek - firstDayOfWeek + 7) % 7
    const daysFromWeekStartToJan1 = (jan1DayOfWeek - firstDayOfWeek + 7) % 7;
    const week1Start = new Date(jan1);
    week1Start.setDate(jan1.getDate() - daysFromWeekStartToJan1);

    // Calculate days from week 1 start to the target date
    const daysDiff = (date.getTime() - week1Start.getTime()) / 86400000;

    // Week number = (days / 7) + 1
    const weekNumber = Math.floor(daysDiff / 7) + 1;

    // Handle edge case: if week number is 0 or negative, it belongs to previous year's last week
    if (weekNumber <= 0) {
      // Recalculate for previous year
      const prevYearJan1 = new Date(year - 1, 0, 1);
      const prevYearJan1DayOfWeek = prevYearJan1.getDay();
      const prevYearDaysFromWeekStartToJan1 =
        (prevYearJan1DayOfWeek - firstDayOfWeek + 7) % 7;
      const prevYearWeek1Start = new Date(prevYearJan1);
      prevYearWeek1Start.setDate(
        prevYearJan1.getDate() - prevYearDaysFromWeekStartToJan1,
      );
      const prevYearDaysDiff = (date.getTime() - prevYearWeek1Start.getTime()) / 86400000;
      return Math.floor(prevYearDaysDiff / 7) + 1;
    }

    // Handle edge case: if week number is too large, it belongs to next year's week 1
    // Check if the week containing the date includes Jan 1 of the next year
    // The week contains Jan 1 if: weekStart <= Jan1 < weekStart + 7 days
    const dateDayOfWeek = date.getDay();
    const daysFromWeekStartToDate = (dateDayOfWeek - firstDayOfWeek + 7) % 7;
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - daysFromWeekStartToDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // weekStart + 6 days = end of week

    const nextYearJan1 = new Date(year + 1, 0, 1);
    if (weekStart <= nextYearJan1 && weekEnd >= nextYearJan1) {
      // This week contains Jan 1 of the next year, so use next year's week 1
      const nextYearJan1DayOfWeek = nextYearJan1.getDay();
      const nextYearDaysFromWeekStartToJan1 =
        (nextYearJan1DayOfWeek - firstDayOfWeek + 7) % 7;
      const nextYearWeek1Start = new Date(nextYearJan1);
      nextYearWeek1Start.setDate(
        nextYearJan1.getDate() - nextYearDaysFromWeekStartToJan1,
      );
      // Calculate days from next year's week 1 start to this week's start
      const nextYearDaysDiff =
        (weekStart.getTime() - nextYearWeek1Start.getTime()) / 86400000;
      return Math.floor(nextYearDaysDiff / 7) + 1;
    }

    return weekNumber;
  } else {
    // ISO Week Number: Week 1 is the week containing the first Thursday
    // Use LOCAL time to match the aria-label date (which is in local time)
    // ISO weeks always start on Monday (firstDayOfWeek is ignored)

    // Copy date so don't modify original
    const isoDate = new Date(date);

    // For ISO, the week always starts on Monday (day 1), so Thursday is day 4
    // Offset to find the Thursday of the current week (to determine the ISO week)
    // getDay(): Sunday=0, Monday=1, ..., Saturday=6
    // We want to find Thursday (day 4) of the ISO week containing this date
    const daysToThursday = 4 - isoDate.getDay(); // difference to Thursday (0=Thursday, +ve=future)
    isoDate.setDate(isoDate.getDate() + daysToThursday);

    // Get first day of year
    const yearStart = new Date(isoDate.getFullYear(), 0, 1);

    // Calculate full weeks to the Thursday
    // prettier-ignore
    const weekNo = Math.ceil((((+isoDate - +yearStart) / 86400000) + 1) / 7);

    return weekNo;
  }
};
