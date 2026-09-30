export enum PERMISSOES_LOJA {
    lojaVerDashboard = "Visualizar Dashboard",
    lojaVerAtendimentos = "Visualizar Atendimentos",
    lojaEditarExcluirAtendimento = "Editar/Excluir Atendimento",
    lojaVincularAtendimentoUsuario = "Vincular Atendimento a Usuário",
    lojaTransferirAtendimento = "Transferir Atendimento",
    lojaVerChat = "Visualizar Chat",
    lojaResponderChat = "Responder Chat",
    lojaCadastrarEditarClientes = "Cadastrar/Editar Clientes",
    lojaPesquisarClientes = "Pesquisar Clientes",
    lojaGerenciarUsuarios = "Gerenciar Usuários",
    lojaConfigurarIntegracoes = "Configurar Integrações",
    lojaEditarDadosDaLoja = "Editar Dados da Loja",
    lojaGerenciarSuspensoes = "Gerenciar Suspensões de Atendimento",
    lojaGerenciarCargos = "Gerenciar Cargos",
    lojaVerTodosAtendimentos = "Visualizar Todos os Atendimentos",
    lojaCriarAtendimentoManual = "Criar Atendimento Manual",
    lojaReatribuirAtendimentos = "Reatribuir Atendimentos",
    lojaGerenciarEquipe = "Gerenciar Equipe",
    lojaVerAtendimentosProprios = "Visualizar Atendimentos Próprios",
    lojaCriarAtendimentoProprio = "Criar Atendimento Próprio",
    lojaGerenciarTarefasProprias = "Gerenciar Tarefas Próprias",
    lojaPreVendedorFinalizarAtendimento = "Pré-vendedor Finalizar Atendimento",
    lojaVerMensagensPadrao = "Visualizar Mensagens Padrão",
    lojaCriarMensagemPadrao = "Criar Mensagem Padrão",
    lojaEditarMensagemPadrao = "Editar Mensagem Padrão",
    lojaDeletarMensagemPadrao = "Deletar Mensagem Padrão",
}

export enum KEY_PERMISSOES_LOJA {
    lojaVerDashboard = "lojaVerDashboard",
    lojaVerAtendimentos = "lojaVerAtendimentos",
    lojaEditarExcluirAtendimento = "lojaEditarExcluirAtendimento",
    lojaVincularAtendimentoUsuario = "lojaVincularAtendimentoUsuario",
    lojaTransferirAtendimento = "lojaTransferirAtendimento",
    lojaVerChat = "lojaVerChat",
    lojaResponderChat = "lojaResponderChat",
    lojaCadastrarEditarClientes = "lojaCadastrarEditarClientes",
    lojaPesquisarClientes = "lojaPesquisarClientes",
    lojaGerenciarUsuarios = "lojaGerenciarUsuarios",
    lojaConfigurarIntegracoes = "lojaConfigurarIntegracoes",
    lojaEditarDadosDaLoja = "lojaEditarDadosDaLoja",
    lojaGerenciarSuspensoes = "lojaGerenciarSuspensoes",
}

export enum KEY_PERMISSOES_AUTOPILOT {
    AUTOPILOT_VER_DASHBOARD = "autopilotVerDashboard",
    AUTOPILOT_RESPONDER_TICKETS = "autopilotResponderTickets",
    AUTOPILOT_VER_TICKETS = "autopilotVerTickets",
    AUTOPILOT_BLOQUEAR_ASSINANTE = "autopilotBloquearAssinante",
    AUTOPILOT_VER_ASSINANTES = "autopilotVerAssinantes",
    AUTOPILOT_EDITAR_ASSINANTES_ADICIONAR = "autopilotEditarAssinantesAdicionar",
    AUTOPILOT_ALTERAR_PAINEL_REVENDA = "autopilotAlterarPainelRevenda",
    AUTOPILOT_ATUALIZAR_PERMISSOES = "autopilotAtualizarPermissoes",
    AUTOPILOT_CRIAR_USUARIO_ADMIN = "autopilotCriarUsuarioAdmin",
    AUTOPILOT_VER_USUARIOS_ADMIN = "autopilotVerUsuariosAdmin",
}


export const PERMISSOES_TODAS = {
    ...PERMISSOES_LOJA,
    ...KEY_PERMISSOES_AUTOPILOT,
};
