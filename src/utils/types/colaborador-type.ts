import { CargoType } from "./cargo-type";

export interface ColaboradorType {
    email: any;
    id: string;
    idLoja: string;
    idUsuario: string;
    idFoto: string | null;
    nome: string;
    documentoFiscal: string;
    whatsapp: string;
    telefoneComplementar: string;
    status: string;
    observacoes: string | null;
    criadoEm: string;
    atualizadoEm: string;
    avatar?: string;
    cargos?: CargoType[];
    funcionalidades?: string[];
}

export interface CriarColaboradorDto {
    email: string;
    senha?: string;
    nome: string;
    idFoto?: string;
    documentoFiscal: string;
    whatsapp: string;
    telefoneComplementar?: string;
    observacoes: string;
    cargos: string[];
    funcionalidades: string[];
}