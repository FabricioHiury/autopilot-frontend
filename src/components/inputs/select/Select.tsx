import { useEffect, useState } from 'react';

interface Option {
  name: string;
  value: string;
}

interface props {
  label?: string;
  options: Record<string, any>;
  flexLevel?: string;
  value?: string;
  onChange: (selectedOption: Option) => void;
}

const Select: React.FC<props> = ({
  label = 'Insira sua label',
  onChange,
  options,
  flexLevel = 'flex-[1]',
  value,
}) => {
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [isDroped, setIsDroped] = useState(false);

  function toggleDrop() {
    setIsDroped((old) => !old);
  }
  function dropDead() {
    setIsDroped(false);
  }

  function changeOption(op: Option) {
    setSelectedOption(op);
    dropDead();
    onChange(op);
  }
  useEffect(() => {
    if (value) {
      setSelectedOption(options.find((obj: any) => obj.value === value) ?? options[0]);
    }
  }, [value]);

  return (
    <>
      <div
        className={
          'flex flex-col gap-0 relative w-full transition-all duration-200' + ' ' + flexLevel
        }
      >
        <span className="text-[14px] text-[hsl(var(--secondary))] font-semibold">{label}</span>

        <div
          className="relative w-full flex items-center text-[#6C7788] focus:text-[#485B80] text-sm"
          tabIndex={0}
          onBlur={dropDead}
        >
          <div
            className={
              (isDroped ? 'border-[#485B80] rounded-b-none' : '') +
              ' ' +
              'flex cursor-pointer justify-between items-center w-full gap-2 rounded border bg-white px-[16px] z-10 py-2'
            }
            onClick={() => {
              toggleDrop();
            }}
          >
            {selectedOption.name}
            <img src="/images/arrowDown.png" alt="" />
          </div>
          <ul
            className={
              (isDroped ? 'scale-y-100' : 'scale-y-0') +
              ' ' +
              'scroll-padrao border-t-0 rounded-t-none origin-top flex flex-col gap-0 top-[90%] border-[#485B80] w-full border color-black absolute bg-white rounded-md z-20 max-h-[100px] overflow-y-auto'
            }
          >
            {options.map((op: Option, key: number) => (
              <li
                className="py-2 px-4 border border-b border-slate-200 cursor-pointer hover:bg-slate-300"
                onClick={() => {
                  changeOption(op);
                }}
                key={key}
              >
                {op.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Select;
