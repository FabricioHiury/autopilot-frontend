'use client';

import { useEffect, useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import Input from '@/components/inputs/text/Input';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import NoData from '@/components/commons/estados/NoData';
import toast from 'react-hot-toast';
import { AppServices, MessageTemplate } from '@/services/app.services';
import { cn } from '@/lib/class-name.utils';

interface MensagensPadraoDropdownProps {
  onSelect?: (content: string) => void;
  api?: AppServices;
  className?: string;
}

const emptyForm = {
  id: undefined as string | undefined,
  title: '',
  content: '',
};

export function MensagensPadraoDropdown({
  onSelect,
  api,
  className,
}: MensagensPadraoDropdownProps) {
  const apiApp = useMemo(() => api ?? new AppServices(), [api]);
  const [messages, setMensagens] = useState<MessageTemplate[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [formState, setFormState] = useState(emptyForm);

  const loadMensagens = async () => {
    setListLoading(true);
    const [data, error] = await apiApp.messageTemplates.list();
    if (error) {
      toast.error(error.message || 'Não foi possível listar as mensagens automáticas');
    } else {
      setMensagens(Array.isArray(data) ? data : []);
    }
    setListLoading(false);
  };

  useEffect(() => {
    loadMensagens();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.title.trim() || !formState.content.trim()) {
      toast.error('Preencha título e conteúdo');
      return;
    }
    setSaving(true);
    const payload = {
      title: formState.title.trim(),
      content: formState.content.trim(),
    };
    const [_, error] = formState.id
      ? await apiApp.messageTemplates.update(formState.id, payload)
      : await apiApp.messageTemplates.create(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message || 'Erro ao salvar mensagem automática');
      return;
    }
    toast.success(formState.id ? 'Mensagem atualizada' : 'Mensagem criada');
    setFormState(emptyForm);
    loadMensagens();
  };

  const handleEdit = (message: MessageTemplate) => {
    setFormState({ id: message.id, title: message.title, content: message.content });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const [_, error] = await apiApp.messageTemplates.remove(id);
    setDeletingId(null);
    setConfirmingId(null);
    if (error) {
      toast.error(error.message || 'Erro ao remover mensagem automática');
      return;
    }
    toast.success('Mensagem removida');
    if (formState.id === id) {
      setFormState(emptyForm);
    }
    loadMensagens();
  };

  const handleUseMessage = (content: string) => {
    if (onSelect) {
      onSelect(content);
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-[#DDE6F2] bg-white shadow-xl w-[20rem] max-h-[25vh] overflow-y-auto',
        className,
      )}
    >
      <section className="flex flex-col gap-3">
        {listLoading ? (
          <div className="py-6">
            <LoadingGlobal />
          </div>
        ) : messages.length === 0 ? (
          <NoData label="Nenhuma mensagem automática cadastrada." />
        ) : (
          Array.isArray(messages) &&
          messages.map((message) => (
            <div
              key={message.id}
              className="rounded-md border border-[#E5EEF8] bg-white p-2 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[#1B263A] text-xs truncate">{message.title}</p>
                <p className="text-[11px] text-[#6c7a96] whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {onSelect && (
                  <button
                    type="button"
                    onClick={() => handleUseMessage(message.content)}
                    className="text-[11px] font-semibold text-secondary-foreground bg-[hsl(var(--secondary))] rounded-md px-2 py-1 hover:bg-[#1b263a]"
                  >
                    Usar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleEdit(message)}
                  className="text-[11px] font-semibold text-[hsl(var(--secondary))] bg-[#DDE6F2] rounded-md px-2 py-1 hover:bg-[#cfd9ec]"
                >
                  Editar
                </button>

                {confirmingId === message.id ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-[hsl(var(--primary))]">
                      Confirmar remoção?
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="text-[11px] font-semibold text-[hsl(var(--secondary))] bg-[#DDE6F2] rounded-md px-2 py-1 hover:bg-[#cfd9ec]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(message.id)}
                        disabled={deletingId === message.id}
                        className="text-[11px] font-semibold text-primary-foreground bg-[hsl(var(--primary))] rounded-md px-2 py-1 hover:bg-[#b02b29] disabled:opacity-70"
                      >
                        {deletingId === message.id ? 'Removendo...' : 'Excluir'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(message.id)}
                    disabled={deletingId === message.id}
                    className="text-[11px] font-semibold text-primary-foreground bg-[hsl(var(--primary))] rounded-md px-2 py-1 hover:bg-[#b02b29] disabled:opacity-70"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border-t border-[#E5EEF8] pt-3 mt-3"
      >
        <Input
          label="Título"
          value={formState.title}
          onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Ex.: Saudação inicial"
          disabled={saving}
        />
        <label className="flex flex-col gap-1 text-xs font-medium text-[#1B263A]">
          Conteúdo
          <textarea
            value={formState.content}
            onChange={(e) => setFormState((prev) => ({ ...prev, content: e.target.value }))}
            className="min-h-[90px] rounded-md border border-[#DDE6F2] p-2 text-xs focus:border-[hsl(var(--secondary))] focus:ring-1 focus:ring-[hsl(var(--secondary))] outline-none"
            placeholder="Digite a mensagem automática..."
            disabled={saving}
          />
        </label>
        <div className="flex items-center justify-end gap-2">
          {formState.id && (
            <button
              type="button"
              className="text-xs font-semibold text-[#6c7a96] hover:text-[hsl(var(--primary))]"
              onClick={() => setFormState(emptyForm)}
              disabled={saving}
            >
              Cancelar edição
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-20 bg-[hsl(var(--secondary))] rounded-[0.5rem] h-10 px-3 text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : formState.id ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function MensagensPadraoDropdownPopover({ onSelect, api }: MensagensPadraoDropdownProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#DDE6F2] bg-white hover:bg-[#F8FAFC]"
          title="Gerenciar mensagens automáticas"
        >
          <img src="/icons/robot.png" alt="Abrir mensagens automáticas" className="w-6 h-6" />
        </button>
      </Popover.Trigger>
      <Popover.Content side="left" align="start" sideOffset={8} className="z-50">
        <MensagensPadraoDropdown onSelect={onSelect} api={api} />
      </Popover.Content>
    </Popover.Root>
  );
}
