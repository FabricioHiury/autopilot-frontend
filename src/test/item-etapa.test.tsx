/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ItemEtapa from '@/components/sections/atendimentos/item-etapa';
import { STATUS_ATENDIMENTO } from '@/utils/types/status-atentimento-enum';

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

vi.mock('@/lib/api-app', () => ({
  ApiApp: class {
    chat = { arquivar: vi.fn() };
    atendimento = { arquivar: vi.fn(), remover: vi.fn(), vincularTag: vi.fn() };
  },
}));

vi.mock('@/components/commons/avatar-canal', () => ({
  default: (props: any) => <div data-testid="avatar-canal">{props.canal}</div>,
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
          etapa: STATUS_ATENDIMENTO.PRE_ATENDIMENTO,
          status: STATUS_ATENDIMENTO.PRE_ATENDIMENTO,
          canais: ['whatsapp', 'instagram'] as ('whatsapp' | 'instagram' | 'facebook' | 'olx' | 'outros')[],
          temperatura: 'morno' as const,
          nome: 'Cliente Teste',
          titulo: 'Título de teste',
          responsaveis: [{ id: 'r1', nome: 'Resp', idUsuario: 'u1', whatsapp: null }],
          totalNotas: 0,
          totalTarefas: 0,
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
          etapa: STATUS_ATENDIMENTO.CHAT,
          status: STATUS_ATENDIMENTO.CHAT,
          canais: ['whatsapp'] as ('whatsapp' | 'instagram' | 'facebook' | 'olx' | 'outros')[],
          temperatura: 'frio' as const,
          nome: 'Fulano de Tal',
          titulo: 'Chat',
          responsaveis: [{ id: 'r2', nome: 'Resp 2', idUsuario: 'u2', whatsapp: null }],
          totalNotas: 1,
          totalTarefas: 2,
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