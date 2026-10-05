import { useState } from 'react';

interface props {
  placeholder: string;
  onSearch: Function;
  onBlur?: Function;
  inputContainer?: any;
}

const SearchTwo: React.FC<props> = ({ placeholder, onSearch, onBlur, inputContainer }) => {
  const [value, setValue] = useState<string>('');

  async function search() {
    onSearch();
  }

  function blur(event: any) {
    if (onBlur) onBlur(event);
  }

  return (
    <>
      <div className="gap-2 flex h-12 lg:h-10 justify-between flex-grow bg-[#1B263A] text-[#485B80] text-[14px] font-normal rounded-lg p-2 px-3">
        <input
          ref={inputContainer}
          type="text"
          className="border-none outline-none bg-transparent text-white w-full"
          value={value}
          onKeyDown={(event) => {
            if (event.key == 'Enter') {
              search();
            }
          }}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          placeholder={placeholder}
          onBlur={blur}
        />
        <button className="border-none outline-none p-0 m-0 w-8" onClick={search}>
          <svg
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_642_14916)">
              <path
                d="M11.8069 12.6902C11.5103 12.3936 11.5103 11.9126 11.8069 11.616C12.1035 11.3194 12.5845 11.3194 12.8811 11.616L15.9193 14.6542C16.2159 14.9508 16.2159 15.4318 15.9193 15.7284C15.6227 16.025 15.1418 16.025 14.8451 15.7284L11.8069 12.6902Z"
                fill="white"
              />
              <path
                d="M9.30561 12.1527C11.4031 12.1527 13.1033 10.4524 13.1033 8.3549C13.1033 6.25749 11.4031 4.55718 9.30561 4.55718C7.20817 4.55718 5.50786 6.25749 5.50786 8.3549C5.50786 10.4524 7.20817 12.1527 9.30561 12.1527ZM9.30561 13.6718C6.3692 13.6718 3.98877 11.2914 3.98877 8.3549C3.98877 5.41852 6.3692 3.03809 9.30561 3.03809C12.242 3.03809 14.6225 5.41852 14.6225 8.3549C14.6225 11.2914 12.242 13.6718 9.30561 13.6718Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_642_14916">
                <rect width="20" height="20" fill="white" transform="translate(0.117188)" />
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>
    </>
  );
};

export default SearchTwo;
