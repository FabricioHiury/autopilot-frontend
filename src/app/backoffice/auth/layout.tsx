import { Suspense } from 'react';

export default function AutenticacaoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="flex flex-col lg:flex-row-reverse min-h-screen relative">
        <Suspense>{children}</Suspense>
      </main>
    </>
  );
}
