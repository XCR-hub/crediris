import React from 'react';
import { Layout } from '@/components/marketing/Layout';
import { SEO } from '@/components/marketing/SEO';
import { AnimatedSection } from '@/components/marketing/AnimatedSection';
import { FeatureCard } from '@/components/marketing/FeatureCard';
import { Heart, Shield, Umbrella, Scale, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Garanties() {
  return (
    <Layout>
      <SEO
        title="Nos garanties d'assurance emprunteur"
        description="Découvrez nos garanties d'assurance de prêt : décès, invalidité, incapacité. Des couvertures optimales pour protéger votre crédit immobilier."
      />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-center mb-4">
              Nos garanties d'assurance
            </h1>
            <p className="text-xl text-gray-600 text-center mb-12">
              Une protection complète pour votre prêt immobilier
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon={Heart}
              title="Décès"
              description="Protection financière pour vos proches en cas de décès. Prise en charge du capital restant dû."
              delay={0.1}
            />
            <FeatureCard
              icon={Shield}
              title="Invalidité Permanente Totale"
              description="Couverture en cas d'invalidité permanente totale (IPT). Prise en charge des échéances de prêt."
              delay={0.2}
            />
            <FeatureCard
              icon={Umbrella}
              title="Incapacité Temporaire"
              description="Maintien de vos revenus en cas d'arrêt de travail. Prise en charge des mensualités."
              delay={0.3}
            />
          </div>

          <AnimatedSection delay={0.4}>
            <div className="bg-primary/5 rounded-2xl p-8 mb-16">
              <h2 className="text-2xl font-bold mb-6">
                Équivalence des garanties
              </h2>
              <p className="text-gray-600 mb-4">
                La loi vous permet de changer d'assurance emprunteur si vous trouvez un contrat présentant des garanties équivalentes au contrat proposé par votre banque.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Scale className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Droit à la délégation</h3>
                    <p className="text-sm text-gray-600">
                      Vous êtes libre de choisir votre assurance emprunteur auprès de l'assureur de votre choix.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Résiliation à tout moment</h3>
                    <p className="text-sm text-gray-600">
                      La loi Lemoine vous permet de changer d'assurance à tout moment, sans frais ni pénalités.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.5}>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">
                Prêt à économiser sur votre assurance ?
              </h2>
              <p className="text-gray-600 mb-8">
                Faites votre simulation en ligne et obtenez une réponse immédiate.
              </p>
              <Link to="/simulation">
                <Button size="lg">
                  Je simule mon prêt
                  <CheckCircle className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </Layout>
  );
}