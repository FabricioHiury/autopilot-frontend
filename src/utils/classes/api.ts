import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { Query } from "./query";
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

class Api {
    private readonly axiosInstance: AxiosInstance;
    private readonly tokenKey: string;
    private static readonly excludedAuthEndpoints = new Set([
        "auth/login",
        "auth/login-admin",
        "auth/recuperar-senha",
        "loja/cadastrar",
    ]);

    public readonly query: Query;

    constructor(tokenKey: string) {
        this.tokenKey = tokenKey;
        this.query = new Query();

        this.axiosInstance = axios.create({
            baseURL: API_URL,
            headers: { "Content-Type": "application/json" },
        });

        this.axiosInstance.interceptors.request.use(this.attachAuthToken);

        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error.response?.status;
                const errorMessage = error.response?.data?.message || '';

                // Verificar se é erro 403 relacionado a assinatura - não redirecionar
                if (status === 403 && errorMessage.includes('assinatura ativa')) {
                    return Promise.reject(error);
                }

                if (status === 401 || status === 403) {
                    if (this.tokenKey === 'token') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('usuario');
                        Cookies.remove('secure_token');
                    } else {
                        localStorage.removeItem('token-backoffice');
                        localStorage.removeItem('usuario-backoffice');
                        Cookies.remove('secure_token_backoffice');
                    }

                    const isBackoffice = this.tokenKey === 'token-backoffice';
                    const redirectPath = isBackoffice
                        ? '/autenticacao/login?redirect=/backoffice/app/dashboard'
                        : '/autenticacao/login?redirect=/app/dashboard';

                    if (typeof window !== 'undefined') {
                        window.location.href = redirectPath;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private attachAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const endpoint = config.url?.split("?")[0] || "";

        if (Api.excludedAuthEndpoints.has(endpoint)) {
            return config;
        }

        if (typeof window === "undefined") {
            return config;
        }

        const cookieToken = Cookies.get(this.tokenKey === 'token' ? 'secure_token' : 'secure_token_backoffice');
        const localToken = localStorage.getItem(this.tokenKey);

        const token = cookieToken || localToken;

        if (!token) {
            console.error("Token não encontrado");
            return config;
        }

        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;

        return config;
    }

    private async request<T = any>(
        method: string,
        endpoint: string,
        data?: any,
        headers?: Record<string, any>,
        config?: Record<string, any>
    ): Promise<[T | null, any]> {
        try {
            const response = await this.axiosInstance.request<T>({
                method,
                url: endpoint,
                data,
                headers,
                ...(config || {}),
            });
            return [response.data, null];
        } catch (error) {
            const err = error as AxiosError;
            if (!err.response) {
                return [null, { message: "Server unavailable", error }];
            }
            return [null, err.response.data];
        }
    }

    public get<T = any>(endpoint: string, config?: Record<string, any>): Promise<[T | null, any]> {
        return this.request("GET", endpoint, undefined, undefined, config);
    }

    public post<T = any>(endpoint: string, data?: Record<string, any>): Promise<[T | null, any]> {
        return this.request("POST", endpoint, data);
    }

    public put<T = any>(endpoint: string, data?: Record<string, any>): Promise<[T | null, any]> {
        return this.request("PUT", endpoint, data);
    }

    public delete<T = any>(endpoint: string, data?: Record<string, any>): Promise<[T | null, any]> {
        return this.request("DELETE", endpoint, data);
    }

    public async formData<T = any>(endpoint: string, data: Record<string, any>, method: string = "PUT"): Promise<[T | null, any]> {
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        return this.request(method, endpoint, formData, { "Content-Type": "multipart/form-data" });
    }

    public async uploadFile<T = any>(endpoint: string, formData: FormData, method: string = "POST"): Promise<[T | null, any]> {
        try {
            const token = Cookies.get(this.tokenKey === 'token' ? 'secure_token' : 'secure_token_backoffice') || localStorage.getItem(this.tokenKey);

            const response = await axios({
                method,
                url: `${this.axiosInstance.defaults.baseURL}${endpoint}`,
                data: formData,
                headers: {
                    'Authorization': token ? `Bearer ${token}` : undefined,
                },
            });

            return [response.data, null];
        } catch (error) {
            const err = error as AxiosError;
            if (!err.response) {
                return [null, { message: "Server unavailable", error }];
            }
            return [null, err.response.data];
        }
    }
}

const api = new Api("token");
export default api;

export const apiAdmin = new Api("token-backoffice");
