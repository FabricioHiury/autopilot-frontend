
export interface ValidacaoEmpresaRegras {
  inscricaoMunicipalObrigatoria: boolean;
  inscricaoEstadualObrigatoria: boolean;
  observacoes?: string;
}

export interface DadosEmpresa {
  uf: string;
  portalEmpresa: string;
  atividadePrincipal: string;
}

export function validarObrigatoriedadeInscricoes(dados: DadosEmpresa): ValidacaoEmpresaRegras {
  const { uf, portalEmpresa, atividadePrincipal } = dados;

  if (portalEmpresa === '1') {
    return {
      inscricaoMunicipalObrigatoria: false,
      inscricaoEstadualObrigatoria: false,
      observacoes: 'MEI está dispensado de inscrição municipal e estadual na maioria dos casos. Consulte a prefeitura local para atividades específicas.'
    };
  }

  const regrasEspeciais = getRegrasEspeciaisPorEstado(uf);
  if (regrasEspeciais) {
    return regrasEspeciais;
  }

  return {
    inscricaoMunicipalObrigatoria: atividadePrincipal === '3',
    inscricaoEstadualObrigatoria: ['1', '2'].includes(atividadePrincipal),
  };
}

function getRegrasEspeciaisPorEstado(uf: string): ValidacaoEmpresaRegras | null {
  switch (uf) {
    case 'DF':
      return {
        inscricaoMunicipalObrigatoria: false,
        inscricaoEstadualObrigatoria: true,
        observacoes: 'No Distrito Federal não existe inscrição municipal. A inscrição estadual é obrigatória para atividades de comércio e indústria.'
      };

    case 'AC':
    case 'AP':
    case 'RR':
      return {
        inscricaoMunicipalObrigatoria: true,
        inscricaoEstadualObrigatoria: true,
        observacoes: 'Estados da região Norte podem ter particularidades. Consulte os órgãos locais.'
      };

    default:
      return null;
  }
}

export function isCampoObrigatorio(
  campo: 'inscricaoMunicipal' | 'inscricaoEstadual',
  dados: DadosEmpresa
): boolean {
  const regras = validarObrigatoriedadeInscricoes(dados);

  switch (campo) {
    case 'inscricaoMunicipal':
      return regras.inscricaoMunicipalObrigatoria;
    case 'inscricaoEstadual':
      return regras.inscricaoEstadualObrigatoria;
    default:
      return false;
  }
}

export function getMensagemValidacao(dados: DadosEmpresa): string | null {
  const regras = validarObrigatoriedadeInscricoes(dados);
  return regras.observacoes || null;
}

export const TIPOS_EMPRESA = {
  '1': 'MEI',
  '2': 'ME',
  '3': 'EPP',
  '4': 'LTDA',
  '5': 'SA'
} as const;

export const ATIVIDADES = {
  '1': 'Comércio',
  '2': 'Indústria',
  '3': 'Serviços'
} as const;