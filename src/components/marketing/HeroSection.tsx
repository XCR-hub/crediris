import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, CheckCircle } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Économisez jusqu'à{' '}
              <span className="text-primary">15 000 €</span>
              <br />
              sur votre assurance emprunteur
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Simulez et souscrivez votre assurance de prêt 100% en ligne.
              Attestation immédiate, sans paperasse.
            </p>

            <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
              <Link to="/simulation">
                <Button size="lg" className="w-full sm:w-auto">
                  Simuler mon assurance
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/questionnaire">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Remplir le questionnaire
                  <CheckCircle className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Feature
                icon={Shield}
                title="100% en ligne"
                description="Souscription digitale de A à Z"
              />
              <Feature
                icon={Clock}
                title="5 minutes"
                description="Pour obtenir votre simulation"
              />
              <Feature
                icon={CheckCircle}
                title="Attestation immédiate"
                description="Après signature électronique"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:block"
          >
            <img
              src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
              alt="Famille heureuse dans leur nouvelle maison"
              className="rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}