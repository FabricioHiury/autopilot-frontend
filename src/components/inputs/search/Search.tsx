interface SearchProps {
    placeholder: string;
    value: string;
    setValue: (value: string) => void;
    onSearch: () => void;
}

const Search: React.FC<SearchProps> = ({ placeholder, value, setValue, onSearch }) => {
    return (
        <>
            <div className="gap-2 flex h-12 lg:h-10 justify-between flex-grow bg-[#F2F4F7] text-[#485B80] text-[14px] font-normal rounded-lg p-2 px-3">
                <input
                    type="text"
                    className="border-none outline-none bg-transparent w-full"
                    value={value}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            onSearch();
                        }
                    }}
                    onChange={(event) => {
                        setValue(event.target.value);
                    }}
                    placeholder={placeholder}
                />
                <button
                    className="border-none outline-none p-0 m-0 w-8"
                    onClick={() => {
                        onSearch();
                    }}>
                    <img className="w-full object-contain" src="/icons/search.svg" alt="" />
                </button>
            </div>
        </>
    )
}

export default Search;