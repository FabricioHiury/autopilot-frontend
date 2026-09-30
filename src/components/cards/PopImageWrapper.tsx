import { PopWrapperRef } from "@/utils/types/dataTypes";
import { MouseEventHandler, forwardRef, useImperativeHandle, useState } from "react";
import ButtonIcon from "../inputs/buttons/ButtonIcon";

interface Props {
  isDocument?:boolean
  onDownload: MouseEventHandler<HTMLButtonElement>
  children: React.ReactNode;
}

const PopImageWrapper = forwardRef<PopWrapperRef, Props>(({ children,isDocument=true,onDownload}, ref) => {
    

  const [visible, setVisible] = useState<boolean>(false);

  function show(){
    setVisible(true)
  }
  function drop(){
    setVisible(false)
  }
  useImperativeHandle(ref, () => ({
    show,
    drop
  }));


  return (
    <>
      <div className={"z-30 border-none outline-none transition-all duration-500 fixed w-screen h-screen top-0 left-0 flex justify-center items-center " +(visible ? "bg-[rgba(0,0,0,.2)]" : "invisible")}>
        <div className={"z-50 flex flex-col transition-all duration-500 scroll-padrao bg-white max-h-full rounded-lg overflow-hidden" +(visible ? "" : " translate-y-[100vh]")}>
          
        <div className="flex flex-col w-[90vw] h-[50vh] md:w-[48vw] md:h-[67vh] flex-grow-0 relative">
            <div className={
              "flex items-center px-8 h-[14%] z-10 justify-between w-full "+(isDocument ? "bg-[#34486F]" : "bg-[rgba(0,0,0,.3)]")}>
              <h2 className="text-[10px] md:text-[18px] font-medium text-[#F6F6F6]">Quarta-feira, 5 de junho de 2024</h2>
              <div className="flex items-center gap-4">
                <div className="md:flex hidden">
                  <ButtonIcon onClick={onDownload} background="white" color="#293856" width="auto" label={isDocument ? "Baixar Documento" : "Baixar Imagem"} icon="/icons/download.svg"/>  
                </div>
              
                <button onClick={onDownload} className="w-[20px] md:hidden rounded-full bg-white flex items-center justify-center p-1">
                  <img src="/icons/download.svg" alt="" />
                </button>
                <button onClick={drop} className="md:w-[40px] w-[20px] aspect-square flex-shrink-0 rounded-full bg-[rgba(0,0,0,.5)] flex items-center justify-center md:p-[14px] p-2">
                  <img src="/icons/exit_2.svg" className="w-full object-contain" alt="" />
                </button>
              </div>
            </div>
              {children}          
            </div>
        </div>
        <button className="z-10 absolute w-full h-full" onClick={() => {setVisible(false);}}></button>
      </div>
    </>
  );
});

export default PopImageWrapper;
