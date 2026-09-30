"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, DollarSign } from "lucide-react";
import { ModalNotificacoes } from "@/components/commons/modais/modal-notificacoes";
import GoBackPage from "@/components/sections/go-back-page";
import { Title } from "@/components/sections/Text";
import { Label } from "@/components/commons/label";
import { TextareaComLabel } from "@/components/commons/inputs/textarea-com-label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select-custom";
import { apiAdmin } from "@/utils/classes/api";
import toast from "react-hot-toast";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";

const Switch = ({ checked, onCheckedChange, id }: { checked: boolean; onCheckedChange: (checked: boolean) => void; id?: string }) => {
    return (
        <button
            type="button"
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                checked ? 'bg-blue-600' : 'bg-gray-200'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
};

const formatPrice = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    const cents = parseInt(numbers);
    return (cents / 100).toFixed(2);
};

const maskPrice = (value: string) => {
    const formatted = formatPrice(value);
    return formatted ? `R$ ${formatted}` : '';
};

export default function EditarPlanoPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        valor: "",
        periodo: "mensal" as "mensal" | "anual",
        ativo: true,
        recursos: [""] as string[]
    });

    useEffect(() => {
        const fetchPlano = async () => {
            try {
                setLoadingData(true);
                setError(null);
                const [response, error] = await apiAdmin.get(`/backoffice/planos/${params.id}`);
                if (error) {
                    setError('Erro ao carregar dados do plano.');
                    toast.error(error.message || 'Erro ao carregar plano');
                    return;
                }
                
                const plano = response.data || response;
                setFormData({
                    nome: plano.nome,
                    descricao: plano.descricao,
                    valor: (plano.valor * 100).toString(), 
                    periodo: plano.periodo as "mensal" | "anual",
                    ativo: plano.ativo,
                    recursos: plano.recursos || [""]
                });
            } catch (error: any) {
                console.error('Erro ao carregar plano:', error);
                setError('Erro ao carregar dados do plano.');
                toast.error('Erro ao carregar plano');
            } finally {
                setLoadingData(false);
            }
        };

        if (params.id) {
            fetchPlano();
        }
    }, [params.id]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numbers = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, valor: numbers })); 
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            const payload = {
                nome: formData.nome,
                descricao: formData.descricao,
                valor: parseFloat(formData.valor) / 100,
                periodo: formData.periodo,
                ativo: formData.ativo,
                recursos: formData.recursos.filter(r => r.trim() !== "")
            };
            
            const [response, error] = await apiAdmin.put(`/backoffice/planos/${params.id}`, payload);
            if (error) {
                setError(error.message || 'Erro ao atualizar plano. Tente novamente.');
                toast.error(error.message || 'Erro ao atualizar plano');
                return;
            }
            
            toast.success('Plano atualizado com sucesso!');
            router.push('/backoffice/app/planos');
        } catch (error: any) {
            console.error('Erro ao atualizar plano:', error);
            setError('Erro ao atualizar plano. Tente novamente.');
            toast.error('Erro ao atualizar plano');
        } finally {
            setLoading(false);
        }
    };

    const addRecurso = () => {
        setFormData(prev => ({
            ...prev,
            recursos: [...prev.recursos, ""]
        }));
    };

    const removeRecurso = (index: number) => {
        setFormData(prev => ({
            ...prev,
            recursos: prev.recursos.filter((_, i) => i !== index)
        }));
    };

    const updateRecurso = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            recursos: prev.recursos.map((r, i) => i === index ? value : r)
        }));
    };

    if (loadingData) {
        return <LoadingGlobal />;
    }

    return (
        <div className="flex flex-col items-start h-full justify-start">
            <div className="p-9 flex flex-col gap-3 w-full bg-white">
                <GoBackPage />
                <div className="flex justify-between items-center">
                    <Title label="Editar Plano" />
                    <div className="flex items-center gap-3">
                        <ModalNotificacoes />
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full">
                <div className="px-9 py-6 w-full">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-8 space-y-8">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-r-lg">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <X className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="nome" className="text-sm font-semibold text-gray-700">Nome do Plano *</Label>
                                    <Input
                                        id="nome"
                                        value={formData.nome}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                        placeholder="Ex: Plano Básico"
                                        className="h-12 border-gray-300 focus:border-[#1b2841] focus:ring-[#1b2841]"
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-3">
                                    <Label htmlFor="preco" className="text-sm font-semibold text-gray-700">Preço *</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            id="preco"
                                            value={maskPrice(formData.valor)}
                                            onChange={handlePriceChange}
                                            placeholder="R$ 29,90"
                                            className="h-12 pl-10 border-gray-300 focus:border-[#1b2841] focus:ring-[#1b2841]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="periodo" className="text-sm font-semibold text-gray-700">Período de Cobrança *</Label>
                                    <Select value={formData.periodo} onValueChange={(value: "mensal" | "anual") => setFormData(prev => ({ ...prev, periodo: value }))}>
                                        <SelectTrigger className="h-12 border-gray-300 focus:border-[#1b2841] focus:ring-[#1b2841]">
                                            <SelectValue placeholder="Selecione o período" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mensal">Mensal</SelectItem>
                                            <SelectItem value="anual">Anual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-3">
                                    <Label htmlFor="ativo" className="text-sm font-semibold text-gray-700">Status</Label>
                                    <div className="flex items-center space-x-3 h-12">
                                        <Switch
                                            id="ativo"
                                            checked={formData.ativo}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                                        />
                                        <Label htmlFor="ativo" className="text-sm font-medium">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                formData.ativo 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {formData.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <TextareaComLabel
                                    label="Descrição"
                                    value={formData.descricao}
                                    onChange={(value) => setFormData(prev => ({ ...prev, descricao: value }))}
                                    placeholder="Descrição detalhada do plano..."
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <Label className="text-lg font-semibold text-gray-700">Recursos Inclusos</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addRecurso} className="shadow-sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Adicionar Recurso
                                    </Button>
                                </div>
                                
                                <div className="space-y-3">
                                    {formData.recursos.map((recurso, index) => (
                                        <div key={index} className="flex gap-3 items-center p-4 bg-gray-50 rounded-lg border">
                                            <div className="flex-1">
                                                <Input
                                                    value={recurso}
                                                    onChange={(e) => updateRecurso(index, e.target.value)}
                                                    placeholder="Ex: 5 usuários inclusos"
                                                    className="border-gray-300 focus:border-[#1b2841] focus:ring-[#1b2841]"
                                                />
                                            </div>
                                            {formData.recursos.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeRecurso(index)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-8 border-t border-gray-200">
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="bg-[#1b2841] hover:bg-[#1b2841]/90 text-white px-8 py-3 text-base font-semibold shadow"
                                >
                                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                                <Button type="button" variant="outline" className="px-8 py-3 text-base shadow-sm" onClick={() => router.push('/backoffice/app/planos')}>
                                    Cancelar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}