import { ActionsRef } from '@/types/customer';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import toast from 'react-hot-toast';

interface CustomerActionsProps {
  onViewCustomer: () => void;
  onEditCustomer: () => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
  canEdit?: boolean;
}

const CustomerActions = forwardRef<ActionsRef, CustomerActionsProps>(
  ({ onViewCustomer, onEditCustomer, visible, setVisible, canEdit = true }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const show = useCallback(() => setVisible(true), [setVisible]);
    const hide = useCallback(() => setVisible(false), [setVisible]);

    const handleEdit = useCallback(() => {
      if (!canEdit) {
        toast.error('Você não possui permissão para editar clientes.');
        return;
      }
      onEditCustomer();
    }, [canEdit, onEditCustomer]);

    const handleView = useCallback(() => {
      onViewCustomer();
    }, [onViewCustomer]);

    useEffect(() => {
      if (visible) {
        containerRef.current?.focus();
      }
    }, [visible]);

    useEffect(() => {
      if (!visible) return;

      const onMouseDown = (e: MouseEvent) => {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target as Node)) hide();
      };

      document.addEventListener('mousedown', onMouseDown);
      return () => document.removeEventListener('mousedown', onMouseDown);
    }, [visible, hide]);

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          hide();
        }
      },
      [hide],
    );

    const onBlur = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        const next = e.relatedTarget as Node | null;
        if (containerRef.current && next && containerRef.current.contains(next)) {
          return;
        }
        hide();
      },
      [hide],
    );

    useImperativeHandle(ref, () => ({ show }), [show]);

    if (!visible) return null;

    return (
      <div
        ref={containerRef}
        tabIndex={-1}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-modal="false"
        className="flex absolute w-[247px] flex-shrink-0 z-10 top-[50%] lg:right-[70%] *:duration-300 bg-white rounded-lg border border-[#DDE6F2]"
      >
        <div className="flex flex-col relative w-full">
          <button
            type="button"
            className="flex items-center p-3 gap-3 text-[#6C7788] hover:bg-slate-200 duration-300 text-sm whitespace-nowrap"
            onClick={handleView}
          >
            <img src="/icons/action1.svg" alt="Ver" />
            Ver página do cliente
          </button>

          <button
            type="button"
            className="flex items-center p-3 gap-3 text-[#6C7788] text-sm duration-300 hover:bg-slate-200 whitespace-nowrap border-t border-[#DDE6F2] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleEdit}
            disabled={!canEdit}
          >
            <img src="/icons/action2.svg" alt="Editar" />
            Editar dados do cliente
          </button>
        </div>
      </div>
    );
  },
);

CustomerActions.displayName = 'CustomerActions';
export default CustomerActions;
