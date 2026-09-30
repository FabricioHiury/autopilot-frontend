import { ObserverContext } from "@/app/app/layout";
import { useContext } from "react";


export const useObserver = () => {
  const context = useContext(ObserverContext);
  if (!context) {
    throw new Error("useObserver deve ser usado dentro de um ObserverContext.Provider");
  }
  return context;
};
