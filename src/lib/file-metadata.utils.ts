export interface FileMetadata {
  name: string;
  size: number;
  success: boolean;
}

export async function fetchFileMetadata(
  src: string,
  defaultName: string = 'documento',
): Promise<FileMetadata> {
  const result: FileMetadata = { name: defaultName, size: 0, success: false };

  return result;
}
