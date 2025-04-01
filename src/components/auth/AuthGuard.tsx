import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/loading';
import { toast } from '@/lib/hooks/useToast';
import { getSafePath } from '@/lib/utils';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current path to redirect back after login
      try {
        const currentPath = getSafePath();
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      } catch (error) {
        console.warn("Impossible de stocker le chemin de redirection:", error);
      }

      toast({
        variant: "error",
        title: "Session expirée",
        description: "Votre session a expiré. Veuillez vous reconnecter."
      });
      navigate('/signin');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Chargement..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}