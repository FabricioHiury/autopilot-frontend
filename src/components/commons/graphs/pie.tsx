/* eslint-disable no-shadow */
"use client"
import { PieChart, Pie, Cell } from 'recharts';


export default function PieDash({data,label,qtd,mainValue}:{mainValue:string,qtd:number,label:string,data:{name:string,value:number,color:string}[]}){

    const cx = 110;
    const cy = 110;
    const iR = 64;
    const oR = 100;
    
    return (
    <div className='relative items-center justify-center flex '>
      <PieChart width={223} height={172}>
        <Pie
          dataKey="value"
          startAngle={180}
          endAngle={0}
          data={data}
          cx={cx}
          cy={cy}
          innerRadius={iR}
          animationDuration={1700}
          animationEasing='ease-in-out'
          animationBegin={400}
          outerRadius={oR}
          fill="#8884d8"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>

      <b className='absolute text-[18px] font-bold' style={{color:data[0].color}}>{mainValue}</b>
      <b className='absolute text-[#1B263A] translate-y-8 text-[16px] font-semibold'>{label}</b>
      <div className='absolute text-[#1B263A] leading-3 translate-y-16 text-[16px] font-semibold flex items-center gap-2'>
        <div className="rounded-full aspect-square w-3 translate-y-[-1px]" style={{background:data[0].color}}></div>
        {label}
        <b className='font-bold' style={{color:data[0].color}}>{qtd}</b>


      </div>
        
    </div>
    );
}