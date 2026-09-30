export interface Colaborador {
    pesquisa: string,
    pagina: number,
    quantidade: number,
    totalPaginas: number,
    totalColaboradores: number,
    colaboradores: Array<{
        id: string,
        idLoja: string,
        cargos: Array<{
            id: string,
            idLoja: string,
            cargo: string,
            funcionalidades: string,
        }>
        idUsuario: string,
        nome: string,
        documentoFiscal: string,
        whatsapp: string,
        telefoneComplementar: string,
        status: string,
        observacoes: string,
        criadoEm: string,
        atualizadoEm: string,
        email: string,
    }>
}