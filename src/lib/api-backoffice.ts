'use client'
import axios, { AxiosInstance } from 'axios'

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/backoffice`;

type Retorno<retornoType> = [retornoType | null, { message: string } | null];

export class ApiBackOffice {

    static axios: AxiosInstance;
    constructor() {
        ApiBackOffice.axios = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        ApiBackOffice.axios.interceptors.request.use((config) => {
            const token = localStorage.getItem('token-backoffice');
            if( token ) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    auth = {
        acesso: async (): Promise<Retorno<{
            message: string;
            statusCode: number;
            data: {
                id: string;
                nome: string;
                email: string;
                perfil: string;
                cargo: string[];
                permissao: string[];
                status: string;
                consultaEm: string;
            };
        }>> => {
            try {
                const response = await ApiBackOffice.axios.get('/auth/acesso');
                return [response.data, null];
            } catch (error: any) {
                return [null, { message: error.response?.data?.message || 'Erro ao buscar permissões' }];
            }
        }
    }

}