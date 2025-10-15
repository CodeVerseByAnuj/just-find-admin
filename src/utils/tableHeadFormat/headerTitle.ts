// export function toSentenceCase(str: string | null): string {
//   if (!str) return "";
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// }

// export function toSentenceCase(str: string | null): string {
//   return str ?? "";
// }

export function toSentenceCase(str: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

