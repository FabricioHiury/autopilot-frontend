
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

export default function BarCustom({data,totalAssinaturas,totalCancelamentos}:{totalAssinaturas:number,totalCancelamentos:number,data:{mes:string,assinaturas:number,cancelamentos:number}[]}){
    const dataFormatted = data.map((obj)=>{
        return {
            //pegando os tres primeiros caracteres da string
            name:obj.mes.substring(0,3),
            assinaturas:obj.assinaturas,
            cancelamentos:obj.cancelamentos
        }
    })
    return (
        <div className="relative flex items-center justify-center flex-col w-full h-full ">
            <div className="flex  gap-2 lg:gap-10 flex-wrap text-[#6C7788] font-medium text-[12px] items-center">
                <div className="flex gap-1 items-center">
                    <div className="bg-[#293856] w-2 flex-shrink-0 aspect-square rounded-full"></div>
                    Assinaturas de plano ({totalAssinaturas})
                </div>
                <div className="flex gap-1 items-center">
                    <div className="bg-[#D33632] w-2 flex-shrink-0 aspect-square rounded-full"></div>
                    Cancelamentos de plano ({totalAssinaturas})
                </div>
            </div>
            <div className="overflow-x-auto scroll-padrao p-3 pb-0 px-0 -pl-2 w-full h-[200px]">
                <ResponsiveContainer className={"flex-shrink-0"} width={800}>
                    <BarChart
                    width={800}
                    height={100}
                    data={dataFormatted}
                    barGap={12}
                    barSize={12}  
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar  dataKey="assinaturas" fill="#293856"  />
                    <Bar dataKey="cancelamentos" fill="#D33632"  />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

}

