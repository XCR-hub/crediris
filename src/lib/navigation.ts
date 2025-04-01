import { NavigateFunction } from 'react-router-dom';
import { toast } from '@/lib/hooks/useToast';

// Constants
export const REDIRECT_KEY = 'redirectAfterLogin';

/**
 * Safely navigate to a new route while preserving the current path for post-login redirect
 */
export function safeNavigate(navigate: NavigateFunction, path: string) {
  try {
    // Store current path for post-login redirect if going to login page
    if (path === '/signin') {
      try {
        const currentPath = window.location.pathname;
        if (currentPath !== '/signin' && currentPath !== '/signup') {
          sessionStorage.setItem(REDIRECT_KEY, currentPath);
        }
      } catch (error) {
        // Log error in development only
        if (import.meta.env.DEV) {
          console.warn('Failed to store redirect path:', error);
        }
      }
    }

    // Use navigate with replace to avoid history stack issues
    navigate(path, { replace: true });
  } catch (error) {
    console.error('Navigation error:', error);

    // Show error toast
    toast({
      variant: "error",
      title: "Erreur de navigation",
      description: "Une erreur est survenue lors de la navigation"
    });

    // Fallback to window.location if navigate fails
    try {
      window.location.href = path;
    } catch (fallbackError) {
      console.error('Fallback navigation failed:', fallbackError);
      window.location.replace(path);
    }
  }
}