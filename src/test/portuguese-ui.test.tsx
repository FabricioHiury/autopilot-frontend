import ModalTagsAtendimento from '@/components/sections/deals/modal-tags-atendimento';
import { describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { apiClient, apiError } from '@/services/api.client';
import {
  roleLabel,
  tagLabel,
  supportLabel,
  permissionLabel,
  channelLabel,
} from '@/lib/presentation-labels';
import { userMessage, integrationMessage } from '@/lib/user-messages';
import { systemMessage } from '@/lib/system-messages';
import { z } from '@/lib/zod';
import { DealLossReason, DealLossSubReason } from '@/types/deal-loss';
import { lossReasonLabel } from '@/lib/presentation-labels';
import CardStatus from '@/components/cards/CardStatus';
import { FormCargos } from '@/components/sections/settings/cargos/FormCargos';

describe('Portuguese user interface', () => {
  it('translates system labels while preserving custom names', () => {
    expect(roleLabel('Salesperson')).toBe('Vendedor');
    expect(roleLabel('Pre-salesperson')).toBe('Pré-vendedor');
    expect(roleLabel('Equipe Especial')).toBe('Equipe Especial');
    expect(tagLabel('HOT')).toBe('Quente');
    expect(tagLabel('Cliente da Ana')).toBe('Cliente da Ana');
    expect(channelLabel('other')).toBe('Outros');
    expect(supportLabel('draft')).toBe('Rascunho');
    expect(permissionLabel('storeViewChat')).toBe('Visualizar Conversa');
    expect(integrationMessage('disconnected')).toBe('Desconectado');
  });
  it('translates API validation errors and hides unknown English provider errors', () => {
    expect(
      userMessage(
        ['property number should not exist', 'phone should not be empty', 'phone must be a string'],
        400,
      ),
    ).toBe(
      'Número: campo não permitido. · Telefone: preenchimento obrigatório. · Telefone: informe um valor válido.',
    );
    expect(userMessage('Chat not found', 404)).toBe('Registro não encontrado.');
    expect(userMessage('Unexpected upstream failure', 502)).toBe(
      'Ocorreu um erro no servidor. Tente novamente.',
    );
    expect(userMessage('CPF inválido', 400)).toBe('CPF inválido');
    expect(apiError(new Error('Failed to fetch')).message).toBe(
      'Não foi possível conectar ao servidor.',
    );
  });
  it('localizes default validation without changing API enum values', () => {
    const schema = z.object({
      category: z.enum(['Integration', 'Chat', 'Deals', 'Account', 'Other']),
    });
    expect(schema.parse({ category: 'Account' }).category).toBe('Account');
    const invalid = schema.safeParse({ category: 'Conta' });
    expect(invalid.success).toBe(false);
    if (!invalid.success)
      expect(invalid.error.issues[0].message).toBe('Selecione uma opção válida.');
    const missing = z.string().safeParse(undefined);
    if (!missing.success)
      expect(missing.error.issues[0].message).toBe('Preenchimento obrigatório.');
  });
  it('translates notifications while preserving interpolated names', () => {
    expect(systemMessage('Chat linked to deal SUV da Ana')).toBe(
      'Conversa vinculada ao atendimento SUV da Ana',
    );
    expect(systemMessage('A task "Ligar para João" was completed')).toBe(
      'A tarefa "Ligar para João" foi concluída',
    );
  });
  it('shows a Portuguese role name and retains the original API value on save', async () => {
    let body: unknown;
    const adapter = apiClient.defaults.adapter;
    apiClient.defaults.adapter = async (config) => {
      body = JSON.parse(config.data);
      return { data: { data: {} }, status: 200, statusText: 'OK', headers: {}, config };
    };
    try {
      render(
        <FormCargos
          id="role-id"
          role="Salesperson"
          features={['storeViewChat']}
          onSalvar={vi.fn()}
        />,
      );
      expect(screen.getByDisplayValue('Vendedor')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
      await waitFor(() => expect(body).toMatchObject({ role: 'Salesperson' }));
    } finally {
      apiClient.defaults.adapter = adapter;
    }
  });
  it('localizes rejected HTTP responses without altering request values', async () => {
    const adapter = apiClient.defaults.adapter;
    let sent: unknown;
    apiClient.defaults.adapter = async (config) => {
      sent = JSON.parse(config.data);
      throw new AxiosError(
        'Request failed with status code 400',
        'ERR_BAD_REQUEST',
        config,
        undefined,
        {
          data: { message: ['phone should not be empty'] },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config,
        },
      );
    };
    try {
      await expect(
        apiClient.post('/example', { channel: 'other', role: 'Salesperson', phone: '' }),
      ).rejects.toMatchObject({
        response: { data: { message: 'Telefone: preenchimento obrigatório.' } },
      });
      expect(sent).toEqual({ channel: 'other', role: 'Salesperson', phone: '' });
    } finally {
      apiClient.defaults.adapter = adapter;
    }
  });
});

it('translates every loss reason and subreason used in the API', () => {
  for (const value of [...Object.values(DealLossReason), ...Object.values(DealLossSubReason)]) {
    expect(lossReasonLabel(value)).not.toBe(value);
    if (value !== 'otherReason') expect(lossReasonLabel(value)).not.toBe('Outro motivo');
  }
  expect(lossReasonLabel('otherReason')).toBe('Outro motivo');
});
it('shows active and inactive badges in Portuguese', () => {
  const { container, rerender } = render(<CardStatus status={true} />);
  expect(container).toHaveTextContent('Ativo');
  rerender(<CardStatus status={false} />);
  expect(container).toHaveTextContent('Inativo');
});

it('shows a translated tag name in the input and preserves its stored value on save', async () => {
  cleanup();
  const adapter = apiClient.defaults.adapter;
  let payload: unknown;
  apiClient.defaults.adapter = async (config) => {
    if (config.method === 'put') payload = JSON.parse(config.data);
    return {
      data: { data: { tags: [{ id: 'tag-1', name: 'HOT', color: '#ff0000', description: '' }] } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };
  try {
    render(<ModalTagsAtendimento open onClose={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Editar etiqueta' }));
    expect(screen.getByDisplayValue('Quente')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(payload).toMatchObject({ name: 'HOT' }));
  } finally {
    apiClient.defaults.adapter = adapter;
    cleanup();
  }
});
