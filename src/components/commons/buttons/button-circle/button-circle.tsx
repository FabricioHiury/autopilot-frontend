import { cn } from '@/lib/class-name.utils';

export interface ButtonCircleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  alert?: boolean;
  className?: string;
}

export default function ButtonCircle({ icon, alert, className, ...props }: ButtonCircleProps) {
  const classes = cn(
    'group w-12 h-12 relative rounded-full border border-[#C8CCD2] text-[#1B263A] bg-white shrink-0 flex items-center justify-center transition-all ease-in-out hover:bg-[#1B263A] hover:text-[#C8CCD2] aria-selected:text-[#C8CCD2] aria-selected:bg-[#1B263A]',
    className,
  );

  return (
    <button {...props} className={classes}>
      {icon}
      {alert && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-[hsl(var(--primary))] rounded-full"></span>
      )}
    </button>
  );
}
