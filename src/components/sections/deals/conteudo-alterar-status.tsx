'use client';
import SelectComLabel from '@/components/commons/inputs/select-com-label';
import { DealStatus, DealStatusLabel } from '@/types/deal-status';
import {
  ComboboxSelectPerson,
  SelectPersonItemInterface,
} from '@/components/commons/inputs/combobox-select-person';
import { useState, useEffect } from 'react';
import { AppServices } from '@/services/app.services';
import { profileImageUrl } from '@/lib/profile.utils';
import { dealSchema } from '@/lib/deal-schema';
import { DealLossReason, SUBMOTIVOS_POR_MOTIVO } from '@/types/deal-loss';
import IconQuente from './icons/icon-quente';
import IconMorno from './icons/icon-morno';
import IconFrio from './icons/icon-frio';
import IconX from '@/components/icons/icon-x';
import toast from 'react-hot-toast';

export interface ConteudoAlterarStatusProps {
  deal: {
    id: string;
    temperature: 'HOT' | 'WARM' | 'COLD';
    status: DealStatus;
    novoStatus?: DealStatus;
    origin?: string;
    assignees: {
      employeeId: string;
      name: string;
      avatarUrl?: string;
      roles: string;
    }[];
  };
  onSuccess: () => void;
  onCancel: () => void;
  onErro?: () => void;
  fixedStatus?: boolean;
}

