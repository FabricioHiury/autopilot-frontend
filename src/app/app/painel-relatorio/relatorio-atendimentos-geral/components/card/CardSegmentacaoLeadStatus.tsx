import React from 'react';

interface StatusData {
    label: string;
    valor: number;
    cor: string;
    porcentagem: number | undefined;
}

interface CardSegmentacaoLeadStatusProps {
    dados: StatusData[];
    totalLeads: number;
    referenciaMesAno: string;
}

export default function CardSegmentacaoLeadStatus({ dados, totalLeads, referenciaMesAno }: CardSegmentacaoLeadStatusProps) {
    const lighten = (hex: string, amount: number) => {
        const clean = hex.replace('#', '');
        const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
        const num = parseInt(full, 16);
        let r = (num >> 16) & 255;
        let g = (num >> 8) & 255;
        let b = num & 255;
        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    const criarLinhasQuadrados = () => {
        const linhas = [];
        const quadradosPorLinha = 15;

        for (let i = 0; i < 4; i++) {
            const statusAtual = dados[i];
            const linha = [];

            if (statusAtual) {
                const proporcaoReal = statusAtual.valor / totalLeads;
                const quadradosPreenchidos = Math.round(proporcaoReal * quadradosPorLinha);

                for (let j = 0; j < quadradosPorLinha; j++) {
                    if (j < quadradosPreenchidos) {
                        linha.push({
                            cor: statusAtual.cor,
                            status: statusAtual.label,
                            valor: statusAtual.valor
                        });
                    } else {
                        linha.push({
                            cor: '#E3EBF3',
                            status: 'Vazio',
                            valor: 0
                        });
                    }
                }
            } else {
                for (let j = 0; j < quadradosPorLinha; j++) {
                    linha.push({
                        cor: '#E3EBF3',
                        status: 'Vazio',
                        valor: 0
                    });
                }
            }

            linhas.push({
                quadrados: linha,
                valor: statusAtual?.valor || 0
            });
        }

        return linhas;
    };

    const linhas = criarLinhasQuadrados();

    return (
        <div className='min-h-[320px] h-full flex flex-col overflow-hidden'>
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">
                    Segmentação de leads por Status
                </h3>
                <div className="h-6 px-2 rounded-full bg-[#EBEEF2] flex items-center justify-center text-[#1B263A] font-semibold text-xs">
                    {totalLeads.toLocaleString()} leads
                </div>
            </div>

            <div className="flex flex-col gap-4 bg-white rounded-2xl p-4 flex-1 overflow-hidden shadow-sm ring-1 ring-[#E3EBF3]">
                <div className="flex items-center justify-between flex-shrink-0">
                    <div className="hidden md:flex gap-4 items-center flex-wrap">
                        {dados.map((status, index) => (
                            <div key={index} className="flex items-center gap-2 pr-2">
                                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: status.cor }} />
                                <span className="text-xs text-[#1B263A] font-medium leading-none">{status.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="text-right flex-shrink-0">
                        <span className="text-xs text-gray-500 font-medium">{referenciaMesAno}</span>
                    </div>
                </div>

                <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
                    {linhas.map((linha, linhaIndex) => {
                        const cor = dados[linhaIndex]?.cor || '#E3EBF3';
                        const rawPercent = totalLeads > 0 ? (linha.valor / totalLeads) * 100 : 0;
                        const barWidth = rawPercent;
                        const percentLabel = rawPercent === 0 ? '0%' : rawPercent < 1 ? '<1%' : `${Math.round(rawPercent)}%`;
                        const label = dados[linhaIndex]?.label || '';
                        const displayValue = `+${linha.valor.toLocaleString()} (${percentLabel})`;
                        return (
                            <div key={linhaIndex} className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-[#1B263A] font-medium">
                                        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: cor }} />
                                        <span>{label}</span>
                                    </div>
                                    <span className="text-xs text-gray-600 font-semibold">{displayValue}</span>
                                </div>
                                <div
                                    className="relative w-full h-3 bg-[#F3F5F7] rounded-full"
                                    title={`${label} - ${linha.valor} (${percentLabel})`}
                                >
                                    <div
                                        className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-300"
                                        style={{
                                            width: `${barWidth}%`,
                                            background: `linear-gradient(90deg, ${cor}, ${lighten(cor, 40)})`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}