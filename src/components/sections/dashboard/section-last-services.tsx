import { IconCarIn } from "@/components/icons/icon-car-in";
import CardServiceMini from "./card-service-mini";
import FilterButton from "./filter-button";
import { IconCarOut } from "@/components/icons/icon-car-out";
import { IconCar } from "@/components/icons/icon-car";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/utils/classes/api";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";


interface Colaborador {
    id: string;
    idLoja: string;
    idUsuario: string;
    idFoto: number | null;
    nome: string;
    documentoFiscal: string;
    whatsapp: string;
    telefoneComplementar: string | null;
    status: string;
    observacoes: string;
    criadoEm: string;    // ou Date, caso você parse datas
    atualizadoEm: string; // ou Date, caso você parse datas
  }
  
  interface AtendimentoResponsavel {
    id: string;
    idAtendimento: string;
    idColaborador: string;
    idLoja: string;
    criadoEm: string;    // ou Date
    atualizadoEm: string; // ou Date
    colaborador: Colaborador;
  }

export interface AtendimentoDashboard {
    id: string;
    idLoja: string;
    idCliente: number | null;
    idClienteTemporario: number | null;
    origemAtendimento: string;
    temperatura: string;
    modoAtendimento: string;
    status: string;
    titulo: string;
    descricaoAtendimento: string;
    observacao: string;
    criadoEm: string;
    atualizadoEm: string;
    atendimentoResponsaveis: AtendimentoResponsavel[];
    cliente?: {
        id: string;
        nome: string;
    };
    clienteTemporario?: {
        id: string;
        nome: string;
    };
  };
  
  type DadosAtendimentos = {
    modo: string;
    atendimentos: AtendimentoDashboard[];
  };
  
export default function SectionLastServices() {

    const [data,setData] = useState<DadosAtendimentos>()    
    const [loading,setLoading] = useState<boolean>(true)
    const [modo,setModo] = useState<string>("venda")


    async function load(){
        setLoading(true)
        const [response,error] = await api.get(`/loja/dashboard/ultimos-atendimentos${
            api.query.searchInMemoryQuerys({
                modo
            })
        }`);
        if(error){
            return toast.error(error.message)
        }
        setLoading(false)
        setData(response.data)
    }

    useEffect(()=>{
        load()
    },[modo])

    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="text-[#293856] font-semibold text-[1.125rem]">
                    Últimos atendimentos
                </h2>
                <div className="flex items-center justify-end gap-2">
                    <FilterButton onClick={()=>setModo("compra")} title="Compra" icon={<IconCarIn />} active={modo==="compra"} />
                    <FilterButton onClick={()=>setModo("venda")} title="Venda" icon={<IconCarOut />} active={modo==="venda"} />
                    <FilterButton onClick={()=>setModo("consignado")} title="Consignado" icon={<IconCar />} active={modo==="consignado"} />
                </div>
            </div>

            <div className="bg-white rounded-2xl w-full relative mt-4">
                {(loading || !data) &&
                     <div className="w-full flex justify-center items-center p-4">
                     <LoadingGlobal minH="min-h-[130px]"/>
                     </div>
                }
                {(!loading && data) && 
                     <div className="p-4 w-full flex gap-4 overflow-x-auto min-h-[60px] scroll-padrao">
                        {data.atendimentos.map((obj,i)=>{
                            return <CardServiceMini atendimento={obj}/>
                        })}
                        {data.atendimentos.length===0 &&
                        <p className="text-neutral-700 text-[12px] gap-1  flex items-center ">
                            Nenhum atendimento para <b>"{modo==="compra" ? "compras" : (modo==="venda" ? "vendas" : "consignados")}" </b> 
                             encontrado</p>}
                     </div>
                }
              
            </div>
        </div>
    );
}
