import { toast } from '@/lib/hooks/useToast';

/**
 * Converts a base64 data URI to a Blob object
 */
export function base64ToBlob(base64: string): Blob {
  try {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    toast({
      variant: "error",
      title: "Erreur",
      description: "Erreur lors de la conversion de la signature"
    });
    throw error;
  }
}

/**
 * Validates file size and type
 */
export function validateFile(file: File, maxSize: number, allowedTypes: string[]): boolean {
  if (file.size > maxSize) {
    toast({
      variant: "error",
      title: "Fichier trop volumineux",
      description: `La taille maximale autorisée est de ${maxSize / 1024 / 1024}MB`
    });
    return false;
  }

  if (!allowedTypes.includes(file.type)) {
    toast({
      variant: "error", 
      title: "Type de fichier non supporté",
      description: `Types autorisés: ${allowedTypes.join(', ')}`
    });
    return false;
  }

  return true;
}