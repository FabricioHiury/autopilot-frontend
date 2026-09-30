/**
 * Gets the file type by extension
 * @param fileUrl - The URL of the file
 * @returns The file type
 */
export function getFileTypeByExtension(fileUrl: string | null | undefined): 'image' | 'audio' | 'video' | 'pdf' | 'document' | 'unknown' {
  if (!fileUrl) {
    return 'unknown';
  }

  const extension = fileUrl.split('.').pop()?.toLowerCase() ?? '';
  const imageExtensions = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp'];
  const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'weba'];
  const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'flv', 'wmv', 'webm'];
  const pdfExtensions = ['pdf'];
  const documentExtensions = ['doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'ppt', 'pptx'];

  if (imageExtensions.includes(extension)) {
    return 'image';
  } else if (audioExtensions.includes(extension)) {
    return 'audio';
  } else if (pdfExtensions.includes(extension)) {
    return 'pdf';
  } else if (documentExtensions.includes(extension)) {
    return 'document';
  } else if (videoExtensions.includes(extension)) {
    return 'video';
  }

  return 'unknown';
}


/**
 * Gets the file type by MIME type
 * @param mime - The MIME type of the file
 * @returns The file type
 */
export function getFileTypeByMimeType(mimeType: string): 'image' | 'audio' | 'video' | 'document' {
  if (!mimeType) return 'document';
  
  const mime = mimeType.toLowerCase();
  
  if (mime.startsWith('image/')) {
    return 'image';
  }
  if (mime.startsWith('audio/') || mime === 'application/octet-stream') {
    if (mime === 'application/octet-stream') {
      const ext = getFileTypeByExtension(mimeType);
      if (ext === 'audio') return 'audio';
    }
    return 'audio';
  }
  if (mime.startsWith('video/')) {
    return 'video';
  }
  return 'document';
}

/**
 * Formats a file size in bytes to a human-readable format
 * @param size - The size of the file in bytes
 * @returns The formatted file size
 */
export function formatSizeFile(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}


/**
 * Verifica se um arquivo MP4 de redes sociais (Instagram/Facebook) é áudio ou vídeo
 * @param fileUrl - URL do arquivo
 * @returns Promise com o tipo do arquivo
 */
export async function checkSocialMediaMp4Type(fileUrl: string): Promise<'audio' | 'video'> {
  try {
    const video = document.createElement('video');
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve('video');
      }, 5000);

      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        
        const hasVideoTrack = video.videoWidth > 0 && video.videoHeight > 0;
        const hasSmallDimensions = video.videoWidth < 100 && video.videoHeight < 100;
        const hasNoDimensions = video.videoWidth === 0 || video.videoHeight === 0;
        
        if (hasNoDimensions) {
          resolve('audio');
          return;
        }
        
        if (hasSmallDimensions) {
          resolve('audio');
          return;
        }
        
        if (video.duration && video.duration > 0) {
          if (hasVideoTrack && video.videoWidth >= 100 && video.videoHeight >= 100) {
            resolve('video');
            return;
          }
        }
        
        resolve('video');
      };
      
      video.onerror = () => {
        clearTimeout(timeout);
        resolve('video');
      };
      
      video.preload = 'metadata';
      video.src = fileUrl;
    });
  } catch {
    return 'video'; 
  }
}
