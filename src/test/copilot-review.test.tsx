import { beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
const mocks = vi.hoisted(() => ({
  getAnalysis: vi.fn(),
  getDeal: vi.fn(),
  applyToDeal: vi.fn(),
  refreshAnalysis: vi.fn(),
  fetchPermissions: vi.fn(),
  getUser: () => ({ storeId: 'store-a' }),
  error: vi.fn(),
  success: vi.fn(),
}));
vi.mock('@/contexts/auth-app-context', () => ({
  useAppAuth: () => ({ fetchPermissions: mocks.fetchPermissions, getUser: mocks.getUser }),
}));
vi.mock('@/contexts/RealtimeContext', () => ({ useChatSocket: () => null }));
vi.mock('@/services/copilot.service', () => ({ copilotService: mocks }));
vi.mock('react-hot-toast', () => ({ default: { error: mocks.error, success: mocks.success } }));
import { LeadDossierPanel } from '@/components/sections/chat/copilot/LeadDossierPanel';
beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.fetchPermissions.mockResolvedValue({ permissions: ['storeEditDeleteDeal'] });
  mocks.getDeal.mockResolvedValue({ descriptionDeal: 'Nota anterior', temperature: 'COLD' });
  mocks.applyToDeal.mockResolvedValue({});
  mocks.getAnalysis.mockResolvedValue({
    enabled: true,
    analyzedAt: '2026-10-05T12:00:00Z',
    insight: {
      leadDossier: {
        vehicleOfInterest: 'SUV',
        hasTradeIn: false,
        tradeInVehicle: null,
        paymentMethod: 'À vista',
        perceivedTemperature: 'HOT',
        mainObjection: 'Preço',
      },
      nextBestAction: 'Agendar visita',
      quickReplies: ['Vamos agendar uma visita?'],
    },
  });
});
async function review() {
  render(<LeadDossierPanel chatId="chat-a" dealId="deal-a" onReply={vi.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir sugestões da IA' }));
  fireEvent.click(await screen.findByRole('button', { name: /Dossiê estratégico/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Revisar e aplicar ao Atendimento' }));
  return screen.findByRole('textbox', { name: 'Descrição revisada' });
}
it('waits for review and applies the seller edits only after confirmation', async () => {
  const description = await review();
  expect(mocks.applyToDeal).not.toHaveBeenCalled();
  expect((description as HTMLTextAreaElement).value).toContain('Nota anterior');
  fireEvent.change(description, {
    target: { value: 'Nota anterior\nVeículo revisado pelo vendedor' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar atualização' }));
  await waitFor(() =>
    expect(mocks.applyToDeal).toHaveBeenCalledWith(
      'deal-a',
      'Nota anterior\nVeículo revisado pelo vendedor',
      'HOT',
    ),
  );
});
it('does not overwrite a deal that changed while the seller was reviewing', async () => {
  await review();
  mocks.getDeal.mockResolvedValueOnce({
    descriptionDeal: 'Alterado por outro vendedor',
    temperature: 'COLD',
  });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar atualização' }));
  await waitFor(() =>
    expect(mocks.error).toHaveBeenCalledWith(expect.stringContaining('alterada por outra pessoa')),
  );
  expect(mocks.applyToDeal).not.toHaveBeenCalled();
});
it('does not offer deal updates without the edit permission', async () => {
  mocks.fetchPermissions.mockResolvedValue({ permissions: [] });
  render(<LeadDossierPanel chatId="chat-a" dealId="deal-a" onReply={vi.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir sugestões da IA' }));
  fireEvent.click(await screen.findByRole('button', { name: /Dossiê estratégico/ }));
  expect(screen.queryByRole('button', { name: 'Revisar e aplicar ao Atendimento' })).toBeNull();
});

it('starts collapsed and inserts a suggestion for review without sending it', async () => {
  const onReply = vi.fn();
  render(<LeadDossierPanel chatId="chat-a" onReply={onReply} />);
  await waitFor(() => expect(screen.getByText('1 sugestão')).toBeTruthy());
  expect(
    screen.getByRole('button', { name: 'Abrir sugestões da IA' }).getAttribute('aria-expanded'),
  ).toBe('false');
  expect(screen.queryByRole('button', { name: 'Vamos agendar uma visita?' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Abrir sugestões da IA' }));
  fireEvent.click(screen.getByRole('button', { name: 'Vamos agendar uma visita?' }));
  expect(onReply).toHaveBeenCalledWith('Vamos agendar uma visita?');
  expect(screen.queryByRole('button', { name: 'Vamos agendar uma visita?' })).toBeNull();
  expect(mocks.applyToDeal).not.toHaveBeenCalled();
});

it('can be minimized and resets to collapsed when switching conversations', async () => {
  const onReply = vi.fn();
  const { rerender } = render(<LeadDossierPanel chatId="chat-a" onReply={onReply} />);
  await waitFor(() => expect(screen.getByText('1 sugestão')).toBeTruthy());
  fireEvent.click(screen.getByRole('button', { name: 'Abrir sugestões da IA' }));
  fireEvent.click(screen.getByRole('button', { name: 'Recolher sugestões da IA' }));
  expect(screen.queryByRole('button', { name: 'Vamos agendar uma visita?' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Abrir sugestões da IA' }));
  rerender(<LeadDossierPanel chatId="chat-b" onReply={onReply} />);
  await waitFor(() => expect(screen.getByText('1 sugestão')).toBeTruthy());
  expect(
    screen.getByRole('button', { name: 'Abrir sugestões da IA' }).getAttribute('aria-expanded'),
  ).toBe('false');
});
