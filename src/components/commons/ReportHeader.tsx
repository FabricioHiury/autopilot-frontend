"use client"
import { PageTitle } from "@/components/commons/page-title"
import { useState, useEffect, useRef } from "react"
import { DayPicker, DateRange } from "react-day-picker"
import { ptBR } from "date-fns/locale"
import { TabButtons, TabButtonsItem } from "@/components/ui/tab-buttons"
import { IconCar } from "@/components/icons/icon-car"
import { SelectPadrao } from "@/components/commons/inputs/select-padrao"
import "react-day-picker/dist/style.css"
import IconCalandar from "@/components/icons/icon-calandar"

export interface ReportTab {
    titulo: string;
    subtitulo: string;
    estaSelecioando: boolean;
}

export interface ReportHeaderProps {
    tabs?: ReportTab[];
    selectedTab?: ReportTab;
    onTabChange?: (tab: ReportTab) => void;
    dateRange?: DateRange;
    onDateRangeChange?: (range: DateRange | undefined) => void;
    titulo?: string;
    modeItems?: Array<string | TabButtonsItem>;
    modeValue?: string;
    onModeChange?: (key: string) => void;
    modeIcon?: React.ElementType;
    vendedores?: { id: string; nome: string; avatar?: string | null }[];
    selectedVendedorId?: string | 'todos';
    onVendedorChange?: (id: string | 'todos') => void;
}

export default function ReportHeader({
    tabs,
    selectedTab,
    onTabChange,
    dateRange,
    onDateRangeChange,
    titulo,
    modeItems,
    modeValue,
    onModeChange,
    modeIcon,
    vendedores,
    selectedVendedorId,
    onVendedorChange,
}: ReportHeaderProps) {
    const [range, setRange] = useState<DateRange | undefined>(dateRange);
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        };

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

    const handleTabChange = (index: number) => {
        if (tabs && onTabChange) {
            onTabChange(tabs[index]);
        }
    };

    const handleDateConfirm = () => {
        if (onDateRangeChange) {
            onDateRangeChange(range);
        }
        setShowCalendar(false);
    };

    const handleDateClear = () => {
        setRange(undefined);
        if (onDateRangeChange) {
            onDateRangeChange(undefined);
        }
        setShowCalendar(false);
    };

    const defaultModeItems: Array<string | TabButtonsItem> = [
        "total",
        "compra",
        "venda",
        "consignado",
    ]

    return (
        <header className="w-full">
            <div className="flex flex-col min-h-36 gap-4 flex-1 bg-white shadow-sm px-6 sm:px-9 py-6 lg:flex-col justify-between sticky top-0 z-30">
                {(selectedTab || titulo) && (
                    <div className="flex flex-col gap-2">
                        <PageTitle title={titulo || selectedTab?.titulo || ""} />
                        <p className="text-gray-500 text-sm">{selectedTab?.subtitulo || ""}</p>
                    </div>
                )}
                {tabs?.length && <select
                    className="w-full md:w-64 h-10 px-2 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => handleTabChange(Number(e.target.value))}
                    value={selectedTab ? tabs?.findIndex(tab => tab.titulo === selectedTab.titulo) ?? 0 : 0}
                >
                    {tabs?.map((item, index) => (
                        <option key={index} value={index}>
                            {item.titulo}
                        </option>
                    ))}
                </select>}
            </div>
            
            <div className="flex flex-col gap-2 px-6 py-4 lg:flex-row md:justify-between md:py-6 lg:px-10 flex-wrap">
                <div className="w-full lg:w-1/2 flex flex-col gap-3 sm:gap-4 sm:mx-0 sm:px-0">
                    {(modeItems || onModeChange) && (
                        <TabButtons
                            items={modeItems ?? defaultModeItems}
                            value={(modeValue as string) ?? "total"}
                            onChange={(key) => onModeChange && onModeChange(key)}
                            icon={modeIcon ?? IconCar}
                            containerClassName="w-full sm:w-auto"
                        />
                    )}
                </div>

                <div className="flex gap-2 flex-wrap xl:flex-nowrap">
                    {vendedores && vendedores.length > 0 && (
                        <div className="flex-1">
                            <SelectPadrao
                                value={selectedVendedorId as string}
                                options={[{ value: 'todos', label: 'Todos' }, ...vendedores.map(v => ({ value: v.id, label: v.nome }))]}
                                onChange={(value) => onVendedorChange && onVendedorChange((value as string) ?? 'todos')}
                                placeholder="Filtrar por vendedor"
                                className="h-[2.5rem]"
                            />
                        </div>
                    )}

                    <div className="flex justify-start lg:justify-end">
                        <div className="relative" ref={calendarRef}>
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="sm:w-full w-10 h-10 sm:h-auto sm:px-3 px-0 sm:py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-left flex items-center justify-center sm:justify-start gap-2"
                            >
                                <span className="inline-flex items-center justify-center">
                                    <IconCalandar />
                                </span>
                                <span className="hidden sm:inline">
                                    {range?.from && range?.to
                                        ? `${range.from.toLocaleDateString('pt-BR')} - ${range.to.toLocaleDateString('pt-BR')}`
                                        : range?.from
                                            ? `${range.from.toLocaleDateString('pt-BR')} - Selecione data final`
                                            : "Selecione o período"
                                    }
                                </span>
                            </button>

                            {showCalendar && (
                                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-[18rem] sm:w-auto max-w-[calc(100vw-2rem)] sm:max-w-none overflow-hidden">
                                    <DayPicker
                                        mode="range"
                                        selected={range}
                                        onSelect={setRange}
                                        numberOfMonths={window.innerWidth >= 640 ? 2 : 1}
                                        locale={ptBR}
                                        className="rdp w-full"
                                        classNames={{
                                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                            month: "space-y-4",
                                            caption: "flex justify-center pt-1 relative items-center",
                                            caption_label: "text-sm font-medium",
                                            nav: "space-x-1 flex items-center",
                                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                            nav_button_previous: "absolute left-1",
                                            nav_button_next: "absolute right-1",
                                            table: "w-full border-collapse space-y-1",
                                            head_row: "flex",
                                            head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                                            row: "flex w-full mt-2",
                                            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-50 rounded-md",
                                            day_selected: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600",
                                            day_today: "bg-gray-100 text-gray-900",
                                            day_outside: "text-gray-400 opacity-50",
                                            day_disabled: "text-gray-400 opacity-50",
                                            day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
                                            day_hidden: "invisible",
                                        }}
                                    />
                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                        <button
                                            onClick={handleDateClear}
                                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                        >
                                            Limpar
                                        </button>
                                        <button
                                            onClick={handleDateConfirm}
                                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Confirmar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
