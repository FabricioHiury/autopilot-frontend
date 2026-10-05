import { cn } from '@/lib/class-name.utils';
import IconArrow from '../nav/icons/arrow-icon';

export interface PropsButtonOption {
  setDrop: VoidFunction;
  placeholder: string;
  isDrop: boolean;
}
export default function ButtonOptionSelect({ setDrop, placeholder, isDrop }: PropsButtonOption) {
  return (
    <button
      onClick={setDrop}
      className={cn(
        'px-4 p-[10px] rounded-lg text-[#586E9D] border-2 w-full border-[#B1BCD3]' +
          'font-semibold text-[16px] flex items-center justify-between gap-6 ease-in-out duration-300 whitespace-nowrap ',
        isDrop ? 'pl-2 text-[#95A3B2]' : '',
      )}
    >
      {placeholder}
      <IconArrow className={cn(isDrop ? 'rotate-[180deg]' : '', 'ease-in-out duration-300')} />
    </button>
  );
}
