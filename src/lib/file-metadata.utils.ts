export interface FileMetadata {
    nome: string;
    tamanho: number;
    success: boolean;
}

export async function fetchFileMetadata(
    src: string,
    defaultName: string = "documento"
): Promise<FileMetadata> {
    const result: FileMetadata = { nome: defaultName, tamanho: 0, success: false };

    return result;
}
