export const formatDate = (
  input: string | number | Date,
  locale: string = 'en-IN',
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
): string => {
  const date = new Date(input)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString(locale, options)
}
