import Spinner from '@/components/loading/Spinner';
import { cn } from '@/lib/class-name.utils';

export function BtnTransparent({
  label,
  onClick,
  loading,
}: {
  label: string;
  onClick: VoidFunction;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'text-[#586E9D] min-w-24 rounded-lg relative ease-in-out duration-300',
        ' group flex justify-center items-center  font-semibold text-[14px] p-3 px-3 border hover:border-neutral-500  border-[#B1BCD3]',
        loading ? 'bg-slate-800' : 'hover:bg-white',
      )}
    >
      {loading ? <Spinner color="white" width="20px" /> : label}
    </button>
  );
}
export function BtnStrong({
  label,
  onClick,
  loading,
  padding = 'p-3 px-3',
}: {
  label: string;
  onClick: VoidFunction;
  loading?: boolean;
  padding?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={
        'text-white min-w-24 flex justify-center items-center bg-[hsl(var(--secondary))]  hover:bg-slate-950 ' +
        +' ' +
        'ease-in-out duration-300 rounded-lg font-semibold text-[14px] flex-grow-0 ' +
        padding
      }
    >
      {loading ? <Spinner color="white" width="20px" /> : label}
    </button>
  );
}
