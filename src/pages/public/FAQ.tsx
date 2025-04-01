import React from 'react';
import { Layout } from '@/components/marketing/Layout';
import { SEO } from '@/components/marketing/SEO';
import { AnimatedSection } from '@/components/marketing/AnimatedSection';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/marketing/Accordion';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Est-ce que je peux changer d\'assurance emprunteur à tout moment ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, depuis la loi Lemoine de 2022, vous pouvez résilier votre assurance emprunteur à tout moment...',
      },
    },
    // Add other FAQ items here
  ],
};

export default function FAQ() {
  return (
    <Layout>
      <SEO
        title="FAQ - Vos questions sur l'assurance emprunteur"
        description="Trouvez les réponses à toutes vos questions sur l'assurance de prêt, la délégation d'assurance et la résiliation."
        schema={faqSchema}
      />

      <div className="pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-center mb-4">
              Questions fréquentes
            </h1>
            <p className="text-xl text-gray-600 text-center mb-12">
              Tout ce que vous devez savoir sur l'assurance emprunteur
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  Est-ce que je peux changer d'assurance emprunteur à tout moment ?
                </AccordionTrigger>
                <AccordionContent>
                  Oui, depuis la loi Lemoine de 2022, vous pouvez résilier votre assurance emprunteur à tout moment, sans frais ni pénalités. Cette loi renforce votre liberté de choix et vous permet de faire des économies importantes en changeant d'assurance.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Que faire si ma banque refuse ma nouvelle assurance ?
                </AccordionTrigger>
                <AccordionContent>
                  La banque ne peut pas refuser votre nouvelle assurance si elle présente des garanties équivalentes au contrat d'origine. En cas de refus, nous vous accompagnons dans vos démarches et fournissons tous les documents nécessaires pour faire valoir vos droits.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  Quels sont les délais pour changer d'assurance ?
                </AccordionTrigger>
                <AccordionContent>
                  Avec CREDIRIS, vous obtenez une réponse immédiate à votre demande de souscription. Une fois accepté, vous recevez votre attestation d'assurance dans la journée. Le changement effectif d'assurance prend généralement entre 2 et 3 semaines.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  Qui sont les assureurs partenaires ?
                </AccordionTrigger>
                <AccordionContent>
                  Nous travaillons avec des assureurs de premier plan comme AFI-ESCA, SwissLife et Generali. Ces partenaires sont reconnus pour leur solidité financière et la qualité de leurs garanties.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  Est-ce légal de changer d'assurance ?
                </AccordionTrigger>
                <AccordionContent>
                  Oui, c'est parfaitement légal. La loi Lemoine de 2022 garantit votre droit à changer d'assurance emprunteur à tout moment. C'est même recommandé si vous pouvez trouver une meilleure offre ailleurs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>
                  Comment fonctionne la signature électronique ?
                </AccordionTrigger>
                <AccordionContent>
                  La signature électronique est 100% légale et sécurisée. Après validation de votre dossier, vous recevez un lien par email pour signer électroniquement vos documents. La signature est certifiée et a la même valeur juridique qu'une signature manuscrite.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AnimatedSection>
        </div>
      </div>
    </Layout>
  );
}