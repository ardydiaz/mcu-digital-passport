export const formatDate = (value, locale = 'en-PH') => new Date(value).toLocaleDateString(locale);
