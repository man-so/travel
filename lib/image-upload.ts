'use client';

const maxImageWidth = 1400;
const maxImageHeight = 1000;
const imageQuality = 0.82;

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to read image.'));
    image.src = dataUrl;
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Unable to read image.'));
    };
    reader.onerror = () => reject(new Error('Unable to read image.'));
    reader.readAsDataURL(file);
  });
}

export async function prepareMomentPhoto(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file.');
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const ratio = Math.min(maxImageWidth / image.width, maxImageHeight / image.height, 1);
  const width = Math.round(image.width * ratio);
  const height = Math.round(image.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to prepare image.');
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', imageQuality);
}
