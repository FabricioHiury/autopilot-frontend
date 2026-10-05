'use client';
import { dossierDescription } from '@/lib/copilot-review';
import { useState, useEffect, useRef } from 'react';
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
  if (loading)
    return <div className="text-xs p-2 text-muted-foreground">Carregando AutoPilot IA…</div>;
  if (error)
    return (
      <div className="text-xs p-2 text-muted-foreground">
        AutoPilot IA: {error}
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
    );
  if (!analysis?.enabled)
    return (
      <div className="text-xs p-2 text-muted-foreground">
        AutoPilot IA ainda não está habilitado para este ambiente.
      </div>
    );
  const dossier = analysis.insight?.leadDossier;
  return (
    <section className="border border-primary/20 bg-white rounded-xl p-3 mb-3">
      <div className="flex items-center justify-between">
        <strong className="text-primary">AutoPilot IA</strong>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={refresh}
          disabled={queued && !!socket?.connected}
        >
          {queued ? 'Análise solicitada…' : 'Atualizar análise'}
        </Button>
      </div>
      {dossier ? (
        <>
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            className="mt-2 cursor-pointer text-sm font-semibold text-left"
          >
            Dossiê estratégico ·{' '}
            {
              { HOT: 'Quente', WARM: 'Morno', COLD: 'Frio', UNKNOWN: 'Não identificado' }[
                dossier.perceivedTemperature
              ]
            }
          </button>
          {expanded && (
            <aside
              aria-label="Dossiê estratégico"
              className="bg-white border rounded-xl shadow-lg p-4 mt-3 sm:fixed sm:top-24 sm:right-6 sm:bottom-28 sm:w-[380px] overflow-y-auto z-[110]"
            >
              <div className="flex justify-between items-center">
                <strong>Dossiê estratégico</strong>
                <button type="button" aria-label="Fechar dossiê" onClick={() => setExpanded(false)}>
                  ✕
                </button>
              </div>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm py-3">
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
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd>{value || 'Não identificado'}</dd>
                  </div>
                ))}
              </dl>
              {dealId && canApply && (
                <Button type="button" size="sm" onClick={prepare} disabled={saving}>
                  Revisar e aplicar ao Deal
                </Button>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Revise os dados antes de salvar na descrição da negociação.
              </p>
            </aside>
          )}
          <CopilotQuickReplies
            replies={analysis.insight?.quickReplies || []}
            disabled={replyDisabled}
            onSelect={onReply}
          />
        </>
      ) : (
        <p className="text-sm mt-2">Ainda não há análise para esta conversa.</p>
      )}
      {analysis.analyzedAt && (
        <p className="text-xs text-muted-foreground">
          Analisado em {new Date(analysis.analyzedAt).toLocaleString('pt-BR')}
        </p>
      )}
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
