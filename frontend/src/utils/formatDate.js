const LOCALE = 'en-PH';

/** e.g. "Nov 15, 2026" (pass options to customise) */
export const formatDate = (value, options = { year: 'numeric', month: 'short', day: 'numeric' }) =>
  new Date(value).toLocaleDateString(LOCALE, options);

/** e.g. "Nov 15 • 2:00 PM" */
export const formatDateTime = (value) => {
  const date = new Date(value);
  const day = date.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric' });
  const time = date.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' });
  return `${day} • ${time}`;
};

/** e.g. "AUG 2027" */
export const formatMonthYear = (value) =>
  new Date(value).toLocaleDateString(LOCALE, { month: 'short', year: 'numeric' }).toUpperCase();
