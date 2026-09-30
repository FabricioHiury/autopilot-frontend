import IconCheck from "@/components/icons/icon-check"
import DropBlock from "@/components/lego/drop-block"
import FocusBlock from "@/components/lego/focus-block"
import ButtonOptionSelect from "@/components/legoComponents/button-select"
import OptionSelect from "@/components/legoComponents/option-select"
import IconArrow from "@/components/nav/icons/arrow-icon"
import { cn } from "@/lib/class-name.utils"
import { useEffect, useState } from "react"

interface Props{
    placeholder:string
    options:{value:any,label:string}[]
    setValue:(value:any)=>void
    value:any
    multiValue?:boolean
    OptionComponent?: React.ComponentType<{ option: { value: any; label: string },isSelected:boolean, select: VoidFunction }>;
    ButtonComponent?: React.ComponentType<{
        setDrop:VoidFunction,
        placeholder:string,
        isDrop:boolean}>;
}
export default function SelectSweet({placeholder,options,setValue,value,multiValue=false,OptionComponent=OptionSelect,ButtonComponent=ButtonOptionSelect}:Props){

    const [drop,setDrop] = useState<boolean>(false)

    function select(op: { value: any; label: string }) {
        if (multiValue) {

          let values = [];
          if(!value){
            values = [op.value]
          }
          else if(value.includes(op.value)){
            values = value.filter(((v:any)=>v!==op.value))
          } 
          else{
            values = [...value, op.value]
          }
          setValue(values)
          return;
        }
        setValue(op.value);
        setDrop(false)
    }


      
    useEffect(()=>{
        if(multiValue){
            setValue([])
        }
    },[])


    function isOptionIncluded(op:{value:any,label:string},v:any){
        if(!value) return false
        if(multiValue){
            if(value.some((obj:any)=>obj===op.value)){
                return true
            }
            return false
        }
        return op.value===value
    }
    function getPlaceholder(){

        if(multiValue){
            return placeholder
        }

        return value ? options.find((obj)=>obj.value===value)?.label : placeholder
    }


    return(
        <>
            <FocusBlock onDisable={()=>setDrop(false)} containersWithinFocus={[]} viewObject={drop} className="relative min-w-[150px]">
               <ButtonComponent  isDrop={drop} placeholder={getPlaceholder() ?? ""} setDrop={()=>setDrop(old=>!old)} />
                <DropBlock isDrop={drop} 
                className="flex flex-col z-10 absolute w-full overflow-y-auto scroll-padrao max-h-[102px] top-[100%] bg-white rounded-lg text-[12px] ">
                    {
                        options.map((obj,i)=>{
                            return(
                                <OptionComponent  isSelected={isOptionIncluded(obj,value)} option={obj} key={i} select={()=>select(obj)}/>
                            )
                        })
                    }
                </DropBlock>
            </FocusBlock>

        </>
    )
}
