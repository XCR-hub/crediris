import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './button';
import { safeNavigate } from '@/lib/navigation';
import { LogOut, Home, User } from 'lucide-react';
import { signOut } from '@/lib/auth';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function Layout({ children, showNav = true }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      safeNavigate(navigate, '/signin');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {showNav && (
        <nav 
          className="bg-white shadow-sm sticky top-0 z-50" 
          role="navigation" 
          aria-label="Navigation principale"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Button
                  variant="ghost"
                  className={`inline-flex items-center px-3 ${isActive('/') ? 'text-primary' : ''}`}
                  onClick={() => safeNavigate(navigate, '/')}
                  aria-current={isActive('/') ? 'page' : undefined}
                >
                  <Home className="h-5 w-5 mr-2" />
                  <span className="sr-only">Accueil</span>
                  Crediris
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => safeNavigate(navigate, '/profile')}
                  className={`inline-flex items-center ${isActive('/profile') ? 'text-primary' : ''}`}
                  aria-current={isActive('/profile') ? 'page' : undefined}
                >
                  <User className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Mon Profil</span>
                  <span className="sr-only">Accéder à mon profil</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="inline-flex items-center"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Se déconnecter</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main 
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" 
        role="main"
        id="main-content"
      >
        <section className="h-full">
          {children}
        </section>
      </main>
      <footer className="bg-white border-t mt-auto py-4" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Crediris. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}