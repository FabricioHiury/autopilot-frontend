'use client'

import { MouseEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface ImageModalProps {
  children: React.ReactNode;
  onClose: () => void;
  idSelector?: string;
}

export default function ImageModal({children, onClose, idSelector: selector}: ImageModalProps) {

  const [isClosing, setIsClosing] = useState(false);
  const [heightContainer, setHeightContainer] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if( !selector ) {
      containerRef.current = document.body;
      return;
    }
    containerRef.current = document.getElementById(selector);
  }, [selector]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 150);
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose]);


  useEffect(() => {
    const contentContainer = document.getElementById('content-container');
    if (contentContainer) {
      const contentContainerHeight = contentContainer.clientHeight;
      if (contentContainerHeight > 0) {
        setHeightContainer(contentContainerHeight)
      };
      contentContainer.style.overflow = 'hidden';
    }
    return () => {
      if (contentContainer) {
        contentContainer.style.overflow = 'auto';
      }
    }
  }, []);

  return containerRef.current && createPortal((
    <div className="z-20 w-screen md:w-full h-full transition-all duration-150 bg-[#0f1522]/60 absolute inset-0 md:backdrop-blur-[1px] flex items-center justify-center data-[close=true]:bg-opacity-0" data-close={isClosing} onClick={handleClickOutside}>
      <div className="z-20 w-screen h-screen max-h-[95vh] sm:h-fit sm:w-3/4 lg:w-1/2 flex flex-col gap-4 bg-white rounded-lg overflow-hidden animate-fade-in-top data-[close=true]:animate-fade-out-top md:shadow-lg" data-close={isClosing} ref={modalRef}>
        <div className="h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  ), containerRef.current);
}