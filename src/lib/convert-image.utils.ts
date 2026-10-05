/**
 * Converts the file to JPEG with 80% quality if it is an image,
 * otherwise returns the original file without modifications.
 * @param file File to be checked/converted
 * @returns Promise<File> with the converted file or the original
 */
export async function convertImageToJpeg(file: File): Promise<File> {
  if (!file.type.startsWith('image')) {
    return file;
  }

  const dataURL = await readFileAsDataURL(file);
  const image = await loadImage(dataURL);
  const jpegBlob = await imageToJpegBlob(image, 0.8);

  const convertedFile = new File([jpegBlob], replaceExtension(file.name, 'jpg'), {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });

  return convertedFile;
}

/**
 * Reads a File as DataURL (base64) using FileReader.
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Falha ao ler o arquivo como DataURL.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Creates an <img> element from a DataURL string.
 */
function loadImage(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = dataURL;
  });
}

/**
 * Draws the image on a canvas and converts it to a JPEG blob,
 * using the specified quality (0 to 1).
 */
function imageToJpegBlob(img: HTMLImageElement, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Falha ao obter contexto 2D do canvas.'));
      return;
    }

    // Draw the image on the canvas
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Convert to JPEG blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Falha ao converter canvas em Blob.'));
        }
      },
      'image/jpeg',
      quality,
    );
  });
}

/**
 * Replaces the extension of a file name with another (e.g. "png" -> "jpg").
 */
function replaceExtension(fileName: string, newExt: string): string {
  // Extract the name without extension
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  return `${baseName}.${newExt}`;
}
