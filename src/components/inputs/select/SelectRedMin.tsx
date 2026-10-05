import IconArrow from '@/components/nav/icons/arrow-icon';
import { useEffect, useState } from 'react';
import FocusBlock from './FocusBlock';
import DropBlock from '@/components/lego/drop-block';

interface Option {
  label: string;
  value: string;
}

interface props {
  label?: string;
  options: Option[];
  flexLevel?: string;
  value?: string;
  onChange: (selectedOption: Option) => void;
}

const SelectRedMin: React.FC<props> = ({
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
    onChange(op);
    dropDead();
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
          'flex flex-col gap-0 relative shrink-0 grow w-full transition-all duration-200' +
          ' ' +
          flexLevel
        }
      >
        <FocusBlock
          containersWithinFocus={[]}
          setVisibleBlock={setIsDroped}
          className="relative min-w-[110px]"
        >
          <button
            className={
              (isDroped ? 'border-[#485B80] rounded-b-none' : '') +
              ' ' +
              'flex cursor-pointer justify-between text-[#24292E] font-medium text-[14px]' +
              ' ' +
              'items-center w-full gap-2 rounded-xl bg-[#F2F4F7] px-[16px] z-10 py-[6px]'
            }
            onClick={() => {
              toggleDrop();
            }}
          >
            {selectedOption.label}
            <IconArrow
              stroke="hsl(var(--primary))"
              className="translate-y-[-1px]"
              width={12}
              height={12}
            />
          </button>
          <DropBlock
            isDrop={isDroped}
            className="flex flex-col z-10 absolute w-full overflow-y-auto scroll-padrao max-h-[102px] top-[100%] bg-white rounded-lg text-[12px] "
          >
            {options.map((op: Option, key: number) => (
              <button
                className="p-2 px-4 cursor-pointer hover:bg-slate-300"
                onClick={() => {
                  changeOption(op);
                }}
                key={key}
              >
                {op.label}
              </button>
            ))}
          </DropBlock>
        </FocusBlock>
      </div>
    </>
  );
};

export default SelectRedMin;
