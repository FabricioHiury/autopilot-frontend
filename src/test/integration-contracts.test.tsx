import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { AxiosError } from 'axios';
import { apiClient, requestData } from '@/services/api.client';
import {
  saveSession,
  getSession,
  getAccessToken,
  clearSession,
  tokenExpiry,
} from '@/services/session';
import { applyTenantTheme, DEFAULT_COLORS, hexToHsl } from '@/lib/tenant-theme';
import { mergeChatMessage } from '@/services/chat-events';
import { dossierDescription } from '@/lib/copilot-review';
import { CopilotQuickReplies } from '@/components/sections/chat/copilot/CopilotQuickReplies';
import type { Message } from '@/types/message';
const jwt = (exp: number) =>
  `header.${btoa(JSON.stringify({ exp, storeId: 'store-a' }))}.signature`;
beforeEach(() => {
  clearSession();
  window.history.replaceState({}, '', '/app/deals/chat');
  applyTenantTheme(null);
  cleanup();
});
describe('persistent tenant session', () => {
  it('persists the session and cookie until JWT expiry, and clears both on logout', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = jwt(exp);
    saveSession({ id: 'user-a', name: 'Vendedor', profile: 'user', storeId: 'store-a', token });
    expect(getAccessToken()).toBe(token);
    expect(getSession()?.storeId).toBe('store-a');
    expect(tokenExpiry(token)).toBe(exp * 1000);
    expect(document.cookie).toContain('secure_token=');
    clearSession();
    expect(getSession()).toBeNull();
    expect(document.cookie).not.toContain('secure_token=');
  });
  it('rejects expired or non-expiring tokens', () => {
    for (const token of [jwt(1), 'invalid'])
      expect(() => saveSession({ id: 'u', name: 'User', profile: 'user', token })).toThrow();
  });
});
describe('principal API envelope and permissions', () => {
  it('attaches JWT, unwraps data, and keeps session on permission denial', async () => {
    const token = jwt(Math.floor(Date.now() / 1000) + 3600);
    saveSession({ id: 'u', name: 'User', profile: 'user', token });
    const adapter = apiClient.defaults.adapter;
    try {
      apiClient.defaults.adapter = async (config) => {
        expect(config.headers.Authorization).toBe(`Bearer ${token}`);
        return {
          config,
          status: 200,
          statusText: 'OK',
          headers: {},
          data: { message: 'OK', statusCode: 200, data: { id: 'chat-a' } },
        };
      };
      expect(await requestData(apiClient.get('/chats/chat-a'))).toEqual({ id: 'chat-a' });
      apiClient.defaults.adapter = async (config) => {
        throw new AxiosError(
          'Forbidden',
          'ERR_BAD_REQUEST',
          config,
          {},
          {
            config,
            status: 403,
            statusText: 'Forbidden',
            headers: {},
            data: { message: 'Sem permissão', data: null, statusCode: 403 },
          },
        );
      };
      await expect(requestData(apiClient.get('/deals'))).rejects.toThrow('Sem permissão');
      expect(getSession()).not.toBeNull();
    } finally {
      apiClient.defaults.adapter = adapter;
    }
  });
});
describe('white label isolation', () => {
  it('restores defaults and removes tenant favicon on logout or cancelled preview', () => {
    applyTenantTheme({
      primaryColor: '#FFFFFF',
      secondaryColor: '#000000',
      accentColor: '#123456',
      displayName: 'Loja A',
      faviconUrl: 'https://example.com/icon.png',
    });
    expect(document.documentElement.style.getPropertyValue('--primary-foreground')).toBe(
      '222 30% 12%',
    );
    expect(document.title).toContain('Loja A');
    applyTenantTheme(null);
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe(
      hexToHsl(DEFAULT_COLORS.primaryColor),
    );
    expect(document.querySelector('link[data-tenant-favicon]')).toBeNull();
    expect(document.title).toBe('AutoPilot CRM');
  });
});
describe('realtime history reconciliation', () => {
  it('merges duplicates and preserves content when status is updated', () => {
    const message = { id: 'm1', content: 'Olá', deliveryStatus: 'SENT' } as Message;
    const received = mergeChatMessage([message], message);
    expect(received).toHaveLength(1);
    expect(
      mergeChatMessage(received, { id: 'm1', deliveryStatus: 'READ' } as Message, true)[0],
    ).toMatchObject({ content: 'Olá', deliveryStatus: 'READ' });
    expect(mergeChatMessage(received, { id: 'unloaded' } as Message, true)).toBe(received);
  });
});
describe('human review of AI suggestions', () => {
  it('inserts quick replies through the composer callback without sending', () => {
    const select = vi.fn();
    render(<CopilotQuickReplies replies={['Posso agendar uma visita?']} onSelect={select} />);
    fireEvent.click(screen.getByRole('button'));
    expect(select).toHaveBeenCalledWith('Posso agendar uma visita?');
  });
  it('replaces only the reviewed dossier block and preserves seller notes', () => {
    const dossier = {
      vehicleOfInterest: 'SUV 2024',
      hasTradeIn: false,
      tradeInVehicle: null,
      paymentMethod: 'À vista',
      perceivedTemperature: 'HOT' as const,
      mainObjection: 'Preço',
    };
    const first = dossierDescription('Nota do vendedor', dossier);
    const second = dossierDescription(first, { ...dossier, vehicleOfInterest: 'Sedan 2025' });
    expect(second).toContain('Nota do vendedor');
    expect(second).toContain('Sedan 2025');
    expect(second).not.toContain('SUV 2024');
    expect(second.match(/\[Dossiê AutoPilot\]/g)).toHaveLength(1);
  });
});
