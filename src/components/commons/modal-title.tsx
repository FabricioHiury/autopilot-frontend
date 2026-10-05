import IconX from '../icons/icon-x';

export const ModalTitle = ({
  title,
  onClose,
  padrao = 0,
}: Readonly<{ title: string; onClose?: any; padrao?: number }>) => {
  if (padrao == 0)
    return (
      <div className="flex w-full items-center justify-between">
        <h2 className="text-lg md:text-[1.75rem] leading-none font-semibold text-[#1B263A]">
          {title}
        </h2>
        <button onClick={onClose} className="">
          <IconX />
        </button>
      </div>
    );
  else
    return (
      <div className="flex w-full items-center justify-between">
        <h2 className="text-[16px]  leading-none font-semibold text-[#657380]">{title}</h2>
        <button onClick={onClose} className="">
          <IconX color="hsl(var(--primary))" />
        </button>
      </div>
    );
};
