import { AtendimentoCompletoType } from "./atentimento-lista-type";

export interface VisitaType {
    id: string;
    idAtendimento: string;
    observacoes: string | null;
    tipo: string;
    data: string;           
    horaInicio: string;     
    horaFim: string;        
    concluida: boolean;    
    criadoEm: string;       
    atualizadoEm: string;   
    atendimento: AtendimentoCompletoType;
}