import axios from 'axios';

interface ViaCepResponse {
  postalCode: string;
  logradouro: string;
  complement: string;
  district: string;
  localidade: string;
  state: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export async function fetchAddressFromCep(postalCode: string): Promise<{
  address: string;
  district: string;
  city: string;
  state: string;
} | null> {
  try {
    const cleanCep = postalCode.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return null;
    }

    const response = await axios.get<ViaCepResponse>(`https://viacep.com.br/ws/${cleanCep}/json/`);

    if (response.data.erro) {
      return null;
    }

    return {
      address: response.data.logradouro,
      district: response.data.district,
      city: response.data.localidade,
      state: response.data.state,
    };
  } catch (error) {
    console.error('Error fetching address from CEP:', error);
    return null;
  }
}
