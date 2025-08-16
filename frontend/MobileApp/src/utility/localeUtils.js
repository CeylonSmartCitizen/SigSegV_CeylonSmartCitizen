 //localeUtils.js - Utilities for locale-specific formatting


export function formatDate(date, locale = 'en') {
  try {
    return new Date(date).toLocaleDateString(locale);
  } catch {
    return date;
  }
}

export function formatTime(date, locale = 'en') {
  try {
    return new Date(date).toLocaleTimeString(locale);
  } catch {
    return date;
  }
}

export function formatDateTime(date, locale = 'en') {
  try {
    return new Date(date).toLocaleString(locale);
  } catch {
    return date;
  }
}

export function formatCurrency(amount, locale = 'si-LK', currency = 'LKR') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch {
    return amount;
  }
}

export function formatNumber(number, locale = 'en') {
  try {
    return new Intl.NumberFormat(locale).format(number);
  } catch {
    return number;
  }
}


