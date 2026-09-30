'use client'
import { cn } from "@/lib/class-name.utils";
import { useRef, useState } from "react";

export interface TextareaComLabelProps {
    value: string | undefined;
    label: string;
    onChange: (value: string ) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    height?: number;
}

export const TextareaComLabel = ({ value, label, onChange, placeholder, disabled, className }:TextareaComLabelProps ) => {

    const [isFocused, setIsFocused] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const onClick = () => textAreaRef.current?.focus();

    return (
        <div
            onClick={onClick}
            className={cn(
                "group rounded-[0.5rem] border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[focused=true]:border-red-600",
                className
            )}
            data-focused={isFocused}
        >
            <label className="text-xs text-[#485B80] font-semibold">{label}</label>
            <textarea
                ref={textAreaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full text-[#6C7788] border-transparent bg-transparent resize-none text-sm focus-visible:outline-none focus-visible:ring-transparent disabled:cursor-not-allowed disabled:opacity-50"
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
        </div>
    )
}