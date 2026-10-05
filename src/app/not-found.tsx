import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-white flex flex-col items-center justify-center w-full h-screen gap-4">
      <h2 className="font-bold text-3xl text-center">
        <span className="text-[12rem] opacity-30">404</span>
        <br />
        Página não encontrada
      </h2>
      <p>Não foi possível localizar o recurso solicitado.</p>
      <Link href="/" className="text-red-600 pt-10 font-semibold">
        Ir para a página inicial
      </Link>
    </div>
  );
}
