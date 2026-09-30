export function maskCNPJ(value: string): string {
    let cleanValue = value.replace(/\D/g, '');
  
    // Limita ao máximo de 14 dígitos
    if (cleanValue.length > 14) {
      cleanValue = cleanValue.slice(0, 14);
    }
  
    // Aplica a máscara de CNPJ
    if (cleanValue.length <= 2) {
      return cleanValue;
    } else if (cleanValue.length <= 5) {
      return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
    } else if (cleanValue.length <= 8) {
      return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
    } else if (cleanValue.length <= 12) {
      return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`;
    } else {
      return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12)}`;
    }
  }