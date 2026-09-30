"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"
import api from "@/utils/classes/api"
import toast from "react-hot-toast"
import CalendarSelect from "@/components/inputs/select/CalendarSelect"
import { SelectMin } from "@/components/commons/inputs/select-min"
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal"

const chartData = [
  { month: "Jan", facebook: 186, loja: 145, redesSociais: 41, outros: 15 },
  { month: "Fev", facebook: 305, loja: 15, redesSociais: 60, outros: 30 },
  { month: "Mar", anuncios: 237, loja: 190, redesSociais: 47, outros: 97 },
  { month: "Abr", anuncios: 73, loja: 60,  redesSociais: 154, outros: 8 },
  { month: "Mai", anuncios: 85, loja: 170, redesSociais: 39, outros: 15 },
  { month: "Jun", anuncios: 214, loja: 175, redesSociais: 39, outros: 19 },
]

const chartConfig = {
  facebook:{
    label:"Facebook"
  },
  instagram:{
    label:"Instagram"
  },
  whatsapp:{
    label:"Whatsapp"
  },
  olx:{
    label:"Olx"
  }
} satisfies ChartConfig

type Contagem = {
  facebook:number
  olx:number
  instagram:number
  whatsapp:number;
  outros:number
};

type Dado = {
  data: string;
  contagem: Contagem;
};

type AgrupamentoDados = {
  agrupamento: string;
  dataInicio: string;
  dataFim: string;
  dados: Dado[];
};

export function ChartServiceOrigin() {


  const [data,setData] = useState<AgrupamentoDados>()    
  const [loading,setLoading] = useState<boolean>(true)
  const [filtros,setFiltros] = useState<any>({
    agrupamento:"mensal",
    periodo:{
      from:null,
      to:null
    }

  })

  async function load(){
    setLoading(true)
    const [response,error] = await api.get(`/loja/dashboard/origem-atendimentos${
        api.query.searchInMemoryQuerys({
          agrupamento:filtros.agrupamento,
          dataInicio: filtros.periodo.from ? filtros.periodo.from.toISOString() : null,
          dataFim: filtros.periodo.to ? filtros.periodo.to.toISOString() : null
        })
    }`);
    if(error){
        return toast.error(error.message)
    }
    console.log(response.data)
    setLoading(false)
    setData(response.data)
}

function setPeriodo(value:any){
  setFiltros((old:any)=>{
      return{
        ...old,
        periodo:value ?? {
          from:null,
          to:null
        }
      }
    })
}
  useEffect(()=>{
    load()
  },[filtros])


  return (
    <div className="w-full bg-white p-4 rounded-2xl">

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#1B263A] text-[1.25rem]">Origem dos atentimentos</h2>
        <div className="flex items-center gap-2">
          <SelectMin
            options={[{
                label: "Ano",
                value: "anual",
              }, {
                label: "Mês",
                value: "mensal",
              }, {
                label: "Semana",
                value: "semanal",
              }, {
                label: "Dia",
                value: "diario",
              }]}
              value={filtros.agrupamento}
            onChange={(value)=>{setFiltros((old:any)=> {
              return {
                ...old,
                agrupamento: value
              }
            })}} />
              <CalendarSelect default={1} range={filtros.periodo} setRange={(value)=>{setPeriodo(value)}}/>
        </div>
      </div>
      
      {   
        (loading || !data) 
          ?
          <div className="flex justify-center items-center w-full p-3">
            
            <LoadingGlobal minH="min-h-[130px]"/>
          </div> 
          :
          <>
          <div className="w-full mt-6">
          <ChartContainer config={chartConfig} className="min-h-[16.25rem] h-[16.25rem] w-full">
            <LineChart
              accessibilityLayer
              data={data.dados.map((obj,i)=>{
                const date = new Date(obj.data);
                let name;
                if(filtros.agrupamento === "mensal") {
                  name = date.toLocaleString("pt-br", { month: "long" });
              }
                if(filtros.agrupamento === "anual") {
                    name = date.toLocaleString("pt-br", { year: "numeric" });
                }
                if(filtros.agrupamento === "diario") {
                    name = date.toLocaleString("pt-br", { day: "numeric" });
                }
                if(filtros.agrupamento === "semanal") {
                    const weekNumber = Math.ceil((date.getDate() - date.getDay()) / 7);
                    name = `Semana ${weekNumber}`;
                }
                if(filtros.agrupamento === "trimestral") {
                    const quarter = Math.floor((date.getMonth() + 3) / 3);
                    name = `Trimestre ${quarter}`;
                }
              
                return{
                  month: name,
                  ...obj.contagem
                }
              })}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="facebook"
                type="linear"
                stroke="#D33632"
                strokeWidth={1}
                dot={true}
                fill="#D33632"
              />
              <Line
                dataKey="whatsapp"
                type="linear"
                stroke="green"
                strokeWidth={1}
                dot={true}
                fill="green"
              />
              <Line
                dataKey="olx"
                type="linear"
                stroke="#85A3DC"
                strokeWidth={1}
                dot={true}
                fill="#85A3DC"
              />
              <Line
                dataKey="instagram"
                type="linear"
                stroke="#0F1522"
                strokeWidth={1}
                dot={true}
                fill="#0F1522"
              />
              <Line
                dataKey="outros"
                type="linear"
                stroke="#4A6395"
                strokeWidth={1}
                dot={true}
                fill="#4A6395"
              />
            </LineChart>
          </ChartContainer>
      </div>

      <div className="flex gap-2 items-center justify-between">
          <ItemChart color="#0F1522" text="Instagram"/>
          <ItemChart color="#D33632" text="Facebook"/>
          <ItemChart color="#85A3DC" text="Olx"/>
          <ItemChart color="green" text="Whatsapp"/>
          <ItemChart color="#4A6395" text="Outros"/>
      </div>
      </>
      
      }
    </div>
    
  )
}

export function ItemChart ( { color, text } : {color: string, text: string}) { return (
  <div className="flex items-start gap-1.5 mt-2">
    <div className="w-2 h-2  translate-y-[3px] rounded-full border font-bold border-gray-100" style={{backgroundColor:color}}></div>
    <span className="text-[#C8CCD2] font-bold text-xs">{text}</span>
  </div>
)}
