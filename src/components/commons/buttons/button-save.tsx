import { IconSave } from '@/components/icons/icon-save';

export interface ButtonSaveProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
}

export default function ButtonSave({ title = 'Salvar', ...props }: ButtonSaveProps) {
  return (
    <button
      className="group flex items-center justify-end w-full h-12 md:w-fit bg-[#1B263A] rounded-[.5rem] disabled:opacity-30 disabled:cursor-not-allowed"
      {...props}
    >
      <span className="flex justify-center text-white w-full md:min-w-[5rem] font-semibold text-sm">
        {title}
      </span>
      <div className="flex-shrink-0 w-[3rem] h-full transition-colors ease-in-out duration-200 text-[hsl(var(--primary))] flex items-center justify-center border-l border-[#455471] rounded-r-[.5rem] group-hover:text-primary-foreground group-hover:bg-[hsl(var(--primary))] ">
        <IconSave fill="currentColor" />
      </div>
    </button>
  );
}
