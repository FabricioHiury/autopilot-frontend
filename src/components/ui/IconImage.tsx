interface props {
  icon: string;
  background?: string;
  rounded?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const IconImage: React.FC<props> = ({
  icon,
  onClick,
  background = '#F2F4F7',
  rounded = '12px',
}) => {
  const fullClass = 'bg-[' + background + ']';

  return (
    <>
      <button
        className={'flex flex-shrink-0 justify-center h-10 w-10 items-center p-2' + ' ' + fullClass}
        onClick={onClick}
        style={{ borderRadius: rounded }}
      >
        <img src={icon} alt="" className="object-contain" />
      </button>
    </>
  );
};

export default IconImage;
