import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import FaqPage from '@/app/app/help-faq/questions/[id]/page';
vi.mock('next/navigation', () => ({useParams: () => ({id:'faq'}),useRouter: () => ({push:vi.fn()})}));
vi.mock('@/services/app.services', () => ({AppServices: class {
  faq = {get: async () => [{id:'faq',title:'FAQ publicada',category:'Account',content:'<p>Conteúdo HTML publicado para a loja.</p>',updatedAt:'2026-10-06T12:00:00.000Z'},null]};
}}));
vi.mock('@/components/commons/modais/modal-notificacoes', () => ({ModalNotificacoes: () => null}));
vi.mock('@/components/sections/go-back-page', () => ({default: () => null}));
afterEach(cleanup);
describe('store FAQ reader', () => {
  it('renders published HTML without trying to parse Lexical JSON', async () => {
    render(<FaqPage />);
    expect(await screen.findByText('Conteúdo HTML publicado para a loja.')).toBeInTheDocument();
    expect(screen.getByRole('link', {name:'Dúvidas Frequentes'})).toHaveAttribute('href','/app/help-faq/questions');
  });
});
