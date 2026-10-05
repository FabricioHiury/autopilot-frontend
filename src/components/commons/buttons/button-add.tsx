import ButtonPlusIcon from './button-circle/icons/button-plus-icon';

export interface ButtonAddProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
}

export default function ButtonAdd({ title, ...props }: ButtonAddProps) {
  return (
    <button
      className="not:disabled:group flex items-center justify-end w-full h-12 md:w-fit bg-[#1B263A] rounded-[.5rem] disabled:opacity-80 disabled:cursor-not-allowed"
      {...props}
    >
      <span className="flex justify-center text-white w-full md:w-[9.5rem] font-semibold text-xs">
        {title}
      </span>
      <div className="flex-shrink-0 w-[3rem] h-full transition-colors ease-in-out duration-300 text-[hsl(var(--primary))] flex items-center justify-center border-l border-[#455471] rounded-r-[.5rem] group-hover:text-primary-foreground group-hover:bg-[hsl(var(--primary))] ">
        <ButtonPlusIcon />
      </div>
    </button>
  );
}
