import Spinner from '@/components/loading/Spinner';

interface props {
  background?: string;
  color?: string;
  border?: string;
  label: string;
  icon?: string;
  width?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
}
const ButtonIcon: React.FC<props> = ({
  label,
  background = 'hsl(var(--secondary))',
  color = '#F2F4F7',
  icon,
  onClick,
  width = '100%',
  border,
  loading,
}) => {
  return (
    <button
      onClick={onClick}
      className="relative gap-2 rounded-lg font-semibold flex items-center justify-center p-3 text-sm"
      style={{ background: background, color: color, width: width, border: border }}
    >
      {!loading ? (
        <>
          {label}
          {icon != '' ? <img src={icon} alt="" /> : ''}
        </>
      ) : (
        <Spinner width="26px" color="white" />
      )}
    </button>
  );
};

export default ButtonIcon;
