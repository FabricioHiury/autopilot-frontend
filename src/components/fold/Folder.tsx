export default function Folder({
  position,
  setPosition,
  onNewFolder,
  folders,
}: {
  position: number;
  setPosition: Function;
  onNewFolder: Function;
  folders: string[];
}) {
  return (
    <div className="flex flex-row flex-wrap items-start gap-2 w-full">
      <div className="flex flex-row gap-3 h-11 scroll-padrao overflow-x-auto overflow-y-hidden">
        {folders.map((obj, i) => {
          return (
            <button
              onClick={() => {
                setPosition(i);
              }}
              key={i}
              className={
                (i === position
                  ? 'border-[hsl(var(--primary))] text-[#434D56]'
                  : 'border-transparent text-[#95A3B2]') +
                ' ' +
                'h-7  border-b-2 flex-shrink-0 duration-300 ease-in-out text-[14px] font-semibold'
              }
            >
              {obj}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onNewFolder()}
        className=" group h-7 flex-shrink-0  flex items-center font-semibold justify-center
         text-[#95A3B2] hover:text-[hsl(var(--primary))] duration-500 ease-in-out text-[14px] gap-2 border-b-2 border-transparent hover:border-[hsl(var(--primary))]"
      >
        Adicionar novo
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          className="fill-[#95A3B2] -translate-y-[1px] duration-500 ease-in-out group-hover:fill-[hsl(var(--primary))]"
          viewBox="0 0 256 256"
        >
          <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
        </svg>
      </button>
    </div>
  );
}
