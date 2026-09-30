import { Input } from "@/components/ui/input";
import { cn } from "@/lib/class-name.utils";

export interface PesquisarAtendimentosProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function PesquisarAtendimentos({ value, onChange, className }: PesquisarAtendimentosProps) {

    const classNames = cn(
        "px-9 bg-white text-zinc-700",
        className
    )

    return (
        <div className="relative">
            <Input
                value={value}
                onChange={(e) => {
                    const raw = e.target.value;
                    onChange(raw);
                }}
                placeholder="Procurar em atendimentos"
                className={classNames}
                aria-label="Pesquisar atendimentos"
            />
            <div className="absolute top-2.5 left-3">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#293856"
                    viewBox="0 0 256 256"
                >
                    <path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z"></path>
                </svg>
            </div>
            {false && (
                <div className="absolute top-2.5 right-3 animate-spin">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="#D33632"
                        viewBox="0 0 256 256"
                    >
                        <path d="M140,32V64a12,12,0,0,1-24,0V32a12,12,0,0,1,24,0Zm84,84H192a12,12,0,0,0,0,24h32a12,12,0,0,0,0-24Zm-42.26,48.77a12,12,0,1,0-17,17l22.63,22.63a12,12,0,0,0,17-17ZM128,180a12,12,0,0,0-12,12v32a12,12,0,0,0,24,0V192A12,12,0,0,0,128,180ZM74.26,164.77,51.63,187.4a12,12,0,0,0,17,17l22.63-22.63a12,12,0,1,0-17-17ZM76,128a12,12,0,0,0-12-12H32a12,12,0,0,0,0,24H64A12,12,0,0,0,76,128ZM68.6,51.63a12,12,0,1,0-17,17L74.26,91.23a12,12,0,0,0,17-17Z"></path>
                    </svg>
                </div>
            )}
            {true && (
                <button
                    onClick={(e) => { }}
                    className="absolute top-2.5 right-3"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="#D33632"
                        viewBox="0 0 256 256"
                    >
                        <path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z"></path>
                    </svg>
                </button>
            )}
        </div>
    )
}