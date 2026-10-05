export function PageTitle({ title }: Readonly<{ title: string }>) {
  return (
    <h1 className="text-lg leading-5 md:text-[2rem] md:leading-none font-semibold text-[#1B263A]">
      {title}
    </h1>
  );
}
