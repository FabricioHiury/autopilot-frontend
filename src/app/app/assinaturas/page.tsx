"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, ShieldCheck, Headset } from "lucide-react";
import PaymentForm from "@/components/stripe/PaymentForm";
import { ApiApp } from "@/lib/api-app";
import toast from "react-hot-toast";

type BillingPeriod = "mensal" | "anual";

type Plan = {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  periodo: "mensal" | "anual";
  recursos: string[];
  ativo: boolean;
};

const ANNUAL_DISCOUNT = 0.2;

export default function AssinaturasVitrineSimplificada() {
  const api = useMemo(() => new ApiApp(), []);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<BillingPeriod>("anual");
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const [resp, err] = await api.planos.listar();
      if (err) {
        toast.error("Não foi possível carregar os planos");
        setPlans([]);
      } else {
        const raw = (resp?.data?.planos || resp?.planos || []) as Plan[];
        const active = raw.filter((p) => p.ativo);
        const ordered = [...active].sort((a, b) => {
          const rank = (name: string) =>
            /premium/i.test(name) ? 3 : /pro|starter\+/i.test(name) ? 2 : 1;
          return rank(a.nome) - rank(b.nome);
        });
        setPlans(ordered.slice(0, 3));
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar os planos");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [api.planos]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const priceLabel = useCallback(
    (monthlyBase: number) => {
      if (billing === "anual") {
        const totalYear = Math.round(monthlyBase * 12 * (1 - ANNUAL_DISCOUNT));
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(totalYear);
      }
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(monthlyBase);
    },
    [billing]
  );

  const perLabel = billing === "anual" ? "por ano" : "por mês";

  const pickBullets = (all: string[]) =>
    (all?.filter(Boolean) ?? []).slice(0, 3);

  const recommendedId = plans[1]?.id;

  const handleChoose = (id: string) => {
    setSelectedPlanId(id);
    setShowCheckout(true);
  };

  const subscribe = useCallback(
    async (planId: string, paymentMethodId: string) => {
      setBusy(true);
      try {
        const [res, err] = await api.assinatura.criar(planId, paymentMethodId);
        if (err) {
          toast.error(err.message || "Erro ao processar assinatura");
          return;
        }
        if (res?.checkoutUrl) {
          window.location.href = res.checkoutUrl;
        } else {
          toast.success("Assinatura criada com sucesso");
          setShowCheckout(false);
          setSelectedPlanId(null);
        }
      } catch (e) {
        console.error(e);
        toast.error("Erro ao processar assinatura");
      } finally {
        setBusy(false);
      }
    },
    [api.assinatura]
  );

  const onPaymentSuccess = (pmId: string) => {
    if (selectedPlanId) subscribe(selectedPlanId, pmId);
  };

  const onPaymentError = (msg: string) => {
    toast.error(msg);
    setShowCheckout(false);
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] grid place-items-center">
        <div className="text-[#657380]">Carregando…</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section
        className="relative px-6 md:px-10 py-10 md:py-14 border-b overflow-hidden"
        style={{
          backgroundImage: "url('/images/car-bg-atendimento.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-white/90" aria-hidden="true" />

        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <p className="text-[#ad161c] text-xs font-medium uppercase tracking-wide">
            Central de assinaturas AutoPilot
          </p>
          <h1 className="text-[#1b2841] text-4xl md:text-5xl font-bold leading-tight">
            Planos feitos para acelerar seu crescimento
          </h1>
          <p className="text-[#6C778E]">
            Escolha o melhor para o seu momento: {billing === "anual" ? "economia anual" : "flexibilidade mensal"} com os mesmos recursos de alto impacto.
          </p>

          {billing === "anual" && (
            <span className="inline-flex items-center gap-1 text-xs text-[#D33632] bg-[#FFF2F2] border border-[#FFE0E0] rounded-full px-2.5 py-1">
              <Sparkles className="h-3 w-3" />
              Economize 20% no anual
            </span>
          )}

          <div className="w-full flex justify-center mt-3 inline-flex items-center gap-2">
            <div className="inline-flex bg-[#F2F4F7] border border-slate-200 rounded-full p-1">
              <button
                type="button"
                onClick={() => setBilling("mensal")}
                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${billing === "mensal" ? "bg-white text-[#1b2841] shadow" : "text-[#657380]"}`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setBilling("anual")}
                className={`px-4 py-1.5 text-sm rounded-full transition-colors inline-flex items-center gap-2 ${billing === "anual" ? "bg-white text-[#1b2841] shadow" : "text-[#657380]"}`}
              >
                Anual
                {billing !== "anual" && (
                  <span className="text-[10px] font-semibold text-[#d33632]">-20%</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 py-10">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
          {plans.map((p) => {
            const bullets = pickBullets(p.recursos);
            const recommended = p.id === recommendedId;

            return (
              <Card
                key={p.id}
                className={`relative border-0 shadow-sm overflow-hidden ${recommended ? "ring-2 ring-[#d33632]" : ""
                  }`}
              >
                {recommended && (
                  <div className="absolute -right-10 top-4 rotate-45 bg-[#d33632] text-white text-xs font-semibold px-12 py-1 shadow">
                    Recomendado
                  </div>
                )}

                {billing === "anual" && (
                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#d33632] via-[#ff6b6b] to-[#d33632]" />
                )}

                <CardContent className="pt-6 pb-6">
                  <div className="text-center space-y-1">
                    <h3 className="text-[#24292e] text-xl font-semibold">{p.nome}</h3>
                    <p className="text-[#657380] text-sm">{p.descricao}</p>
                  </div>

                  <div className="text-center mt-5">
                    <div className="text-4xl font-extrabold text-[#d33632] tracking-tight">
                      {priceLabel(p.valor)}
                    </div>
                    <div className="text-xs text-[#657380]">{perLabel}</div>
                    {billing === "anual" && (
                      <div className="text-[11px] text-[#657380]">
                        equivalente a{" "}
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                          Math.round(p.valor * (1 - ANNUAL_DISCOUNT))
                        )}{" "}
                        / mês
                      </div>
                    )}
                  </div>

                  <ul className="mt-6 space-y-2">
                    {bullets.map((b, i) => (
                      <li key={`${p.id}-b-${i}`} className="flex items-center gap-2 text-sm text-[#485b7f]">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center justify-between">
                    {billing === "anual" ? (
                      <Badge className="bg-green-100 text-green-800">Economize 20%</Badge>
                    ) : (
                      <span />
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <Button
                      className={`w-full ${recommended ? "bg-[#1b2841] hover:bg-[#1b2841]/90" : "bg-[#1b2841] hover:bg-[#1b2841]/90"}`}
                      onClick={() => handleChoose(p.id)}
                      disabled={busy}
                      aria-label={`Assinar plano ${p.nome}`}
                    >
                      {busy ? "Processando..." : "Assinar"}
                    </Button>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-[#657380]">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#1b2841]" />
                      Garantia 7 dias
                    </div>
                    <div className="flex items-center gap-1">
                      <Headset className="h-3.5 w-3.5 text-[#1b2841]" />
                      Suporte humano
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {showCheckout && selectedPlanId && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <PaymentForm
              planoId={selectedPlanId}
              onSuccess={(pmId) => onPaymentSuccess(pmId)}
              onError={(msg) => onPaymentError(msg)}
            />
            <Button variant="outline" onClick={() => setShowCheckout(false)} className="mt-4 w-full">
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
