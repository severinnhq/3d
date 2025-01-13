import { MIN_IMAGES, MAX_IMAGES, MAX_IMAGE_SIZE } from './meshroom';

export function validateFiles(files: File[]) {
  if (!files || files.length < MIN_IMAGES) {
    throw new Error(`Minimum ${MIN_IMAGES} images required`);
  }

  if (files.length > MAX_IMAGES) {
    throw new Error(`Maximum ${MAX_IMAGES} images allowed`);
  }

  for (const file of files) {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error('Image size too large (max 10MB)');
    }
    
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Only images are allowed.');
    }
  }
}

