interface ButtonFilterProps {
  onClick: () => void;
  active: boolean;
  label: string;
  total?: number;
}

export const ButtonFilter = ({ onClick, active, label, total }: ButtonFilterProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 px-3 flex items-center justify-center gap-1 text-xs font-medium text-[#485B80] rounded-full border border-[#DDE6F2] bg-[#F7F9FC] transition-colors duration-200 whitespace-nowrap flex-shrink-0 w-fit hover:bg-[hsl(var(--secondary))] hover:text-white hover:border-[hsl(var(--secondary))] data-[active=true]:text-white data-[active=true]:bg-[hsl(var(--secondary))] data-[active=true]:border-[hsl(var(--secondary))] focus:outline-none focus:ring-2 focus:ring-[#85A3DC] active:scale-[0.98]"
      data-active={active}
      aria-selected={active}
    >
      <span>{label}</span>
      {active && typeof total === 'number' && (
        <span className="ml-1 text-[10px] font-semibold bg-white text-[hsl(var(--secondary))] px-2 py-[1px] rounded-full">
          {total}
        </span>
      )}
    </button>
  );
};
