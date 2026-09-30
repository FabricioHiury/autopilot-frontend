export interface CargoType {
    id: string | null;
    cargo: string;
    funcionalidades: string[];
}

export interface CargoCreatedType extends CargoType {
    id: string;
}