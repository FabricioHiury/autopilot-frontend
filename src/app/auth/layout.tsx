import { Suspense } from 'react';

export default function AutenticacaoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="flex flex-col lg:flex-row-reverse min-h-screen lg:h-screen lg:overflow-hidden relative">
        <Suspense>{children}</Suspense>
      </main>
    </>
  );
}
