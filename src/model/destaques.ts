export type Destaque = {
    idLoja: string;
    nome: string;
    novosVendedores: number;
    novosAtendimentos: {
        quantidade: number;
        percentual: number;
        sucesso: {
            quantidade: number;
            percentual: number;
        };
    };
    vendedorDestaque: {
        id: string;
        idFoto: string;
        nome: string;
        quantidadeVendas: number;
        percentualVendasAcimaMedia: number;
    };
    atendimentosEmAberto: {
        quantidade: number;
        percentual: number;
    };
    vendasRealizadas: {
        quantidade: number;
        percentual: number;
    };
    chatsSemResposta: {
        percentual: number;
        quantidade: number;
    };
    tarefasPendentes: {
        quantidade: number;
        percentual: number;
    };
};
