'use client';
import CardStatus from '@/components/cards/CardStatus';
import AvatarCanal from '@/components/commons/avatar-canal';
import { ModalNotificacoes } from '@/components/commons/modais/modal-notificacoes';
import { PageTitle } from '@/components/commons/page-title';
import { IconEdit } from '@/components/icons/icon-edit';
import api from '@/utils/classes/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/commons/modais/confirm-dialog';

type CanalStatus = {
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'olx' | 'other';
  status: string;
  message: string;
  lastSync?: string;
  receivedDeals?: number;
  configured?: boolean;
  error?: string;
};

function formatLastSync(dateString?: string): string {
  if (!dateString) return 'Nunca sincronizado';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'Agora mesmo';
    }
  } catch {
    return 'Data inválida';
  }
}

function formatAtendimentos(count?: number): string {
  if (count === undefined || count === null) return 'N/A';
  if (count === 0) return 'Nenhum';
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function formatMessage(message?: string | null, fallback: string = 'Não Definido'): string {
  if (!message || message.trim() === '') {
    return fallback;
  }

  const nullRegex = /\bnull\b/i;
  if (nullRegex.test(message)) {
    return fallback;
  }

  return message;
}

async function syncIntegration(channel: string, onUpdate: (integration: CanalStatus) => void) {
  try {
    toast.loading(`Sincronizando ${channel}...`, { id: channel });

    const [statusResponse, statusError] = await api.get(`/integrations/status`);
    if (statusError) {
      throw new Error(statusError.message);
    }

    const updatedIntegration = statusResponse.data.statusIntegrations.find(
      (item: CanalStatus) => item.channel === channel,
    );

    if (updatedIntegration) {
      onUpdate(updatedIntegration);
      toast.success(`${channel} sincronizado com sucesso!`, { id: channel });
    } else {
      toast.error(`Erro ao encontrar dados de ${channel}`, { id: channel });
    }
  } catch (error: any) {
    toast.error(error.message || `Erro ao sincronizar ${channel}`, { id: channel });
  }
}

async function clearIntegrationCache(channel: string): Promise<boolean> {
  try {
    toast.loading(`Limpando cache de ${channel}...`, { id: `cache-${channel}` });

    const [response, error] = await api.post(`/integrations/clear-cache/${channel}`);
    if (error) {
      throw new Error(error.message);
    }

    toast.success(`Cache de ${channel} limpo com sucesso!`, { id: `cache-${channel}` });
    return true;
  } catch (error: any) {
    toast.error(error.message || `Erro ao limpar cache de ${channel}`, { id: `cache-${channel}` });
    return false;
  }
}

async function clearAllIntegrationCache(): Promise<boolean> {
  try {
    toast.loading('Limpando todo cache de integrações...', { id: 'clear-all' });

    const [response, error] = await api.post(`/integrations/clear-all-cache`);
    if (error) {
      throw new Error(error.message);
    }

    toast.success('Cache de todas integrações limpo!', { id: 'clear-all' });
    return true;
  } catch (error: any) {
    toast.error(error.message || 'Erro ao limpar cache', { id: 'clear-all' });
    return false;
  }
}

async function checkIntegrationHealth(channel: string): Promise<any> {
  try {
    toast.loading(`Verificando saúde de ${channel}...`, { id: `health-${channel}` });

    const [response, error] = await api.get(`/integrations/health/${channel}`);
    if (error) {
      throw new Error(error.message);
    }

    const { data } = response.data;
    if (data && data.status === 'ok') {
      toast.success(`${channel} está funcionando corretamente!`, { id: `health-${channel}` });
    } else {
      const message = data?.message || 'Status desconhecido';
      toast.error(`${channel}: ${message}`, { id: `health-${channel}`, duration: 6000 });
    }

    return data;
  } catch (error: any) {
    toast.error(error.message || `Erro ao verificar ${channel}`, { id: `health-${channel}` });
    return null;
  }
}

async function forceRefreshIntegration(channel: string): Promise<any> {
  try {
    toast.loading(`Atualizando ${channel}...`, { id: `refresh-${channel}` });

    const [response, error] = await api.post(`/integrations/refresh/${channel}`);
    if (error) {
      throw new Error(error.message);
    }

    toast.success(`${channel} atualizado com sucesso!`, { id: `refresh-${channel}` });
    return response.data;
  } catch (error: any) {
    toast.error(error.message || `Erro ao atualizar ${channel}`, { id: `refresh-${channel}` });
    return null;
  }
}

async function forceRemoveIntegration(channel: string): Promise<boolean> {
  try {
    toast.loading(`Removendo ${channel}...`, { id: `remove-${channel}` });

    const [response, error] = await api.delete(`/integrations/${channel}/remove-with-cache`);
    if (error) {
      throw new Error(error.message);
    }
    toast.success(`${channel} removido com sucesso!`, { id: `remove-${channel}` });
    return true;
  } catch (error: any) {
    toast.error(error.message || `Erro ao remover ${channel}`, { id: `remove-${channel}` });
    return false;
  }
}

export default function IntegracoesPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [listIntegrations, setListIntegrations] = useState<CanalStatus[]>([]);

  async function loadIntegrations(forceClearCache = false) {
    try {
      if (forceClearCache) {
        const success = await clearAllIntegrationCache();
        if (!success) {
          toast.error('Falha ao limpar cache, mas continuando...');
        }
      }

      const [response, error] = await api.get(`/integrations/status`);
      if (error) {
        if (!forceClearCache) {
          toast.error('Erro ao carregar integrações. Tentando limpar cache...');
          setLoading(false);
          return loadIntegrations(true);
        }
        return toast.error(error.message);
      }

      setLoading(false);

      const enrichedData = response.data.statusIntegrations.map((integration: CanalStatus) => ({
        ...integration,
        lastSync: integration.lastSync,
        receivedDeals: integration.receivedDeals ?? 0,
        configured:
          integration.configured ??
          (integration.status !== 'erro' && integration.status !== 'nao_configurado'),
      }));

      setListIntegrations(enrichedData);
    } catch (error: any) {
      setLoading(false);
      toast.error('Erro inesperado ao carregar integrações');
    }
  }

  useEffect(() => {
    loadIntegrations();
  }, []);

  return (
    <main className="grid grid-rows-[auto_1fr_auto] min-h-full h-full">
      <div className="w-full p-4 flex flex-col gap-2 lg:gap-8 md:px-10 md:pt-10 bg-white top-0 z-10">
        <div className="flex lg:flex-row flex-col items-center gap-6 w-full justify-between">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center gap-4">
              <PageTitle title="Integrações" />
              <span className="text-sm text-[#657380] bg-[#F2F4F7] px-2 py-1 rounded-md">
                {listIntegrations.length} integraç{listIntegrations.length !== 1 ? 'ões' : 'ão'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setLoading(true);
                  loadIntegrations();
                }}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#24292E] bg-[#F2F4F7] hover:bg-[#E5E8EB] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              >
                <svg
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Atualizar
              </button>

              <button
                onClick={async () => {
                  setLoading(true);
                  await loadIntegrations(true);
                }}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Limpar Cache
              </button>

              <ModalNotificacoes />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 lg:p-12 h-full w-full">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : listIntegrations.length === 0 ? (
          <div className="col-span-full">
            <EmptyState />
          </div>
        ) : (
          listIntegrations.map((integration, i) => {
            return (
              <CardIntegration
                integration={integration}
                key={i}
                onUpdate={(updatedIntegration) => {
                  setListIntegrations((prev) =>
                    prev.map((item) =>
                      item.channel === updatedIntegration.channel ? updatedIntegration : item,
                    ),
                  );
                }}
              />
            );
          })
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-24 h-24 bg-[#F2F4F7] rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-[#657380]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#24292E] mb-2">Nenhuma integração encontrada</h3>
      <p className="text-[#657380] mb-6 max-w-md">
        Configure suas integrações com redes sociais e plataformas para começar a receber
        atendimentos automaticamente.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-[hsl(var(--secondary))] text-secondary-foreground rounded-lg hover:bg-[hsl(var(--secondary))]/90 transition-colors duration-200"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border shadow-sm w-full overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex flex-col">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-8 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

function CardIntegration({
  integration,
  onUpdate,
}: {
  integration: CanalStatus;
  onUpdate: (updatedIntegration: CanalStatus) => void;
}) {
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const isActive =
    integration.status !== 'erro' &&
    integration.status !== 'inactive' &&
    integration.status !== 'nao_configurado';
  const isConfigured = integration.configured !== false;
  const hasError = integration.status === 'erro' || !!integration.error;

  const getStatusInfo = () => {
    if (hasError) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        message: formatMessage(integration.error || integration.message, 'Erro na integração'),
      };
    }
    if (!isConfigured) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        message: 'Integração não configurada',
      };
    }
    if (isActive) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        message: formatMessage(integration.message, 'Funcionando corretamente'),
      };
    }
    return {
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      message: formatMessage(integration.message, 'Status desconhecido'),
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 w-full overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AvatarCanal
              size={2.5}
              padrao={2}
              channel={integration.channel}
              isActive={isActive}
              showTooltip={false}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-[#24292E] capitalize">
                  {integration.channel}
                </h3>
                <CardStatus status={isActive} />
              </div>
              <span className="text-xs text-[#657380] font-medium">
                {isConfigured ? 'Configurado' : 'Não configurado'}
              </span>
            </div>
          </div>
          <Link
            href={'/app/settings/integrations/connect/' + integration.channel}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-[#F2F4F7] transition-colors duration-200"
          >
            <IconEdit fill="hover:fill-[#24292E] duration-300 ease-in-out fill-[#657380]" />
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className={`p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <p className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.message}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F8F9FA] rounded-lg p-3">
            <div className="text-xs text-[#657380] font-medium mb-1">Atendimentos</div>
            <div className="text-lg font-semibold text-[#24292E]">
              {formatAtendimentos(integration.receivedDeals)}
            </div>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg p-3">
            <div className="text-xs text-[#657380] font-medium mb-1">Última Sync</div>
            <div className="text-sm font-medium text-[#24292E]">
              {formatLastSync(integration.lastSync)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex gap-2">
            <Link
              href={`/app/settings/integrations/connect/${integration.channel}`}
              className="flex-1 text-center px-3 py-2 text-sm font-medium text-[#24292E] bg-[#F2F4F7] hover:bg-[#E5E8EB] rounded-lg transition-colors duration-200"
            >
              Configurar
            </Link>

            {isActive && (
              <button
                onClick={() => {
                  syncIntegration(integration.channel, onUpdate);
                }}
                className="flex-1 text-center px-3 py-2 text-sm font-medium text-secondary-foreground bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/90 rounded-lg transition-colors duration-200"
              >
                Sincronizar
              </button>
            )}
          </div>

          {hasError && (
            <div className="border-t border-gray-100 pt-3 mt-3">
              <div className="text-xs text-[#657380] font-medium mb-2 uppercase tracking-wide">
                Ferramentas de Diagnóstico
              </div>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={async () => {
                    const result = await checkIntegrationHealth(integration.channel);
                    if (result) {
                      syncIntegration(integration.channel, onUpdate);
                    }
                  }}
                  className="flex-1 text-center px-3 py-2 text-xs font-medium text-[#24292E] bg-[#F8F9FA] hover:bg-[#E5E8EB] border border-[#E1E4E8] rounded-md transition-colors duration-200"
                >
                  Diagnóstico
                </button>

                <button
                  onClick={async () => {
                    const success = await clearIntegrationCache(integration.channel);
                    if (success) {
                      setTimeout(() => {
                        syncIntegration(integration.channel, onUpdate);
                      }, 500);
                    }
                  }}
                  className="flex-1 text-center px-3 py-2 text-xs font-medium text-[#24292E] bg-[#F8F9FA] hover:bg-[#E5E8EB] border border-[#E1E4E8] rounded-md transition-colors duration-200"
                >
                  Limpar Cache
                </button>

                <button
                  onClick={async () => {
                    const result = await forceRefreshIntegration(integration.channel);
                    if (result) {
                      setTimeout(() => {
                        syncIntegration(integration.channel, onUpdate);
                      }, 1000);
                    }
                  }}
                  className="flex-1 text-center px-3 py-2 text-xs font-medium text-[#24292E] bg-[#F8F9FA] hover:bg-[#E5E8EB] border border-[#E1E4E8] rounded-md transition-colors duration-200"
                >
                  Atualizar
                </button>
              </div>

              <button
                onClick={() => {
                  setConfirmDialog({
                    message: `Deseja remover a integração ${integration.channel}?\n\nIsso irá limpar todos os caches relacionados.`,
                    onConfirm: async () => {
                      const success = await forceRemoveIntegration(integration.channel);
                      if (success) {
                        onUpdate({
                          ...integration,
                          status: 'removido',
                          message: 'Integração removida',
                        });
                      }
                    },
                  });
                }}
                className="w-full text-center px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors duration-200"
              >
                Remover Integração
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          variant="danger"
          confirmText="Remover"
          cancelText="Cancelar"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
