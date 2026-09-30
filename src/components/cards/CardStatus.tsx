import { cn } from "@/lib/class-name.utils";




export default function CardStatus({ status }: { status: boolean }) {
  return (<>
    <div className="flex items-center gap-1 font-semibold p-1 px-2 rounded-lg text-[12px] bg-[#EDF2F7]">
      <div className={
        cn("w-1 h-1 flex-shrink-0 aspect-square bg-green-600 mb-1 rounded-full",
          (status ? "bg-green-600" : "bg-red-600")
        )}></div>
      {status ? "ativo" : "inativo"}
    </div>
  </>)
}