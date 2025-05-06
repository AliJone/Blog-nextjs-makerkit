/**
 * Check if the code is running in a browser environment.
 */
export function isBrowser() {
  return typeof window !== 'undefined';
}

/**
 * @name formatCurrency
 * @description Format the currency based on the currency code
 */
export function formatCurrency(params: {
  currencyCode: string;
  locale: string;
  value: string | number;
}) {
  return new Intl.NumberFormat(params.locale, {
    style: 'currency',
    currency: params.currencyCode,
  }).format(Number(params.value));
}

/**
 * @name formatDate
 * @description Format a date string with the provided options
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}
