export function maskCelular(value: string): string {
    let cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length > 11) {
      cleanValue = cleanValue.slice(0, 11); // Limita ao máximo de 11 dígitos
    }
  
    if (cleanValue.length <= 2) {
      return `(${cleanValue}`;
    } else if (cleanValue.length <= 3) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
    } else if (cleanValue.length <= 7) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 3)} ${cleanValue.slice(3)}`;
    } else {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 3)} ${cleanValue.slice(3, 7)}-${cleanValue.slice(7)}`;
    }
  }