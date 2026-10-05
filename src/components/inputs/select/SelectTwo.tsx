import { useEffect, useRef, useState } from 'react';

interface Option {
  name: string;
  value: string;
}

interface props {
  label?: string;
  options: Option[];
  selectedOptions: any | any[];
  setSelectedOptions: Function;
  onBlur: Function;
  focusAnother?: Function;
  selectContainer?: any;
}

const SelectTwo: React.FC<props> = ({
  label = 'Insira sua label',
  options,
  selectedOptions,
  setSelectedOptions,
  selectContainer,
  onBlur,
  focusAnother,
}) => {
  const [isDroped, setIsDroped] = useState(false);

  function toggleDrop() {
    setIsDroped((old) => !old);
  }
  function dropDead() {
    setIsDroped(false);
  }

  useEffect(() => {
    if (selectContainer && isDroped) {
      selectContainer.current.focus();
    }
  }, [selectContainer, isDroped]);

  function select(op: Option) {
    setSelectedOptions(op);
    if (focusAnother) focusAnother();
    dropDead();
  }

  function blur(event: any) {
    const elemento = event.relatedTarget;
    if (selectContainer.current && !selectContainer.current.contains(elemento)) {
      dropDead();
    } else if (selectContainer.current) {
      setTimeout(() => {
        selectContainer.current.focus();
      }, 50);
    }
    onBlur();
  }

  return (
    <>
      <div className="flex items-start flex-col *:text-[12px] text-left *:text-white relative">
        <b>{label}</b>
        <button
          onClick={toggleDrop}
          className="text-[10px] flex items-center gap-2 outline-none pointer-events-auto "
        >
          {selectedOptions ? selectedOptions.name : 'Selecionar'}
          <svg
            width="10"
            viewBox="0 0 14 14"
            className={'duration-500' + ' ' + (isDroped ? 'rotate-180' : '')}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_5_46510)">
              <path
                d="M11.9 4.9001L7.00002 9.1001L2.10003 4.9001"
                stroke="white"
                strokeWidth="2.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_5_46510">
                <rect
                  x="14"
                  width="14"
                  height="14"
                  rx="4.16667"
                  transform="rotate(90 14 0)"
                  fill="white"
                />
              </clipPath>
            </defs>
          </svg>
        </button>
        <div
          className={
            'flex flex-col absolute top-[100%] scroll-padrao left-0 outline-none bg-white min-w-40 overflow-hidden *:text-black w-full rounded-md max-h-[130px] overflow-y-auto' +
            ' ' +
            (isDroped ? '' : 'hidden')
          }
          onBlur={blur}
          tabIndex={-1}
          ref={selectContainer}
        >
          {options.map((option, key) => {
            return (
              <button
                key={key}
                className="hover:bg-slate-300 text-left duration-300 outline-none w-full p-3"
                onClick={() => select(option)}
              >
                {option.name}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default SelectTwo;
