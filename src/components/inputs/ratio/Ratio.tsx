import InputRadioOption from '@/components/commons/inputs/input-radio-option';
import { optionType } from '@/types/customer';
import { useEffect, useState } from 'react';

interface props {
  label: string;
  options: optionType[];
  onChange: (option: optionType) => void;
  value: string;
}

const Ratio: React.FC<props> = ({ label = 'Insira sua label', onChange, options, value }) => {
  const [selected, setSelected] = useState<optionType>(options[0]);

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  useEffect(() => {
    if (value) {
      setSelected(options.find((obj) => obj.value === value) ?? options[0]);
    }
  }, [value]);
  return (
    <>
      {/* <div className="flex flex-col lg:flex-row justify-between w-full">
            <h1 className="text-field text-[#485B80] text-[12px] font-semibold">{label}</h1>
            <div className="flex flex-row gap-6 justify-between items-center">
                {
                options.map((obj,index)=>{
                    return(
                        <div key={index} className="flex items-center justify-center gap-2 outline-none bg-none">
                            <button className={"rounded-full overflow-hidden w-4 h-4 flex-shrink-0 border border-[#DDE6F2]"+" "+
                            "flex items-center justify-center"+ (selected.name==obj.name ? " bg-[#485B80]" : "")} onClick={()=>setSelected(obj)}>
                                <img className="object-contain" src="/icons/check.svg" alt="" />
                            </button>
                            <span className="text-[12px] text-[hsl(var(--secondary))]">{obj.name}</span>
                        </div>

                    )
                })
                }
            </div>
        </div> */}

      <div className="flex justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <div className="flex gap-3">
          {options.map((obj, index) => (
            <div className="flex gap-2 items-center" key={index}>
              <InputRadioOption
                selected={selected.name == obj.name}
                color="#485B80"
                onChange={() => setSelected(obj)}
                id={`id-${obj.name}`}
              />
              <label
                className="text-[#485B80] text-sm font-semibold cursor-pointer"
                htmlFor={`id-${obj.name}`}
              >
                {obj.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Ratio;
