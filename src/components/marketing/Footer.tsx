import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">CREDIRIS</h3>
            <p className="text-sm text-gray-600 mb-4">
              Leader de l'assurance emprunteur en ligne. Économisez jusqu'à 15 000€ sur votre assurance de prêt.
            </p>
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm">ORIAS N°XX XXX XXX</span>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary">Accueil</Link></li>
              <li><Link to="/garanties" className="hover:text-primary">Nos garanties</Link></li>
              <li><Link to="/simulation" className="hover:text-primary">Simulation</Link></li>
              <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Informations légales</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/mentions-legales" className="hover:text-primary">Mentions légales</Link></li>
              <li><Link to="/cgu" className="hover:text-primary">CGU</Link></li>
              <li><Link to="/confidentialite" className="hover:text-primary">Politique de confidentialité</Link></li>
              <li><Link to="/cookies" className="hover:text-primary">Gestion des cookies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>01 23 45 67 89</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@crediris.com" className="hover:text-primary">
                  contact@crediris.com
                </a>
              </li>
              <li className="flex items-center space-x-2 pt-4">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-xs">
                  Données sécurisées et chiffrées
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} CREDIRIS. Tous droits réservés.</p>
          <p className="mt-2">
            CREDIRIS est une marque déposée. Société au capital de XXX XXX euros.
            RCS Paris XXX XXX XXX. Siège social : XX rue XXXXX, 75008 Paris.
          </p>
        </div>
      </div>
    </footer>
  );
}