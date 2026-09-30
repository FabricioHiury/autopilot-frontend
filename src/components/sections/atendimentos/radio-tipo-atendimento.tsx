import { IconCar } from "@/components/icons/icon-car";
import { IconCarIn } from "@/components/icons/icon-car-in";
import { IconCarOut } from "@/components/icons/icon-car-out";
import { cn } from "@/lib/class-name.utils";

interface RadioTipoAtendimentosProps {
    value: 'todos' | 'compra' | 'venda' | 'consignado';
    onChange: (value: 'todos' | 'compra' | 'venda' | 'consignado') => void;
    className?: string;
}

export default function RadioTipoAtendimentos({value, onChange, className}: RadioTipoAtendimentosProps) {
    return (
        <div className="flex justify-start gap-4 md:gap-1 w-max">
            <ButtonFiltroAtendimento icon={<IconCar />} label="Todos" active={value === 'todos'} onClick={() => onChange('todos')} className={className} />
            <ButtonFiltroAtendimento icon={<IconCarIn />} label="Compra" active={value === 'compra'} onClick={() => onChange('compra')} className={className}/>
            <ButtonFiltroAtendimento icon={<IconCarOut />} label="Venda" active={value === 'venda'} onClick={() => onChange('venda')} className={className}/>
            <ButtonFiltroAtendimento icon={<IconCarOut />} label="Consignado" active={value === 'consignado'} onClick={() => onChange('consignado')} className={className}/>    
        </div>
    )    
}


function ButtonFiltroAtendimento({ icon, label, active, onClick, className}: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, className?: string}) {
    
    const classNames = cn(
        "flex text-sm gap-1 items-center p-1.5 px-2 rounded-[.25rem] transition-colors text-[#C8CCD2] bg-transparent data-[active=true]:text-white data-[active=true]:bg-[#485B80] data-[active=true]:font-semibold",
        className
    )

    return (
        <button className={classNames}  data-active={active} onClick={onClick}>
            {icon}
            <span>{label}</span>
        </button>
    );
}