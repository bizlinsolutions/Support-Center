export function formatDateISO(date) {
  if (!date) return '';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch (e) {
    return String(date);
  }
}

export function formatDateTimeISO(date) {
  if (!date) return '';
  try {
    return new Date(date).toISOString().replace('T', ' ').split('.')[0];
  } catch (e) {
    return String(date);
  }
}
