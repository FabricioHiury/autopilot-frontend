interface ReceitaWSResponse {
  status: string;
  name?: string;
  fantasia?: string;
  city?: string;
  state?: string;
  message?: string;
}

export async function fetchCompanyFromCnpj(taxId: string): Promise<{
  name: string;
  city: string;
  state: string;
} | null> {
  try {
    const cleanCnpj = taxId.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`/api/external/cnpj/${cleanCnpj}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ReceitaWSResponse = await response.json();

    if (data.status !== 'OK') {
      return null;
    }

    return {
      name: data.name || data.fantasia || '',
      city: data.city || '',
      state: data.state || '',
    };
  } catch (error) {
    console.error('Erro ao buscar dados do CNPJ:', error);
    return null;
  }
}
