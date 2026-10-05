import { Input } from '@/components/ui/input';
import { cn } from '@/lib/class-name.utils';

export interface PesquisarAtendimentosProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  classNameBar?: string;
}

export default function InputPesquisarBlue({
  placeholder,
  value,
  onChange,
  className,
  classNameBar,
}: PesquisarAtendimentosProps) {
  const classNames = cn(' bg-white text-zinc-700', className);
  const classNamesBar = cn('relative', classNameBar);

  return (
    <div
      className={
        classNamesBar +
        ' ' +
        'relative border border-input rounded-lg bg-transparent px-0 flex-grow pl-10 py-0 p-0 h-[48px] flex items-center'
      }
    >
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className="text-[14px] bg-transparent text-[#818D97] w-full outline-none"
        aria-label="Pesquisar atendimentos"
      />
      <div className="absolute left-3">
        <svg
          width="19"
          height="18"
          viewBox="0 0 19 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="9.1" cy="8.6" r="7.6" stroke="#434D56" strokeWidth="1.3" />
          <path d="M14.7 14.2L17.5 17" stroke="#434D56" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
