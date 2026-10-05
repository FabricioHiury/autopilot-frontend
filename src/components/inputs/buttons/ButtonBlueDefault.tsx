import Spinner from '@/components/loading/Spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/class-name.utils';

interface props {
  label: string;
  height?: string;
  loading?: boolean;
  text?: string;
  padding?: string;
  className?: string;
  onClick: (event: any) => void;
  [key: string]: any;
}

const ButtonBlueDefault: React.FC<props> = ({
  height = '56px',
  label = 'Insira sua label',
  text = 'text-[14px]',
  padding = 'px-4',
  onClick,
  loading,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <Button
      className={cn(
        'bg-[#1B263A] p-0 h-[48px] max-h-[48px] flex justify-center items-center text-[#EBEEEF] rounded-xl text-[14px]',
        className,
      )}
      onClick={onClick}
      style={{ height: height }}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <div className={'flex w-full  justify-center items-center ' + padding}>
          <Spinner color="white" width="24px" />
        </div>
      ) : (
        <>
          <span className={'font-medium text-center w-full ' + padding + ' ' + text}>{label}</span>
          <div
            className={
              'flex items-center justify-center border-l border-[#455471] h-full  w-[48px] aspect-square'
            }
          >
            <img
              src="/icons/plus_button.svg"
              alt=""
              className="w-[12px] aspect-square flex-grow-0 flex-shrink-0"
            />
          </div>
        </>
      )}
    </Button>
  );
};

export default ButtonBlueDefault;
