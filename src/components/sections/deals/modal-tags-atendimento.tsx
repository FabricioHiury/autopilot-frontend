'use client';

import { useEffect, useRef, useState } from 'react';
import { IconEdit } from '@/components/icons/icon-edit';
import { AppServices } from '@/services/app.services';
import { TagItem } from '@/types/tag';
import { ConfirmDialog } from '@/components/commons/modais/confirm-dialog';
import IconX from '@/components/icons/icon-x';
import IconTag from '@/components/icons/icon-tag';
import IconTrash from '@/components/icons/icon-trash';
import toast from 'react-hot-toast';

interface ModalTagsAtendimentoProps {
  open: boolean;
  onClose: () => void;
  onChanged?: (tags: TagItem[]) => void;
}

export default function ModalTagsAtendimento({
  open,
  onClose,
  onChanged,
}: ModalTagsAtendimentoProps) {
  const apiRef = useRef<AppServices>();
  if (!apiRef.current) apiRef.current = new AppServices();
  const api = apiRef.current;

  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [editing, setEditing] = useState<TagItem | null>(null);
  const [tagToDelete, setTagToDelete] = useState<TagItem | null>(null);

  const [form, setForm] = useState<TagItem>({ name: '', color: '#FEE2E2', description: '' });
  const [nameLimitNotified, setNameLimitNotified] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    const [data, error] = await api.deal.findTags();
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const normalized = (data || []).map((t: any) => ({
      id: t.id,
      name: t.name ?? t.name,
      color: t.color ?? t.color,
      description: t.description ?? t.description,
    })) as TagItem[];
    setTags(normalized);
    setLoading(false);
    // Notifica o pai com a lista atualizada
    onChanged?.(normalized);
  };

  useEffect(() => {
    if (open) fetchTags();
  }, [open]);

  const hexToRGBA = (hex: string, alpha: number) => {
    try {
      const normalized = hex.replace('#', '');
      const fullHex =
        normalized.length === 3
          ? normalized
              .split('')
              .map((c) => c + c)
              .join('')
          : normalized;

      const r = parseInt(fullHex.substring(0, 2), 16);
      const g = parseInt(fullHex.substring(2, 4), 16);
      const b = parseInt(fullHex.substring(4, 6), 16);

      const a = Math.min(Math.max(alpha, 0), 1);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } catch {
      return hex; // fallback se hex inválido
    }
  };

  const handleEdit = (item: TagItem) => {
    setEditing(item);
    setForm({ id: item.id, name: item.name, color: item.color, description: item.description });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', color: '#FEE2E2', description: '' });
  };

  const handleRemove = async (id?: string) => {
    if (!id) return;
    const [, err] = await api.deal.removeTag(id);
    if (err) {
      toast.error(err.message);
      return;
    }
    setTags((prev) => prev.filter((t) => t.id !== id));
    if (editing?.id === id) resetForm();
    toast.success('Etiqueta removida');
    fetchTags();
  };

  const handleConfirmRemove = (item: TagItem) => {
    setTagToDelete(item);

    if (!tagToDelete?.id) return;
    handleRemove(tagToDelete.id);
  };

  const handleSubmit = async () => {
    const nameTrimmed = form.name?.trim() || '';
    if (!nameTrimmed) {
      toast.error('Informe um nome para a etiqueta');
      return;
    }
    if (nameTrimmed.length > 40) {
      toast.error('O nome da etiqueta deve ter no máximo 40 caracteres');
      return;
    }
    const payload = { name: nameTrimmed, color: form.color, description: form.description || '' };

    let error;
    if (editing?.id) {
      const [, err] = await api.deal.updateTag(editing.id, payload as any);
      error = err;
      if (!error) {
        setTags((prev) =>
          prev.map((t) =>
            t.id === editing.id
              ? { ...t, name: payload.name, color: payload.color, description: payload.description }
              : t,
          ),
        );
      }
    } else {
      const [created, err] = await api.deal.createTag(payload as any);
      error = err;
      if (!error && created) {
        const newTag: TagItem = {
          id: created.id,
          name: created.name ?? created.name ?? payload.name,
          color: created.color ?? created.color ?? payload.color,
          description: created.description ?? created.description ?? payload.description,
        };
        setTags((prev) => [newTag, ...prev]);
      }
    }

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editing?.id ? 'Etiqueta atualizada' : 'Etiqueta criada');
    resetForm();
    fetchTags();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-[#1B263A]/40 lg:hidden z-40" onClick={onClose} />
      <div className="fixed lg:absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:top-full lg:left-0 lg:translate-x-0 lg:translate-y-0 lg:mt-2 w-[calc(100vw-2rem)] max-w-[24rem] lg:w-96 bg-white border border-[#DDE6F2] shadow-xl rounded-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#EDF2F7]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#F7F9FC] flex items-center justify-center">
              <IconTag size={16} />
            </div>
            <span className="text-sm font-semibold text-[#1B263A]">Etiquetas</span>
          </div>
          <button aria-label="Fechar" onClick={onClose}>
            <IconX size={16} />
          </button>
        </div>

        <div className="p-3 space-y-3 flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-2">
            {loading && <span className="text-xs text-[#7F8999]">Carregando etiquetas...</span>}
            {!loading && tags.length === 0 && (
              <div className="text-xs text-[#7F8999]">Nenhuma etiqueta criada.</div>
            )}
            {!loading && tags.length > 0 && (
              <ul className="space-y-2 max-h-[50vh] overflow-auto">
                {tags.map((item) => (
                  <li
                    key={(item.id || item.name) + item.color}
                    className="flex items-center justify-between"
                  >
                    <div className="inline-flex items-center gap-2">
                      <span
                        className="px-2 py-1 rounded-[.25rem] text-xs font-semibold"
                        style={{
                          backgroundColor: item.color ? hexToRGBA(item.color, 0.18) : '#E5E7EB',
                          color: item.color || '#485B80',
                        }}
                      >
                        {item.name}
                      </span>
                      {item.description && (
                        <span className="text-[11px] text-[#7F8999]">{item.description}</span>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-3">
                      <button
                        className="text-[#485B80] hover:text-[#1B263A]"
                        aria-label="Editar etiqueta"
                        onClick={() => handleEdit(item)}
                      >
                        <IconEdit size={16} />
                      </button>
                      <button
                        className="text-[#C0392B] hover:text-[#E74C3C]"
                        aria-label="Remover etiqueta"
                        onClick={() => handleConfirmRemove(item)}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-2 border-t border-[#EDF2F7]">
            <div className="text-xs font-semibold text-[#485B80] mb-2">
              {editing ? 'Editar etiqueta' : 'Nova etiqueta'}
            </div>
            <div className="flex flex-col gap-2">
              <input
                value={form.name}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.length < 40 && nameLimitNotified) setNameLimitNotified(false);
                  setForm({ ...form, name: v });
                }}
                onPaste={(e) => {
                  const paste = (e.clipboardData || (window as any).clipboardData).getData('text');
                  const selStart = (e.target as HTMLInputElement).selectionStart || 0;
                  const selEnd = (e.target as HTMLInputElement).selectionEnd || selStart;
                  const nextLen = form.name.length - (selEnd - selStart) + paste.length;
                  if (nextLen > 40 && !nameLimitNotified) {
                    e.preventDefault();
                    toast.error('O nome da etiqueta deve ter no máximo 40 caracteres');
                    setNameLimitNotified(true);
                  }
                }}
                onKeyDown={(e) => {
                  const allowed = [
                    'Backspace',
                    'Delete',
                    'ArrowLeft',
                    'ArrowRight',
                    'Tab',
                    'Enter',
                  ];
                  if (form.name.length >= 40 && !allowed.includes(e.key) && !nameLimitNotified) {
                    toast.error('O nome da etiqueta deve ter no máximo 40 caracteres');
                    setNameLimitNotified(true);
                  }
                }}
                placeholder="Nome"
                maxLength={40}
                className="w-full rounded-md border border-[#DDE6F2] px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-9 h-9 p-0 border border-[#DDE6F2] rounded-md"
                  aria-label="Selecionar cor"
                />
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição (opcional)"
                  className="flex-1 rounded-md border border-[#DDE6F2] px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                />
              </div>
              <div className="flex items-center justify-between">
                {editing && (
                  <button
                    className="text-xs text-[#485B80] hover:text-[#1B263A] cursor-pointer"
                    onClick={resetForm}
                  >
                    Cancelar edição
                  </button>
                )}
                <div className="flex-1" />
                <button
                  onClick={handleSubmit}
                  className="text-xs font-semibold  bg-[#1B263A] hover:bg-[hsl(var(--primary))] text-primary-foreground px-3 py-1.5 rounded-md"
                >
                  {editing ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {tagToDelete && (
          <ConfirmDialog
            title="Excluir etiqueta"
            message={`Excluir a etiqueta "${tagToDelete.name}" irá:\n• Remover a etiqueta de todos os atendimentos que a utilizam;\n• Não será possível recuperar esta etiqueta;\n\nTem certeza que deseja prosseguir?`}
            variant="danger"
            onConfirm={() => handleRemove(tagToDelete.id)}
            onCancel={() => setTagToDelete(null)}
            confirmText="Excluir"
            cancelText="Cancelar"
          />
        )}
      </div>
    </>
  );
}
