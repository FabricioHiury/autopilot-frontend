'use client';
import { createContext, useContext } from 'react';

export type Observer = { type: string; data: any };
type ObserverContextType = { observer: Observer; setObserver: Function };
export const ObserverContext = createContext<ObserverContextType | undefined>(undefined);

export const useObserver = () => {
  const context = useContext(ObserverContext);
  if (!context) throw new Error('useObserver deve ser usado dentro de um ObserverContext.Provider');
  return context;
};
