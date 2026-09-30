"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import InputPesquisarBlue from "@/components/commons/inputs/input-pesquisar-blue";
import SelectSweet from "@/components/commons/inputs/select-lego";
import { ModalNotificacoes } from "@/components/commons/modais/modal-notificacoes";
import ButtonAdd from "@/components/commons/buttons/button-add";
import GoBackPage from "@/components/sections/go-back-page";
import { SubTitle, Title } from "@/components/sections/Text";
import { apiAdmin } from "@/utils/classes/api";
import toast from "react-hot-toast";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";

type Plano = {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  periodo: "mensal" | "anual";
  recursos: string[];
  ativo: boolean;
  criadoEm: string;
};

function Tag({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <div className="flex justify-center font-semibold items-center p-1 px-3 rounded-lg" style={{ background: bg, color }}>
      {label}
    </div>
  );
}

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtros, setFiltros] = useState({
    pesquisa: "",
    status: "todos",
    periodo: "todos",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planoToDelete, setPlanoToDelete] = useState<Plano | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        setLoading(true);
        setError(null);
        const [response, error] = await apiAdmin.get("/backoffice/planos");
        if (error) {
          setError("Erro ao carregar planos. Tente novamente.");
          toast.error(error.message || "Erro ao carregar planos");
          setPlanos([]);
          return;
        }
        const data = response.data || response;
        const planosData = data.planos || data;
        setPlanos(Array.isArray(planosData) ? planosData : []);
      } catch (err) {
        console.error("Erro ao carregar planos:", err);
        setError("Erro ao carregar planos. Tente novamente.");
        setPlanos([]);
        toast.error("Erro ao carregar planos");
      } finally {
        setLoading(false);
      }
    };
    fetchPlanos();
  }, []);

  const upFiltro = (value: any, key: keyof typeof filtros) => {
    setFiltros((old) => ({ ...old, [key]: value }));
  };

  const filtered = useMemo(() => {
    const search = filtros.pesquisa.toLowerCase();
    return planos.filter((p) => {
      const byText = (p.nome || "").toLowerCase().includes(search) || (p.descricao || "").toLowerCase().includes(search);
      const byStatus = filtros.status === "todos" || (filtros.status === "ativo" ? p.ativo : !p.ativo);
      const byPeriodo = filtros.periodo === "todos" || p.periodo === filtros.periodo;
      return byText && byStatus && byPeriodo;
    });
  }, [planos, filtros]);

  const handleDeleteClick = (plano: Plano) => {
    setPlanoToDelete(plano);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!planoToDelete) return;
    try {
      setDeleting(true);
      const [_, error] = await apiAdmin.delete(`/backoffice/planos/${planoToDelete.id}`);
      if (error) {
        toast.error(error.message || "Erro ao excluir plano");
        return;
      }
      setPlanos((prev) => prev.filter((p) => p.id !== planoToDelete.id));
      toast.success("Plano excluído com sucesso!");
      setShowDeleteModal(false);
      setPlanoToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir plano:", err);
      toast.error("Erro ao excluir plano. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPlanoToDelete(null);
  };

  if (loading) {
    return (
      <LoadingGlobal />
    );
  }

  return (
    <div className="flex flex-col items-start h-full justify-start">
      {/* Header padrão backoffice */}
      <div className="p-9 flex flex-col gap-3 w-full bg-white">
        <GoBackPage />
        <div className="flex justify-between items-center">
          <Title label="Planos" />
          <div className="flex items-center gap-3">
            <ModalNotificacoes />
            <Link href="/backoffice/app/planos/novo">
              <ButtonAdd title="Novo Plano" onClick={() => { }} />
            </Link>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-9 pt-2 pb-6 flex justify-between w-full flex-wrap items-center gap-4 bg-white rounded-b-xl">
        <SubTitle label="Planos disponíveis" />
        <div className="flex items-center gap-2 xl:flex-nowrap flex-wrap flex-grow">
          <SelectSweet
            placeholder="Status"
            options={[
              { value: "todos", label: "Todos" },
              { value: "ativo", label: "Ativo" },
              { value: "inativo", label: "Inativo" },
            ]}
            value={filtros.status}
            setValue={(v: string) => upFiltro(v, "status")}
          />
          <SelectSweet
            placeholder="Período"
            options={[
              { value: "todos", label: "Todos" },
              { value: "mensal", label: "Mensal" },
              { value: "anual", label: "Anual" },
            ]}
            value={filtros.periodo}
            setValue={(v: string) => upFiltro(v, "periodo")}
          />
          <InputPesquisarBlue
            onChange={(value) => upFiltro(value, "pesquisa")}
            value={filtros.pesquisa}
            placeholder="Procurar por nome ou descrição"
            classNameBar="bg-white"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="px-9 mt-6 w-full">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="bg-[#E3EBF3] flex rounded-t-xl text-[12px] px-5">
              {["Plano", "Preço", "Período", "Recursos", "Status", "Ações"].map((h, i) => (
                <div key={h} style={{ flex: [3, 2, 2, 3, 2, 2][i] }} className={`flex items-center text-[#24292E] text-center py-2 ${i === 0 ? "" : "justify-center"}`}>
                  {h}
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-start items-start bg-white rounded-b-xl px-5 w-full text-[#24292E] text-[12px]">
              {filtered.map((plano) => (
                <div key={plano.id} className="flex justify-start font-medium py-[10px] w-full content-start items-center border-b last:border-b-0">
                  <div className="flex flex-col flex-[3]">
                    <b className="text-[14px]">{plano.nome}</b>
                    <span className="text-[#657380]">{plano.descricao}</span>
                  </div>
                  <div className="flex justify-center flex-[2] text-[14px] text-[#1b2841] font-semibold">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(plano.valor)}
                  </div>
                  <div className="flex justify-center flex-[2] capitalize">{plano.periodo}</div>
                  <div className="flex justify-center flex-[3]">{plano.recursos?.length ?? 0} itens</div>
                  <div className="flex justify-center flex-[2]">
                    {plano.ativo ? <Tag label="Ativo" bg="#E6F4EA" color="#166534" /> : <Tag label="Inativo" bg="#F3F4F6" color="#374151" />}
                  </div>
                  <div className="flex justify-center gap-2 flex-[2]">
                    <Link href={`/backoffice/app/planos/${plano.id}`}>
                      <Button variant="outline" size="sm" className="h-8 px-3">
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(plano)}
                      className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && !error && (
                <div className="w-full text-center py-10 text-[#657380]">Nenhum plano encontrado</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmação */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
              </div>
            </div>
            <div className="mb-6 text-sm text-gray-600">
              Tem certeza que deseja excluir o plano <strong>"{planoToDelete?.nome}"</strong>? Essa ação não pode ser desfeita.
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleCancelDelete} disabled={deleting}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting} className="min-w-[110px]">
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Excluindo...
                  </div>
                ) : (
                  "Sim, excluir"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}