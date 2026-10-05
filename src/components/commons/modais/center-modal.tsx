'use client';

import { MouseEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface CenterModalProps {
  children: React.ReactNode;
  onClose: () => void;
  idSelector?: string;
  allowClickOutsideToClose?: boolean;
  className?: string;
}

export default function CenterModal({
  children,
  onClose,
  idSelector: selector,
  allowClickOutsideToClose = true,
  className,
}: CenterModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [_, setHeightContainer] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selector) {
      const el = document.getElementById('content-container');
      containerRef.current = el ?? document.body;
      return;
    }
    containerRef.current = document.getElementById(selector);
  }, [selector]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (!allowClickOutsideToClose) return;
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const contentContainer = document.getElementById('content-container');
    document.body.classList.add('app-modal-open');
    window.dispatchEvent(new CustomEvent('modal-open-change', { detail: true }));

    if (contentContainer) {
      const contentContainerHeight = contentContainer.clientHeight;
      if (contentContainerHeight > 0) {
        setHeightContainer(contentContainerHeight);
      }
      contentContainer.style.overflow = 'hidden';
    }
    return () => {
      document.body.classList.remove('app-modal-open');
      window.dispatchEvent(new CustomEvent('modal-open-change', { detail: false }));
      if (contentContainer) {
        contentContainer.style.overflow = 'auto';
      }
    };
  }, []);

  return (
    containerRef.current &&
    createPortal(
      <div
        className="z-[70] w-screen md:w-full h-full transition-all duration-150 bg-white md:bg-[#0f1522]/60 absolute top-0 left-0 bottom-0 md:backdrop-blur-[1px] md:rounded-[1.25rem] flex items-stretch justify-stretch md:items-center md:justify-center data-[close=true]:bg-opacity-0"
        data-close={isClosing}
        onClick={allowClickOutsideToClose ? handleClickOutside : undefined}
      >
        <div
          className={`z-[80] w-screen h-screen md:w-auto md:h-auto md:max-h-[90vh] bg-white rounded-none md:rounded-[0.5rem] border-0 md:border shadow-none md:shadow-xl overflow-y-auto p-0 md:p-5 pb-[160px] md:pb-5 ${className ?? ''}`}
          data-close={isClosing}
          ref={modalRef}
        >
          {children}
        </div>
      </div>,
      containerRef.current,
    )
  );
}
