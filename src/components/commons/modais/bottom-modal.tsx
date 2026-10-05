'use client';

import { cn } from '@/lib/class-name.utils';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SideModalProps {
  children: React.ReactNode;
  onClose: () => void;
  idSelector?: string;
  bg?: string;
}

export default function BottomModal({
  children,
  onClose,
  idSelector: selector,
  bg = 'bg-white',
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
    if (!modalRef.current) return;

    const target = e.target as HTMLElement;

    if (modalRef.current.contains(target) || target.closest('.portal')) {
      return;
    }

    handleClose();
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
    md:backdrop-blur-[1px] md:rounded-[1.25rem] flex items-end justify-end data-[close=true]:bg-opacity-0"
        data-close={isClosing}
        onClick={handleClickOutside}
      >
        <div
          className={cn(
            'z-[80] w-screen relative lg:w/full max-h-fit flex flex-col gap-4 rounded-[1.25rem]',
            'overflow-y-auto scrollbar animate-fade-in-bottom data-[close=true]:animate-fade-out-bottom',
            bg,
          )}
          data-close={isClosing}
          ref={modalRef}
        >
          <div className="pb-20 md:pb-0">{children}</div>
        </div>
      </div>,
      containerRef.current,
    )
  );
}
