export interface SEOProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

export function generateMetaTags({
  title = "Crediris - Assurance emprunteur en ligne",
  description = "Simulez et souscrivez votre assurance emprunteur 100% en ligne avec Crediris. Rapide, sécurisé et sans engagement.",
  url = "https://www.crediris.com",
  image = "https://www.crediris.com/og-image.jpg",
}: SEOProps) {
  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
  `;
}
