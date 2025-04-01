import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/marketing/Layout';
import { SEO } from '@/components/marketing/SEO';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/marketing/FeatureCard';
import { TestimonialCard } from '@/components/marketing/TestimonialCard';
import {
  Zap,
  Shield,
  Clock,
  CheckCircle,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';

// Schema.org structured data for insurance product
const schema = {
  "@context": "https://schema.org",
  "@type": "InsuranceProduct",
  "name": "CREDIRIS - Assurance emprunteur en ligne",
  "description": "Économisez jusqu'à 15 000€ sur votre assurance emprunteur avec CREDIRIS. Simulation et souscription 100% en ligne, attestation immédiate.",
  "insuranceType": "Loan Insurance",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "price": "0",
      "priceCurrency": "EUR"
    }
  },
  "brand": {
    "@type": "Organization",
    "name": "CREDIRIS",
    "url": "https://www.crediris.fr"
  }
};

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

export default function Home() {
  return (
    <Layout>
      <SEO
        title="Assurance emprunteur en ligne - Économisez jusqu'à 15 000€"
        description="Simulez et souscrivez votre assurance de prêt 100% en ligne. Attestation immédiate, sans paperasse. Économisez jusqu'à 15 000€ sur votre assurance emprunteur avec CREDIRIS."
        schema={schema}
      />

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

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/simulation">
                  <Button size="lg" className="w-full sm:w-auto">
                    Simuler mon assurance emprunteur
                    <ArrowRight className="ml-2 h-5 w-5" />
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

      {/* Avantages */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">
              Pourquoi choisir CREDIRIS ?
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Une expérience 100% digitale, simple et rapide
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="100% en ligne"
              description="Souscrivez votre assurance de prêt entièrement en ligne, sans papier ni déplacement."
              delay={0.1}
            />
            <FeatureCard
              icon={Shield}
              title="Garanties premium" 
              description="Des garanties complètes pour protéger votre prêt et vos proches en toutes circonstances."
              delay={0.2}
            />
            <FeatureCard
              icon={Clock}
              title="Réponse immédiate"
              description="Obtenez une réponse à votre demande de souscription en quelques minutes."
              delay={0.3}
            />
            <FeatureCard
              icon={CheckCircle}
              title="Attestation rapide"
              description="Recevez votre attestation d'assurance dès la signature électronique de votre contrat."
              delay={0.4}
            />
            <FeatureCard
              icon={FileText}
              title="Zéro paperasse"
              description="Fini les documents papier. Tout se fait en ligne, de manière simple et sécurisée."
              delay={0.5}
            />
            <FeatureCard
              icon={Lock}
              title="100% sécurisé"
              description="Vos données sont protégées et chiffrées. Nous respectons scrupuleusement le RGPD."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Découvrez les retours de nos clients satisfaits
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sophie Martin"
              role="Propriétaire à Paris"
              content="J'ai économisé plus de 12 000€ sur mon assurance de prêt grâce à CREDIRIS. La souscription était simple et rapide."
              image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              rating={5}
              delay={0.1}
            />
            <TestimonialCard
              name="Thomas Dubois"
              role="Investisseur immobilier"
              content="Excellent service ! J'ai pu changer d'assurance en quelques clics. L'équipe est réactive et professionnelle."
              image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              rating={5}
              delay={0.2}
            />
            <TestimonialCard
              name="Julie Petit"
              role="Premier achat à Lyon"
              content="CREDIRIS m'a permis de réaliser de belles économies sur mon prêt. Le processus est vraiment simple et transparent."
              image="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              rating={5}
              delay={0.3}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}