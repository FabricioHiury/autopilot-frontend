"use client";

import React from "react";
import { Ranking } from "@/model/relatorio-atendimento-canal";

interface RankingCanaisProps {
  ranking?: Ranking;
  taxaMedia?: number; // opcional, exibe como pill de porcentagem
  className?: string;
}

export default function RankingCanais({ ranking, taxaMedia, className }: RankingCanaisProps) {
  const leadTop = ranking?.porLeads?.find((i) => i.posicao === 1) || ranking?.porLeads?.[0];
  const convTop = ranking?.porConversas?.find((i) => i.posicao === 1) || ranking?.porConversas?.[0];

  const getIconPath = (canal: string) => {
    const iconMap: { [key: string]: string } = {
      facebook: "/icons/facebook.svg",
      instagram: "/icons/instagram.svg",
      olx: "/icons/olx.svg",
      whatsapp: "/icons/whatsapp.svg",
      outros: "/icons/outros.svg",
      webmotors: "/avatar/avatar_webmotors.webp",
      icarros: "/avatar/avatar_icarros.webp",
      mobiauto: "/avatar/avatar_mobiauto.webp",
      usadosbr: "/avatar/avatar_usadosbr.webp",
      showroom: "/avatar/avatar_showroom.webp",
      ligacao: "/avatar/avatar_ligacao.webp",
      mercadolivre: "/icons/outros.svg",
      site: "/icons/site.svg",
    };
    return iconMap[(canal || "").toLowerCase()] || "/icons/outros.svg";
  };

  const PercentPill = ({ value }: { value?: number }) => (
    <div className="flex items-center bg-gray-100 rounded-full h-7 px-3 text-sm font-semibold text-gray-900">
      {value !== undefined ? `${Number(value).toFixed(0)}%` : ""}
    </div>
  );

  const isEmptyRanking = !ranking ||
    (!ranking.porLeads || ranking.porLeads.length === 0) &&
    (!ranking.porConversas || ranking.porConversas.length === 0);

  if (isEmptyRanking) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-md border border-gray-100 ${className || ""}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Seus Canais em Destaque</h3>
          {taxaMedia !== undefined && <PercentPill value={taxaMedia} />}
        </div>
        <p className="text-sm text-gray-600">Não há ranking de canais disponível.</p>
        <p className="text-xs text-gray-500 mt-1">Nenhum canal disponível para este período e modo selecionado.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md border border-gray-100 ${className || ""}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Seus Canais em Destaque</h3>
      </div>

      {leadTop && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Leads</span>
            {taxaMedia !== undefined && <PercentPill value={taxaMedia} />}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white border flex items-center justify-center">
                <img
                  src={getIconPath(leadTop.canal)}
                  alt={leadTop.nomeExibicao}
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/icons/outros.svg";
                  }}
                />
              </div>
              <div className="text-lg font-semibold text-gray-600 leading-tight">
                {leadTop.nomeExibicao}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {typeof leadTop.valor === "number" ? leadTop.valor.toLocaleString() : leadTop.valor}
            </div>
          </div>
          <div className="border-t border-gray-100 mt-3" />
        </div>
      )}

      {convTop && (
        <div className="mt-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Conversões</span>
            {taxaMedia !== undefined && <PercentPill value={taxaMedia} />}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white border flex items-center justify-center">
                <img
                  src={getIconPath(convTop.canal)}
                  alt={convTop.nomeExibicao}
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/icons/outros.svg";
                  }}
                />
              </div>
              <div className="text-lg font-semibold text-gray-600 leading-tight">
                {convTop.nomeExibicao}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {typeof convTop.valor === "number" ? convTop.valor.toLocaleString() : convTop.valor}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}