import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/marketing/Layout';
import { Home, Search } from 'lucide-react';

export default function Error404() {
  return (
    <Layout showNav={false}>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold mt-4 mb-2">Page non trouvée</h2>
          <p className="text-gray-600 mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
            
            <Link to="/simulation">
              <Button className="w-full sm:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Faire une simulation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}