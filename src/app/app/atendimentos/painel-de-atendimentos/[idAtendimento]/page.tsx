'use client'
import ConteudoCardAtendimento from "@/components/sections/atendimentos/conteudo-card-atentimento";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const path = useParams();
  const idAtendimento = path.idAtendimento as string;

  return (
    <main className="">
      <ConteudoCardAtendimento idAtendimento={idAtendimento} />
    </main>
  );
}
