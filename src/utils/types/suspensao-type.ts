export interface SuspensaoType {
    id: string;
    idUsuario: string;
    descricao: string;
    startDate: string;
    endDate: string;
    criadoEm: string;
    atualizadoEm: string;
    usuario?: {
        id: string;
        nome: string;
        email: string;
        avatar?: {
            arquivo?: {
                url?: string;
            };
        };
    };
}

export interface FiltroSuspensaoType {
    idUsuario?: string;
    descricao?: string;
    startDateInicio?: string;
    startDateFim?: string;
    ativas?: boolean;
    pagina?: number;
    itensPagina?: number;
}

export interface ResponseListSuspensaoType {
    data: SuspensaoType[];
    meta: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
} 