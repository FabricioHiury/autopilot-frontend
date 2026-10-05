export function Title({ label }: { label: string }) {
  return <h1 className="text-[hsl(var(--secondary))] font-semibold text-[32px]">{label}</h1>;
}

export function SubTitle({ label }: { label: string }) {
  return <h2 className="text-[#24292E] text-[18px] font-semibold">{label}</h2>;
}
