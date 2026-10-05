'use client';
import ConteudoCardAtendimento from '@/components/sections/deals/conteudo-card-atentimento';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const path = useParams();
  const dealId = path.dealId as string;

  return (
    <main className="">
      <ConteudoCardAtendimento dealId={dealId} />
    </main>
  );
}
