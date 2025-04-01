import { useState, useCallback } from 'react';
import { toast } from './useToast';

interface UseLoadingStateOptions {
  errorMessage?: string;
  successMessage?: string;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const withLoading = useCallback(async <T>(
    fn: () => Promise<T>,
    customOptions?: UseLoadingStateOptions
  ): Promise<T | undefined> => {
    const opts = { ...options, ...customOptions };
    
    try {
      setIsLoading(true);
      const result = await fn();
      
      if (opts.successMessage) {
        toast({
          variant: "success",
          title: "Succès",
          description: opts.successMessage
        });
      }
      
      return result;
    } catch (error) {
      console.error('Operation failed:', error);
      
      toast({
        variant: "error",
        title: "Erreur",
        description: opts.errorMessage || "Une erreur est survenue"
      });
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return { isLoading, withLoading };
}