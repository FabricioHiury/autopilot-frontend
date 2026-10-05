export interface ValidacaoEmpresaRegras {
  inscricaoMunicipalObrigatoria: boolean;
  inscricaoEstadualObrigatoria: boolean;
  notes?: string;
}

export interface DadosEmpresa {
  state: string;
  portalCompany: string;
  activityPrimary: string;
}

export function validarObrigatoriedadeInscricoes(data: DadosEmpresa): ValidacaoEmpresaRegras {
  const { state, portalCompany, activityPrimary } = data;

  if (portalCompany === '1') {
    return {
      inscricaoMunicipalObrigatoria: false,
      inscricaoEstadualObrigatoria: false,
      notes:
        'MEI está dispensado de inscrição municipal e estadual na maioria dos casos. Consulte a prefeitura local para atividades específicas.',
    };
  }

  const regrasEspeciais = getRegrasEspeciaisPorEstado(state);
  if (regrasEspeciais) {
    return regrasEspeciais;
  }

  return {
    inscricaoMunicipalObrigatoria: activityPrimary === '3',
    inscricaoEstadualObrigatoria: ['1', '2'].includes(activityPrimary),
  };
}

function getRegrasEspeciaisPorEstado(state: string): ValidacaoEmpresaRegras | null {
  switch (state) {
    case 'DF':
      return {
        inscricaoMunicipalObrigatoria: false,
        inscricaoEstadualObrigatoria: true,
        notes:
          'No Distrito Federal não existe inscrição municipal. A inscrição estadual é obrigatória para atividades de comércio e indústria.',
      };

    case 'AC':
    case 'AP':
    case 'RR':
      return {
        inscricaoMunicipalObrigatoria: true,
        inscricaoEstadualObrigatoria: true,
        notes: 'Estados da região Norte podem ter particularidades. Consulte os órgãos locais.',
      };

    default:
      return null;
  }
}

export function isCampoObrigatorio(
  campo: 'registrationMunicipal' | 'registrationState',
  data: DadosEmpresa,
): boolean {
  const regras = validarObrigatoriedadeInscricoes(data);

  switch (campo) {
    case 'registrationMunicipal':
      return regras.inscricaoMunicipalObrigatoria;
    case 'registrationState':
      return regras.inscricaoEstadualObrigatoria;
    default:
      return false;
  }
}

export function getMensagemValidacao(data: DadosEmpresa): string | null {
  const regras = validarObrigatoriedadeInscricoes(data);
  return regras.notes || null;
}

export const TIPOS_EMPRESA = {
  '1': 'MEI',
  '2': 'ME',
  '3': 'EPP',
  '4': 'LTDA',
  '5': 'SA',
} as const;

export const ATIVIDADES = {
  '1': 'Comércio',
  '2': 'Indústria',
  '3': 'Serviços',
} as const;
