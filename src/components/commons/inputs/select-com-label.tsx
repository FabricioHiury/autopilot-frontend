'use client'
import { cn } from "@/lib/class-name.utils";
import { useEffect, useState } from "react";
import { SelectContent, SelectItem } from "../../ui/select-custom";
import * as Select from "@radix-ui/react-select";
import Spinner from "@/components/loading/Spinner";

export interface OptionSelectComLabelType {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

export interface SelectComLabelProps {
    value: string | undefined;
    label: string;
    options: OptionSelectComLabelType[];
    onChange: (value: string ) => void;
    placeholder?: string;
    disabled?: boolean;
    open?: boolean;
    className?: string;
    loading?:boolean
}

export default function SelectComLabel (props: SelectComLabelProps) {
    
    const { label, options, onChange, placeholder, className, disabled,loading } = props;
    
    const [open, setOpen] = useState(props.open || false);
    const [value, setValue] = useState(props.value);

    const handleOnChange = (value: string) => {
        setValue(value);
        onChange(value);
    }

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    return (
        <Select.Root open={open} onOpenChange={setOpen} onValueChange={handleOnChange}>
            
            <Select.Trigger className="w-full text-[#6C7788] disabled:cursor-not-allowed" disabled={disabled || loading===true}>
                
                <div
                className={cn(
                    "flex w-full items-center justify-between rounded-[0.5rem] border border-input bg-transparent px-3 py-1.5 text-sm transition-colors file:border-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}>
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-xs text-[#485B80] font-semibold">{label}</span>

                            {!value && <span className="text-muted-foreground">{loading===true ? "LoadingGlobal lista..." : placeholder}</span>}
                            {value && <div className="flex gap-1 items-center">
                                {options.find(option => option.value === value)?.icon} {options.find(option => option.value === value)?.label}
                            </div>}
                        </div>
                            <div className="w-3 h-3 flex items-center justify-center transition-transform data-[open=true]:rotate-180" data-open={open}>
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1.95093L6.00081 6.53093L11 1.95093" stroke="#7F8999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                </div>
           
            </Select.Trigger>

            {!disabled && <SelectContent className="text-[#6C7788]">
                {options.map(option => (
                    <SelectItem key={option.value} value={option.value} >
                        <div className="flex items-center gap-1">{option.icon} {option.label}</div>
                    </SelectItem>
                ))}
            </SelectContent>}
        </Select.Root>
    )

}