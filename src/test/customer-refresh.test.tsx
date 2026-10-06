import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import CustomerLayout from '@/app/app/customers/layout';
import { ObserverContext, type Observer, useObserver } from '@/contexts/observer.context';
vi.mock('@/components/commons/modais/side-modal', () => ({default: ({children}: any) => <div>{children}</div>}));
vi.mock('@/components/commons/modal-title', () => ({ModalTitle: () => <span>Modal</span>}));
vi.mock('@/components/sections/customers/NewCustomerForm', () => ({default: ({onExitPop}: any) => {
  const {setObserver} = useObserver();
  return <button onClick={() => {setObserver({type:'atualizarDadosClientes', data:{}}); onExitPop();}}>Salvar cliente</button>;
}}));
function Harness() {
  const [observer, setObserver] = useState<Observer>({type:'abrirPopClienteNovo', data:undefined});
  return <ObserverContext.Provider value={{observer,setObserver}}><CustomerLayout><output>{observer.type}</output></CustomerLayout></ObserverContext.Provider>;
}
afterEach(cleanup);
describe('customer modal refresh', () => {
  it('preserves the refresh event when saving closes the modal', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', {name:'Salvar cliente'}));
    expect(screen.getByRole('status')).toHaveTextContent('atualizarDadosClientes');
    expect(screen.queryByText('Modal')).not.toBeInTheDocument();
  });
});
