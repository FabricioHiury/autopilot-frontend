'use client'

import React, { useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select-custom"

export interface FilterSelectProps {
    options: {
        title: string;
        value: string;
    }[]
    selectedValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    classname?: string;
}


export default function FilterSelect( { options, selectedValue, placeholder, classname,onChange }: FilterSelectProps) {

    useEffect(()=>{
     if(onChange) {
      onChange(selectedValue ?? "")
     }
    },[selectedValue])
    return (
        <Select  defaultValue={selectedValue}>
          <SelectTrigger  className={classname || ''}>
            <SelectValue placeholder={placeholder || ''}  />
          </SelectTrigger>
          <SelectContent >
            <SelectGroup >
                {options.map((option) => {
                    return(
                      <SelectItem key={option.value} value={option.value}>{option.title}</SelectItem>
                    )
                })}
            </SelectGroup>
          </SelectContent>
        </Select>
      )
}
