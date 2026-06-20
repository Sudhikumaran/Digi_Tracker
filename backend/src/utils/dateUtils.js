const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getMonthRange = (date) => {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const getQuarterRange = (date) => {
  const d = new Date(date);
  const quarter = Math.floor(d.getMonth() / 3);
  const start = new Date(d.getFullYear(), quarter * 3, 1);
  const end = new Date(d.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
  return { start, end };
};

const getYearRange = (date) => {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 1);
  const end = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
};

const calculateGrowth = (current, previous) => {
  if (previous === 0 || previous === null || previous === undefined) {
    return current > 0 ? 100 : 0;
  }
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
};

const getNumericValue = (values, fieldSlug) => {
  const field = values.find((v) => v.fieldSlug === fieldSlug);
  if (!field) return 0;
  const val = parseFloat(field.value);
  return isNaN(val) ? 0 : val;
};

module.exports = {
  startOfDay,
  endOfDay,
  getWeekRange,
  getMonthRange,
  getQuarterRange,
  getYearRange,
  calculateGrowth,
  getNumericValue,
};
