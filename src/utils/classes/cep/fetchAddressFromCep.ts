import axios from 'axios';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export async function fetchAddressFromCep(cep: string): Promise<{
  endereco: string;
  bairro: string;
  municipio: string;
  uf: string;
} | null> {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return null;
    }
    
    const response = await axios.get<ViaCepResponse>(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (response.data.erro) {
      return null;
    }
    
    return {
      endereco: response.data.logradouro,
      bairro: response.data.bairro,
      municipio: response.data.localidade,
      uf: response.data.uf,
    };
  } catch (error) {
    console.error('Error fetching address from CEP:', error);
    return null;
  }
}