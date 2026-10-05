'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { BtnStrong, BtnTransparent } from '../buttons/buttons';
import ButtonAlertIcon from '../buttons/button-circle/icons/button-alert-icon';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Sim, sair e descartar',
  cancelText = 'Voltar ao preenchimento',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      onConfirm();
    }, 150);
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
    }, 150);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in data-[close=true]:animate-fade-out"
      data-close={isClosing}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl animate-fade-in data-[close=true]:animate-fade-out"
        data-close={isClosing}
      >
        <div className="flex flex-col w-[415px] items-center justify-center p-5 px-10">
          <div className="flex flex-col items-center px-4 gap-5">
            <div className="flex justify-center items-center w-[53px] h-[53px] rounded-full bg-[#EBEEF2]">
              <ButtonAlertIcon />
            </div>

            <h2 className="text-[28px] leading-8 mb-2 text-[#24292E] font-semibold text-center">
              {title}
            </h2>
          </div>
          <p className="text-[16px] text-[#657380] text-center">{message}</p>
          <div className="flex flex-col gap-2 w-full mt-5">
            <BtnTransparent label={cancelText} onClick={handleCancel} />
            <BtnStrong label={confirmText} onClick={handleConfirm} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
