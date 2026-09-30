'use client'
import PopImageWrapper from "@/components/cards/PopImageWrapper";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import CardsHistorico from "@/components/sections/cliente/CardsHistorico";
import ClienteInfoSection from "@/components/sections/cliente/ClienteInfoSection";
import { useObserver } from "@/contexts/observer.context";
import api from "@/utils/classes/api";
import handleDate from "@/utils/classes/format/time";
import { Cliente } from "@/utils/types/cliente.type";
import { PopWrapperRef } from "@/utils/types/dataTypes";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CustomerIndividualPage() {

  const path = useParams();
  const router = useRouter()

  
  const [cliente,setCliente] = useState<Cliente>();
  const [loading,setLoading] = useState(true);
  const {observer,setObserver} = useObserver()
  const [width,setWidth] = useState<number>(0)

  const pop = useRef<PopWrapperRef>(null)
 
  function selectHistory(index:number){
    setCliente(old => {
      if(old===undefined){
        return;
      }
      return {
        ...old,
        atendimentos: old.atendimentos.map((obj:any,i:number)=>{
          return{
            ...obj,
            selecionado:i===index
          }
      })
      }
    })
  }

  async function loadUserInfo(){
    setLoading(true)
    const idCliente = path.idCliente;
    const [response,error] = await api.get(`/cliente/pegar/${idCliente}`);
    console.log(response)

    if(error){
      return router.push("/app/clientes")
    }
    response.data.atendimentos = response.data.atendimentos.map((obj:any,i:number)=>{
        return{
          ...obj,
          selecionado:i===0
        }
    })
        
    setCliente(response.data)
    setLoading(false)
  }

  useEffect(()=>{
    loadUserInfo()
  },[])
  useEffect(()=>{
    if(loading) return
    const myObserver = new ResizeObserver(
      (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
        for (let entry of entries) {
          if(window.innerWidth>1280){
            setWidth(entry.target.clientWidth-400)
          }
          else{
            setWidth(entry.target.clientWidth)
          }
        }
    });
    const myElement = document.getElementById('refContainer') as Element;
    myObserver.observe(myElement);

    return () => {
      myObserver.disconnect();
    };
  },[loading])
  useEffect(()=>{
    if(observer.tipo==="atualizarDadosClientes"){
      loadUserInfo()
    }
  },[observer])

  if(loading){
    return (
      <main className="flex flex-col items-center justify-center lg:flex-row gap-5 min-h-full">
        <LoadingGlobal/>
      </main>
    )
  }
  else if(cliente && !loading){

  return (

    <main className="flex flex-col xl:flex-row gap-5 min-h-full w-full overflow-x-hidden" id="refContainer">

      <ClienteInfoSection aboutCliente={cliente}/>

      <div className="flex flex-col gap-4 p-6 md:p-12" style={{width:width+"px"}}>
        <PopImageWrapper onDownload={()=>{}} ref={pop}>
              <img src="/images/default.png" className="absolute object-cover w-full" alt="" />
        </PopImageWrapper>
        <div>
          <h1 className="text-[#1B263A] text-[32px] font-semibold">Histórico de {cliente.nome}</h1>
          <span className="text-[#6C7788] text-[16px]">Veja aqui o histórico de interações e atendimentos com este cliente na AutoPilot</span>
        </div>
        {cliente.atendimentos.length>0 
        ?
        <>
          <div className="w-full scroll-padrao overflow-x-auto border-b pb-1 pt-0 p-4 items-center flex gap-4">
            {cliente.atendimentos.map((obj,index)=>(    
              <button className={"flex flex-row gap-2 flex-shrink-0  items-center border-b-[3px] p-1 border-[#D33632] "
              +(obj.selecionado===true ? "text-[#0F1522] font-bold" : "text-[#485B80]  border-none")}
              key={index} onClick={()=>selectHistory(index)}>
                <img src={"/icons/"+obj.origemAtendimento+".svg"} className="w-3" alt="" />
                {handleDate.formatISODate(obj.criadoEm)}
              </button>
            ))}
          </div>
        <CardsHistorico atendimento={cliente.atendimentos.find(obj=>obj.selecionado) ?? cliente.atendimentos[0]}/>
        </>
        :
        <div className="w-full h-full flex justify-center items-center">
            Usuário não possui ainda um histórico 
        </div> 
        }
        
      </div>
    </main>
  );
  }
}
