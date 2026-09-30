'use client'
import { useEffect, useState } from "react";
import AvatarUser from "../avatar-user";
import { Input } from "../../ui/input";
import { Skeleton } from "../../ui/skeleton";
import InputRadioOption from "./input-radio-option";
import sanitizar from "@/utils/classes/sanitizer/sanitizer";

export interface SelectPersonItemInterface {
    id: string;
    name: string;
    avatar?: string;
    metaData?: string[];
}

export interface ComboboxSelectPersonProps {
    value: SelectPersonItemInterface[];
    onValueChange: (person: SelectPersonItemInterface[]) => void;
    onSearch: (search: string) => Promise<SelectPersonItemInterface[]> | SelectPersonItemInterface[];
    placeholder?: string;
    selectColor?: "red" | "blue";
    unique?: boolean;
}

export function ComboboxSelectPerson({ value, placeholder, onValueChange, onSearch, selectColor = "red", unique }: ComboboxSelectPersonProps) {
    const [selected, setSelected] = useState<SelectPersonItemInterface[]>(value);
    const [search, setSearch] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<SelectPersonItemInterface[]>([]);

    const handleSearch = async () => {
        setSearchResult([])
        setSearching(true);
        const data = await onSearch(search)
        setSearching(false)
        setSearchResult(data)
    };

    useEffect(() => {
        setSelected(value || []);
    }, [value]);

    const handleSelect = (person: SelectPersonItemInterface) => {
        if (unique) {
            const isAlreadySelected = selected.find(p => p.id === person.id);
            const newValue = isAlreadySelected ? [] : [person];
            setSelected(newValue);
            onValueChange(newValue);
            return;
        }

        if (selected.length === 0) {
            onValueChange([person]);
            setSelected([person])
            return;
        }

        const selectedIsNew = !selected.find(p => p.id === person.id);
        const newValue = selectedIsNew ? [...selected, person] : selected.filter(p => p.id !== person.id);
        onValueChange(newValue);
        setSelected(newValue)
    }


    const onPressEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSearching(true);
            await handleSearch();
            setSearching(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={onPressEnter}
                    placeholder={placeholder} className="px-9" aria-label="Pesquisar pessoa" />

                <div className="absolute top-2.5 left-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#293856" viewBox="0 0 256 256"><path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z"></path></svg>
                </div>

                {searching && <div className="absolute top-2.5 right-3 animate-spin">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#D33632" viewBox="0 0 256 256"><path d="M140,32V64a12,12,0,0,1-24,0V32a12,12,0,0,1,24,0Zm84,84H192a12,12,0,0,0,0,24h32a12,12,0,0,0,0-24Zm-42.26,48.77a12,12,0,1,0-17,17l22.63,22.63a12,12,0,0,0,17-17ZM128,180a12,12,0,0,0-12,12v32a12,12,0,0,0,24,0V192A12,12,0,0,0,128,180ZM74.26,164.77,51.63,187.4a12,12,0,0,0,17,17l22.63-22.63a12,12,0,1,0-17-17ZM76,128a12,12,0,0,0-12-12H32a12,12,0,0,0,0,24H64A12,12,0,0,0,76,128ZM68.6,51.63a12,12,0,1,0-17,17L74.26,91.23a12,12,0,0,0,17-17Z"></path></svg>
                </div>}

                {search.length > 0 && !searching &&
                    <button onClick={handleSearch} className="absolute top-2.5 right-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#D33632" viewBox="0 0 256 256"><path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z"></path></svg>
                    </button>
                }
            </div>
            <div className="grid grid-cols-1 divide-y  max-h-[180px] scrollbar-mini overflow-y-auto data-[items=true]:animate-fade-in-top" data-items={selected.length > 0 || searchResult.length > 0}>

                {unique ? (
                    searchResult.map(person =>
                        <SelectPersonItem
                            key={person.id}
                            person={person}
                            onSelect={handleSelect}
                            selected={selected.find(obj => person.id === obj.id) ? true : false}
                            selectColor={selectColor}
                        />
                    )
                ) : (
                    <>
                        {searchResult.filter((r) => {
                            return !selected.find(obj => r.id === obj.id)
                        }).map(person =>
                            <SelectPersonItem
                                key={person.id}
                                person={person}
                                onSelect={handleSelect}
                                selected={selected.find(obj => person.id === obj.id) ? true : false}
                                selectColor={selectColor}
                            />
                        )}

                        {selected.length >= 0 && selected.map(person =>
                            <SelectPersonItem
                                key={person.id}
                                person={person}
                                onSelect={handleSelect}
                                selected={true}
                                selectColor={selectColor}
                            />
                        )}
                    </>
                )}

                {searching &&
                    <div className="flex gap-2 items-center justify-between py-3 text-sm">
                        <div className="flex gap-2">
                            <Skeleton className=" block w-[2rem] h-[2rem] rounded-full" />
                            <div className="flex flex-col items-start gap-2">
                                <Skeleton className="w-[10rem] h-3" />
                                <Skeleton className="w-[5rem] h-2" />
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

interface SelectPersonItemProps {
    person: SelectPersonItemInterface,
    selected: boolean,
    onSelect: (person: SelectPersonItemInterface) => void
    selectColor: "red" | "blue";
}

function SelectPersonItem({ person, selected, onSelect, selectColor }: SelectPersonItemProps) {
    const handleSelect = () => {
        onSelect(person);
    }

    const name = person.name || 'Usuário';
    const selectedItemColor = selectColor === 'red' ? '#D33632' : '#485B80';

    return (
        <button onClick={handleSelect} className="flex gap-2 items-center justify-between py-3 px-2 text-sm transition-colors hover:bg-[#DDE6F2]/20">
            <div className="flex items-center gap-2">
                <AvatarUser src={person.avatar} name={name} size={2} />
                <div className="flex flex-col items-start">
                    <div className="font-semibold text-[14px] text-[#293856]">{person.name}</div>
                    <div className="flex text-[12px] text-[#293856]">
                        {person.metaData && person.metaData.length > 0 && person.metaData[0] && sanitizar?.telefone(person.metaData[0].toString(), false)}
                    </div>
                </div>
            </div>
            <div>
                <InputRadioOption selected={selected} color={selectedItemColor} />
            </div>
        </button>
    )
}