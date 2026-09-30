interface ReceitaWSResponse {
  status: string;
  nome?: string;
  fantasia?: string;
  municipio?: string;
  uf?: string;
  message?: string;
}

export async function fetchCompanyFromCnpj(cnpj: string): Promise<{
  nome: string;
  cidade: string;
  estado: string;
} | null> {
    try {
        const cleanCnpj = cnpj.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return null;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
            `/api/external/cnpj/${cleanCnpj}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ReceitaWSResponse = await response.json();
        
        if (data.status !== 'OK') {
            return null;
        }
        
        return {
            nome: data.nome || data.fantasia || '',
            cidade: data.municipio || '',
            estado: data.uf || '',
        };
    } catch (error) {
        console.error('Erro ao buscar dados do CNPJ:', error);
        return null;
    }
}
