/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ItemEtapa from '@/components/sections/deals/item-etapa';
import { DealStatus } from '@/types/deal-status';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    isDragging: false,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('@/services/app.services', () => ({
  AppServices: class {
    chat = { archive: vi.fn() };
    deal = { archive: vi.fn(), remove: vi.fn(), linkTag: vi.fn() };
  },
}));

vi.mock('@/components/commons/avatar-canal', () => ({
  default: (props: any) => <div data-testid="avatar-canal">{props.channel}</div>,
}));

vi.mock('@/components/commons/avatar-user', () => ({
  default: () => <div data-testid="avatar-user" />,
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <>{children}</>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
}));

// helper para boundingClientRect usado no posicionamento do menu
const rect = {
  top: 100,
  left: 100,
  bottom: 120,
  right: 120,
  width: 20,
  height: 20,
  x: 100,
  y: 100,
  toJSON: () => ({}),
};

function mockRects() {
  (HTMLElement.prototype as any).getBoundingClientRect = function () {
    return rect as DOMRect;
  } as any;
}

describe('ItemEtapa', () => {
  it('renderiza item não-chat e abre o menu de opções', () => {
    mockRects();
    const props = {
      itemAtendimento: {
        id: '1',
        data: {
          stage: DealStatus.PRE_DEAL,
          status: DealStatus.PRE_DEAL,
          channels: ['whatsapp', 'instagram'] as (
            'whatsapp' | 'instagram' | 'facebook' | 'olx' | 'other'
          )[],
          temperature: 'WARM' as const,
          name: 'Cliente Teste',
          title: 'Título de teste',
          assignees: [{ id: 'r1', name: 'Resp', userId: 'u1', whatsapp: null }],
          commentCount: 0,
          totalTasks: 0,
          tags: [],
        },
      },
      etapaId: '1',
      availableTags: [],
    };

    render(<ItemEtapa {...props} />);

    // exibe título
    expect(screen.getByText('Título de teste')).toBeInTheDocument();

    // avatar dos canais
    const avatars = screen.getAllByTestId('avatar-canal');
    expect(avatars.length).toBeGreaterThan(0);

    // botão de opções (3 pontos) abre o menu
    const optionsBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(optionsBtn);
    expect(screen.getByText('Mover')).toBeInTheDocument();
  });

  it('usa nome quando é chat e título é "Chat"', () => {
    mockRects();
    const props = {
      itemAtendimento: {
        id: '2',
        data: {
          stage: DealStatus.CHAT,
          status: DealStatus.CHAT,
          channels: ['whatsapp'] as ('whatsapp' | 'instagram' | 'facebook' | 'olx' | 'other')[],
          temperature: 'COLD' as const,
          name: 'Fulano de Tal',
          title: 'Chat',
          assignees: [{ id: 'r2', name: 'Resp 2', userId: 'u2', whatsapp: null }],
          commentCount: 1,
          totalTasks: 2,
          tags: [],
        },
      },
      etapaId: '0',
      availableTags: [],
    };

    render(<ItemEtapa {...props} />);

    // deve cair para nome quando título é "Chat"
    expect(screen.getByText('Fulano de Tal')).toBeInTheDocument();
  });
});
