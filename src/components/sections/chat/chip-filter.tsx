import IconX from "@/components/icons/icon-x";
import { cn } from "@/lib/class-name.utils";

interface ChipFilterProps {
    id: string;
    label: string;
    active?: boolean;
    onClick?: () => void;
    removable?: boolean;
    onRemove?: () => void;
    className?: string;
}

const CHANNEL_ICON_MAP: Record<string, string> = {
    whatsapp: "/icons/whatsapp.svg",
    instagram: "/icons/instagram.svg",
    facebook: "/icons/facebook.svg",
    olx: "/icons/olx.svg",
};

export default function ChipFilter({ id, label, active, onClick, removable, onRemove, className }: ChipFilterProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            data-selected={active}
            className={cn(
                "h-8 whitespace-nowrap w-fit flex-shrink-0 rounded-full border text-xs flex items-center gap-1",
                "border-[#DDE6F2] text-[#485B80] bg-white hover:bg-[#F2F4F7] hover:border-[#C8CCD2] transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[#85A3DC]",
                "data-[selected=true]:bg-[#293856] data-[selected=true]:text-white data-[selected=true]:border-[#293856]",
                CHANNEL_ICON_MAP[id] ? "px-2" : "px-3",
                className
            )}
            aria-pressed={!!active}
        >
            {CHANNEL_ICON_MAP[id] ? (
                <img
                    src={CHANNEL_ICON_MAP[id]}
                    alt={label}
                    className="w-4 h-4"
                />
            ) : (
                <span>{label}</span>
            )}
            {removable && (
                <span
                    className="ml-1 inline-flex items-center justify-center rounded-full p-0.5 bg-transparent hover:bg-white/30"
                    onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                    aria-label={`Remover filtro ${label}`}
                >
                    <IconX />
                </span>
            )}
        </button>
    );
}