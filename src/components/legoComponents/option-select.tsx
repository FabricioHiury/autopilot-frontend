import IconCheck from '../icons/icon-check';

interface Props {
  select: VoidFunction;
  option: { value: any; label: string };
  isSelected: boolean;
}

export default function OptionSelect({ select, option, isSelected }: Props) {
  return (
    <button
      onClick={select}
      className="hover:bg-slate-200 ease-in-out text-[#566B99] duration-300 p-2 pl-3 text-left flex justify-between items-center"
    >
      {option.label}
      {isSelected && <IconCheck size={12} />}
    </button>
  );
}
