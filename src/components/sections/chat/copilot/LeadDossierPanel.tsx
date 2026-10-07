'use client';
import { dossierDescription } from '@/lib/copilot-review';
import { useState, useEffect, useRef, useId } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useAppAuth } from '@/contexts/auth-app-context';
import { useChatSocket } from '@/contexts/RealtimeContext';
import { copilotService } from '@/services/copilot.service';
import type { CopilotAnalysis } from '@/types/copilot';
import type { AnalysisEvent } from '@/services/socket.client';
import { StorePermission } from '@/types/permissions';
import { CopilotQuickReplies } from './CopilotQuickReplies';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
export function LeadDossierPanel({
  chatId,
  dealId,
  onReply,
  replyDisabled = false,
}: {
  chatId: string;
  dealId?: string | null;
  onReply: (text: string) => void;
  replyDisabled?: boolean;
}) {
  const socket = useChatSocket(),
    auth = useAppAuth(),
    storeId = auth.getUser()?.storeId;
  const currentContext = useRef('');
  currentContext.current = `${chatId}:${dealId}`;
  const contentId = useId();
  const [panelOpen, setPanelOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analysis, setAnalysis] = useState<CopilotAnalysis | null>(null),
    [error, setError] = useState<string | null>(null),
    [loading, setLoading] = useState(true),
    [queued, setQueued] = useState(false);
  const [review, setReview] = useState<{
      description: string;
      temperature: string;
      originalDescription: string;
      originalTemperature: string;
    } | null>(null),
    [saving, setSaving] = useState(false),
    [canApply, setCanApply] = useState(false);
  useEffect(() => {
    let active = true;
    setReview(null);
    setExpanded(false);
    setPanelOpen(false);
    setError(null);
    setAnalysis(null);
    setQueued(false);
    setLoading(true);
    const load = () =>
      copilotService
        .getAnalysis(chatId)
        .then((data) => {
          if (active) {
            setAnalysis(data);
            setQueued(false);
            setError(null);
          }
        })
        .catch((err) => {
          if (active) setError(err.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    void load();
    const ready = (event: AnalysisEvent) => {
      if (event.storeId === storeId && event.chatId === chatId) {
        setAnalysis({ enabled: true, insight: event.insight, analyzedAt: event.analyzedAt });
        setQueued(false);
        setError(null);
      }
    };
    socket?.on('autopilot:analysis-ready', ready);
    socket?.on('connect', load);
    return () => {
      active = false;
      socket?.off('autopilot:analysis-ready', ready);
      socket?.off('connect', load);
    };
  }, [chatId, storeId, socket]);
  useEffect(() => {
    let active = true;
    void auth.fetchPermissions().then((data) => {
      if (active) setCanApply(!!data?.permissions.includes(StorePermission.STORE_EDIT_DELETE_DEAL));
    });
    return () => {
      active = false;
    };
  }, [auth]);
  useEffect(() => {
    if (!queued) return;
    const timer = setTimeout(() => setQueued(false), 60000);
    return () => clearTimeout(timer);
  }, [queued]);
  async function refresh() {
    try {
      await copilotService.refreshAnalysis(chatId);
      setQueued(true);
      toast.success('Reanálise solicitada.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível solicitar análise.');
    }
  }
  async function prepare() {
    if (!dealId || !analysis?.insight) return;
    const context = currentContext.current;
    setSaving(true);
    try {
      const current = await copilotService.getDeal(dealId);
      if (currentContext.current !== context) return;
      const dossier = analysis.insight.leadDossier;
      const existing = current.descriptionDeal || '';
      const description = dossierDescription(existing, dossier);
      setReview({
        description,
        temperature:
          dossier.perceivedTemperature === 'UNKNOWN'
            ? current.temperature || 'COLD'
            : dossier.perceivedTemperature,
        originalDescription: existing,
        originalTemperature: current.temperature || 'COLD',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível carregar a negociação.');
    } finally {
      setSaving(false);
    }
  }
  async function apply() {
    if (!dealId || !review) return;
    setSaving(true);
    try {
      const current = await copilotService.getDeal(dealId);
      if (
        (current.descriptionDeal || '') !== review.originalDescription ||
        (current.temperature || 'COLD') !== review.originalTemperature
      )
        throw new Error(
          'A negociação foi alterada por outra pessoa. Feche a revisão e tente novamente.',
        );
      await copilotService.applyToDeal(
        dealId,
        review.description,
        review.temperature as 'HOT' | 'WARM' | 'COLD',
      );
      setReview(null);
      window.dispatchEvent(new Event('autopilot:deals-changed'));
      toast.success('Dados revisados aplicados à negociação.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível aplicar os dados.');
    } finally {
      setSaving(false);
    }
  }
  const dossier = analysis?.insight?.leadDossier;
  const replies = analysis?.insight?.quickReplies || [];
  const status = loading
    ? 'Carregando…'
    : error
      ? 'Indisponível'
      : !analysis?.enabled
        ? 'Não habilitada'
        : queued
          ? 'Analisando…'
          : replies.length
            ? `${replies.length} ${replies.length === 1 ? 'sugestão' : 'sugestões'}`
            : 'Sem análise';
  return (
    <section
      aria-label="AutoPilot IA"
      className="mb-3 overflow-hidden rounded-xl border border-primary/15 bg-white"
    >
      <button
        type="button"
        aria-label={panelOpen ? 'Recolher sugestões da IA' : 'Abrir sugestões da IA'}
        aria-expanded={panelOpen}
        aria-controls={contentId}
        onClick={() => setPanelOpen(!panelOpen)}
        className="flex min-h-11 w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-sm font-semibold text-secondary">AutoPilot IA</span>
        <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
          {status}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${panelOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={contentId}
        hidden={!panelOpen}
        className="max-h-[35vh] overflow-y-auto border-t border-primary/10 px-3 pb-3 pt-2 sm:max-h-72"
      >
        {loading ? (
          <p className="py-2 text-sm text-muted-foreground">Carregando análise da conversa…</p>
        ) : error ? (
          <div className="space-y-2 py-2">
            <p role="alert" className="text-sm text-muted-foreground">
              {error}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                setLoading(true);
                try {
                  setAnalysis(await copilotService.getAnalysis(chatId));
                  setError(null);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Erro ao carregar análise.');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Tentar novamente
            </Button>
          </div>
        ) : !analysis?.enabled ? (
          <p className="py-2 text-sm text-muted-foreground">
            AutoPilot IA ainda não está habilitada para este ambiente.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 py-1">
              <p className="text-xs text-muted-foreground">
                Selecione uma resposta para revisar antes de enviar.
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={refresh}
                disabled={queued && !!socket?.connected}
              >
                {queued ? 'Análise solicitada…' : 'Atualizar análise'}
              </Button>
            </div>
            {dossier ? (
              <>
                <CopilotQuickReplies
                  replies={replies}
                  disabled={replyDisabled}
                  onSelect={(text) => {
                    setPanelOpen(false);
                    onReply(text);
                  }}
                />
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`${contentId}-dossier`}
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 flex w-full items-center gap-2 rounded-md py-2 text-left text-xs font-medium text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Dossiê estratégico
                  <span className="ml-auto text-muted-foreground">
                    {
                      { HOT: 'Quente', WARM: 'Morno', COLD: 'Frio', UNKNOWN: 'Não identificado' }[
                        dossier.perceivedTemperature
                      ]
                    }
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
                  />
                </button>
                {expanded && (
                  <aside
                    id={`${contentId}-dossier`}
                    aria-label="Dossiê estratégico"
                    className="mt-1 border-t border-primary/10 pt-3"
                  >
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      {[
                        ['Veículo de interesse', dossier.vehicleOfInterest],
                        [
                          'Veículo de troca',
                          dossier.hasTradeIn === false ? 'Sem troca' : dossier.tradeInVehicle,
                        ],
                        ['Pagamento', dossier.paymentMethod],
                        ['Principal objeção', dossier.mainObjection],
                        ['Próxima ação', analysis.insight?.nextBestAction],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0 break-words">
                          <dt className="text-xs text-muted-foreground">{label}</dt>
                          <dd className="mt-1 text-secondary">{value || 'Não identificado'}</dd>
                        </div>
                      ))}
                    </dl>
                    {dealId && canApply && (
                      <Button
                        type="button"
                        size="sm"
                        className="mt-3"
                        onClick={prepare}
                        disabled={saving}
                      >
                        Revisar e aplicar ao Atendimento
                      </Button>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Revise os dados antes de salvar na descrição da negociação.
                    </p>
                  </aside>
                )}
              </>
            ) : (
              <p className="py-2 text-sm text-muted-foreground">
                Ainda não há análise para esta conversa.
              </p>
            )}
            {analysis.analyzedAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                Analisado em {new Date(analysis.analyzedAt).toLocaleString('pt-BR')}
              </p>
            )}
          </>
        )}
      </div>
      {review && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Revisar dados da IA"
          className="fixed inset-0 z-[200] bg-black/50 grid place-items-center p-4"
        >
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <h2 className="text-lg font-bold mb-3">Revise os dados da negociação</h2>
            <textarea
              aria-label="Descrição revisada"
              rows={12}
              value={review.description}
              onChange={(e) => setReview({ ...review, description: e.target.value })}
              className="w-full border p-3 rounded-lg"
            />
            <label>
              Temperatura
              <select
                value={review.temperature}
                onChange={(e) => setReview({ ...review, temperature: e.target.value })}
                className="border p-2 m-2 rounded"
              >
                <option value="HOT">Quente</option>
                <option value="WARM">Morno</option>
                <option value="COLD">Frio</option>
              </select>
            </label>
            <div className="flex gap-3 mt-4">
              <Button onClick={apply} disabled={saving}>
                Confirmar atualização
              </Button>
              <Button variant="outline" onClick={() => setReview(null)} disabled={saving}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
