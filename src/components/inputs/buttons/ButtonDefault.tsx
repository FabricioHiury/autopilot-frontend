interface props{
    background?:string,
    color?:string,
    label:string,
    width?:string
    onClick?: React.MouseEventHandler<HTMLButtonElement>,
    children?: React.ReactNode
}

const ButtonDefault: React.FC<props> = ({label,background="#7F8999",color="#F2F4F7",onClick,children,width="100%"}) =>{

    return(
        <button onClick={onClick} className="relative  rounded-xl font-semibold flex items-center justify-center px-2 py-3 text-[12px]" style={{background:background,color:color,width:width}}>
            {children}
            {label}
        </button>
    )
} 

export default ButtonDefault