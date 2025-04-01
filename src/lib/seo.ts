export const siteConfig = {
  title: "Crediris • Assurance Emprunteur 100% en ligne",
  description:
    "Simulez, comparez et souscrivez votre assurance emprunteur en ligne avec Crediris. Gain de temps, économies garanties, couverture optimale.",
  keywords: [
    "assurance emprunteur",
    "simulation assurance",
    "assurance prêt immobilier",
    "souscription en ligne",
    "devis assurance emprunteur",
  ],
  url: "https://www.crediris.com",
  image: "https://www.crediris.com/og-image.jpg",
};

export const defaultMetaTags = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: siteConfig.keywords.join(", "),
  "og:type": "website",
  "og:title": siteConfig.title,
  "og:description": siteConfig.description,
  "og:image": siteConfig.image,
  "og:url": siteConfig.url,
  "twitter:card": "summary_large_image",
  "twitter:title": siteConfig.title,
  "twitter:description": siteConfig.description,
  "twitter:image": siteConfig.image,
};
