export function maskCEP(value: string): string {
  let cleanValue = value.replace(/\D/g, '');

  if (cleanValue.length > 8) {
    cleanValue = cleanValue.slice(0, 8);
  }

  if (cleanValue.length <= 5) {
    return cleanValue;
  } else {
    return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5)}`;
  }
}
