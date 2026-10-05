'use client';

import { cn } from '@/lib/class-name.utils';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SideModalProps {
  children: React.ReactNode;
  onClose: () => void;
  idSelector?: string;
  bg?: string;
  className?: string;
  allowClickOutsideToClose?: boolean;
}

export default function SideModal({
  children,
  onClose,
  idSelector: selector,
  bg = 'bg-white',
  className,
  allowClickOutsideToClose = true,
}: SideModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [heightContainer, setHeightContainer] = useState(0);
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
    if (
      allowClickOutsideToClose &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
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
        className="z-[70] w-screen md:w-full h-full transition-all duration-150 bg-[#0f1522]/60 absolute top-0 left-0 bottom-0 
    md:backdrop-blur-[1px] md:rounded-[1.25rem] flex justify-end data-[close=true]:bg-opacity-0"
        data-close={isClosing}
        onClick={allowClickOutsideToClose ? handleClickOutside : undefined}
      >
        <div
          className={cn(
            'z-[80] w-screen  relative lg:w-[600px] p-8 flex flex-col gap-4  border border-white sm:rounded-[1.25rem]',
            'overflow-y-auto scrollbar animate-fade-in-right data-[close=true]:animate-fade-out-right',
            bg,
            className,
          )}
          data-close={isClosing}
          ref={modalRef}
        >
          <div className="pb-16 md:pb-0">{children}</div>
        </div>
      </div>,
      containerRef.current,
    )
  );
}