export default function ConteudoAlterarStatus({
  deal,
  onCancel,
  onSuccess,
  onErro,
  fixedStatus = false,
}: ConteudoAlterarStatusProps) {
  const [temperature, setTemperatura] = useState<'HOT' | 'WARM' | 'COLD'>(deal.temperature);
  const [status, setStatus] = useState<DealStatus>(deal.novoStatus || deal.status);
  const [assignees, setResponsaveis] = useState<SelectPersonItemInterface[]>(
    deal.assignees.map((obj) => {
      return {
        id: obj.employeeId,
        name: obj.name,
        avatar: obj.avatarUrl,
        metaData: [''],
      };
    }),
  );
  const [note, setObservacao] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [distribuicaoAutomaticaAtiva, setDistribuicaoAutomaticaAtiva] = useState<boolean>(false);
  const [loadingDistribuicao, setLoadingDistribuicao] = useState<boolean>(true);

  const [motivoPerda, setMotivoPerda] = useState<DealLossReason | ''>('');
  const [submotivoPerda, setSubmotivoPerda] = useState<string>('');
  const api = new AppServices();

  const MOTIVOS_LABEL: Record<DealLossReason, string> = {
    financialCredit: 'Financeiro / Crédito',
    proposalValuation: 'Proposta / Avaliação',
    inventoryProduct: 'Estoque / Produto',
    withoutResult: 'Sem Retorno',
    competitionOtherStore: 'Concorrência / Outra Loja',
    interestIntent: 'Interesse / Intenção',
    otherReasons: 'Outros Motivos',
  };

  const SUBMOTIVOS_LABEL: Record<string, string> = {
    financiamentoNaoAprovado: 'Financiamento não aprovado',
    scoreCreditoInsuficiente: 'Score de crédito insuficiente',
    entradaMuitoBaixa: 'Entrada muito baixa',
    valorParcelaIncompativelRenda: 'Parcela incompatível com a renda',
    clienteSemCreditoDisponivel: 'Sem crédito disponível',
    condicaoFinanciamentoNaoAceita: 'Condição de financiamento não aceita',
    clienteDesistiuAposReprovacao: 'Cliente desistiu após reprovação',
    bancoRecusouProposta: 'Banco recusou proposta',
    clienteNaoQuisInformarDadosCredito: 'Não quis informar dados de crédito',
    clienteNaoGostouAvaliacao: 'Não gostou da avaliação',
    avaliacaoAbaixoEsperado: 'Avaliação abaixo do esperado',
    lojaNaoAceitouValorTroca: 'Loja não aceitou o valor de troca',
    valorPropostaAbaixoEsperado: 'Proposta abaixo do esperado',
    divergenciaValoresNegociacao: 'Divergência de valores',
    clienteAchouPrecoAlto: 'Achou o preço alto',
    pedidoDescontoAlemPermitido: 'Pediu desconto além do permitido',
    semVeiculoInteresseEstoque: 'Sem veículo de interesse no estoque',
    modeloDesejadoNaoTrabalhadoLoja: 'Modelo não trabalhado na loja',
    corVersaoIndisponivel: 'Cor/versão indisponível',
    veiculoFoiVendidoAntesNegociacao: 'Veículo foi vendido antes',
    veiculoReservadoOutroCliente: 'Veículo reservado para outro cliente',
    veiculoAguardandoPreparacao: 'Veículo aguardando preparação',
    documentacaoPendente: 'Documentação pendente',
    veiculoTrocaNaoInteressa: 'Veículo de troca não interessa',
    clienteNaoRespondeu: 'Cliente não respondeu',
    clienteNaoRetornouAposProposta: 'Cliente não retornou após proposta',
    clienteBloqueouContato: 'Cliente bloqueou contato',
    dadosContatoIncorretos: 'Dados de contato incorretos',
    telefoneWhatsappInvalido: 'Telefone/WhatsApp inválido',
    clienteDisseRetornariaNaoRetornou: 'Disse que retornaria e não retornou',
    clienteIgnorouMensagens: 'Cliente ignorou mensagens',
    clienteSumiuAposConversaInicial: 'Cliente sumiu após conversa inicial',
    clienteNegociouOutraLoja: 'Cliente negociou em outra loja',
    clienteJaComprouOutroVeiculo: 'Cliente já comprou outro veículo',
    recebeuPropostaMelhorConcorrencia: 'Recebeu proposta melhor',
    escolheuOutroModeloMarca: 'Escolheu outro modelo/marca',
    preferiuConcessionaria: 'Preferiu concessionária',
    comprouParticular: 'Comprou particular',
    fechouOutraCidade: 'Fechou em outra cidade',
    clienteDesistiuNegociacao: 'Cliente desistiu da negociação',
    mudouIdeiaAposConversa: 'Mudou de ideia após conversa',
    clienteAdiouCompra: 'Cliente adiou a compra',
    vaiEsperarNovoModelo: 'Vai esperar novo modelo',
    vaiComprarProximoMes: 'Vai comprar no próximo mês',
    vaiManterCarroAtual: 'Vai manter o carro atual',
    timingForaMomentoCompra: 'Fora do momento de compra',
    solicitouPausaTemporaria: 'Solicitou pausa temporária',
    clienteApenasPesquisando: 'Cliente apenas pesquisando',
    clienteNaoVeioLoja: 'Cliente não veio à loja',
    moraLongeInviavelDeslocamento: 'Mora longe / inviável deslocamento',
    ficouDoenteImprevistosPessoal: 'Ficou doente / imprevisto pessoal',
    atendimentoDuplicado: 'Atendimento duplicado',
    clienteAtendidoOutroVendedor: 'Atendido por outro vendedor',
    clienteCarteiraRelacionamentoDireto: 'Carteira de relacionamento direto',
    outroMotivo: 'Outro motivo',
  };

  const mapaSub = SUBMOTIVOS_POR_MOTIVO as Record<string, string[]>;
  const submotivosDisponiveis = motivoPerda ? mapaSub[motivoPerda] || [] : [];

  const toEnumValue = (val: unknown): DealLossReason | '' => {
    if (!val) return '';
    const s = String(val);

    const exact = Object.values(DealLossReason).find((v) => v === s);
    if (exact) return exact;

    const byKey = (DealLossReason as Record<string, string>)[s];
    if (byKey) return byKey as DealLossReason;

    const byCase = Object.values(DealLossReason).find((v) => v.toLowerCase() === s.toLowerCase());
    return (byCase as DealLossReason) || '';
  };

  useEffect(() => {
    const carregarConfiguracaoDistribuicao = async () => {
      setLoadingDistribuicao(true);
      const [config, error] = await api.distributionAutomatic.getConfiguration();

      if (error) {
        console.error('Erro ao carregar configuração de distribuição:', error);
        setDistribuicaoAutomaticaAtiva(false);
      } else {
        setDistribuicaoAutomaticaAtiva(config?.distributionAutomatic || false);
      }

      setLoadingDistribuicao(false);
    };

    carregarConfiguracaoDistribuicao();
  }, []);

  const handleSubmit = async () => {
    if (loading) return;
    if (!status) return;
    if (!temperature) return;

    if (!distribuicaoAutomaticaAtiva && assignees.length < 1) {
      toast.error('Selecione ao menos um responsável');
      return;
    }

    const dadosParaValidacao = {
      title: 'Alteração de Status',
      descriptionDeal: '',
      vincularCliente: true,
      note,
      distributionAutomatic: distribuicaoAutomaticaAtiva,
      dealOrigin: deal.origin || 'other',
      temperature,
      dealMode: 'SELL' as const,
      idAssignees: distribuicaoAutomaticaAtiva ? [] : assignees.map((assignee) => assignee.id),
      customerId: deal.id,
      nomeCompleto: '',
      email: '',
      phone: '',
    };

    const form = dealSchema.safeParse(dadosParaValidacao);

    if (form.success === false) {
      toast.error(form.error.issues[0].message);
      return;
    }

    setLoading(true);

    const params = {
      id: deal.id,
      status,
      temperature,
      idAssignees: form.data.idAssignees as unknown as string[],
      note,
      lostReason: motivoPerda,
      subLostReason: submotivoPerda,
    };
    console.log('params', params);

    const [data, error] = await api.deal.updateStatus(params);

    if (error) {
      toast.error(error.message);
      onErro && onErro();
      console.error(error);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
  };

  const handleSearchResponsaveis = async (search: string) => {
    const [data, error] = await api.employee.list({ search: search });
    if (error) {
      toast.error(error.message);
      console.error(error);
      return [];
    }
    const assignees = data?.employees || [];
    return assignees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      avatar: profileImageUrl(employee.userId),
    }));
  };

  return (
    <div className="text-[hsl(var(--secondary))] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Alterar status do atendimento</h2>
        <button onClick={() => onCancel()}>
          <IconX />
        </button>
      </div>

      <SelectComLabel
        label="Novo status"
        onChange={(value) => !fixedStatus && setStatus(value as DealStatus)}
        placeholder="Selecione o status"
        disabled={fixedStatus}
        value={status}
        options={Object.keys(DealStatus).map((key) => {
          const statusKey = key as keyof typeof DealStatus;
          return {
            label: DealStatusLabel[statusKey],
            value: DealStatus[statusKey],
          };
        })}
      />

      {status === DealStatus.LOST && (
        <div className="flex flex-col gap-4">
          <SelectComLabel
            label="Motivo da perda"
            value={motivoPerda}
            placeholder="Selecione o motivo principal"
            onChange={(val) => {
              const normalizado = toEnumValue(val);
              setMotivoPerda(normalizado);
              setSubmotivoPerda('');
            }}
            options={Object.values(DealLossReason).map((motivoValue) => ({
              label: MOTIVOS_LABEL[motivoValue],
              value: motivoValue,
            }))}
          />

          {submotivosDisponiveis.length > 0 && (
            <SelectComLabel
              label="Submotivo da perda"
              value={submotivoPerda}
              placeholder="Selecione o submotivo"
              onChange={(val) => setSubmotivoPerda(String(val))}
              options={submotivosDisponiveis.map((sub) => ({
                label: SUBMOTIVOS_LABEL[sub],
                value: sub,
              }))}
            />
          )}
        </div>
      )}

      <div>
        <label className="font-semibold text-xs">
          Adicione uma observação
          {status === DealStatus.LOST && <span className="text-red-600 ml-1">*</span>}
        </label>
        <textarea
          className={
            'resize-none w-full h-fit p-4 text-sm rounded-md bg-white border focus:ring-transparent focus:ring-1 focus:outline-none border-[#DDE6F2] focus:border-[hsl(var(--primary))]'
          }
          placeholder={
            status === DealStatus.LOST
              ? 'Observação obrigatória para atendimentos perdidos'
              : 'Adicione um comentário'
          }
          value={note}
          onChange={(e) => setObservacao(e.target.value)}
        ></textarea>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Selecione o grau de interesse</h2>
        <div className="flex items-center gap-2 pb-2">
          <TemperaturaOption
            onClick={() => setTemperatura('HOT')}
            label="HOT"
            icon={<IconQuente />}
            active={temperature === 'HOT'}
          />
          <TemperaturaOption
            onClick={() => setTemperatura('WARM')}
            label="WARM"
            icon={<IconMorno />}
            active={temperature === 'WARM'}
          />
          <TemperaturaOption
            onClick={() => setTemperatura('COLD')}
            label="COLD"
            icon={<IconFrio />}
            active={temperature === 'COLD'}
          />
        </div>
      </div>

      {/* Renderização condicional da seção de responsáveis */}
      {!distribuicaoAutomaticaAtiva && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-sm">Atribuir responsável pelo atendimento</h3>
          <ComboboxSelectPerson
            placeholder="Digite o nome do responsável"
            onValueChange={(value) => setResponsaveis(value)}
            onSearch={handleSearchResponsaveis}
            value={assignees}
          />
        </div>
      )}

      {/* Mensagem informativa quando distribuição automática está ativa */}
      {distribuicaoAutomaticaAtiva && (
        <div className="flex flex-col gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="font-semibold text-sm text-blue-800">Distribuição Automática Ativa</h3>
          </div>
          <p className="text-sm text-blue-700">
            Os responsáveis serão atribuídos automaticamente pelo sistema.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pb-4">
        <button
          onClick={() => onCancel && onCancel()}
          disabled={loading}
          className="flex justify-center items-center gap-1 w-full h-10 rounded-md bg-white border border-[hsl(var(--secondary))] text-[hsl(var(--secondary))] font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80"
        >
          Cancelar
        </button>

        <button
          className="bg-[hsl(var(--secondary))] text-secondary-foreground w-full p-2.5 rounded-[0.5rem] font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80"
          onClick={handleSubmit}
          disabled={loading || (status === DealStatus.LOST && !note)}
        >
          {!loading ? 'Salvar e alterar' : <span className="animate-pulse">Processando...</span>}
        </button>
      </div>
    </div>
  );
}

function TemperaturaOption({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#F2F4F7] text-sm flex gap-1.5 p-2 w-28 rounded-[0.5rem] items-center justify-start data-[active=true]:text-white data-[active=true]:bg-[hsl(var(--secondary))]"
      data-active={active}
      disabled={active}
    >
      <div className="bg-[#DDE6F2] rounded-full h-5 w-5 flex items-center justify-center">
        {icon}
      </div>
      <span className="leading-none">{label}</span>
    </button>
  );
}
