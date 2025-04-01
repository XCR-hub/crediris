// src/lib/seo.ts

export const seo = {
  title: "Crediris - Assurance Emprunteur",
  description:
    "Obtenez votre assurance emprunteur en ligne, rapidement et au meilleur prix.",
  openGraph: {
    type: "website",
    url: "https://www.crediris.fr",
    title: "Crediris - Assurance Emprunteur",
    description:
      "Obtenez votre assurance emprunteur en ligne, rapidement et au meilleur prix.",
    images: [
      {
        url: "/images/opengraph.jpg",
        width: 1200,
        height: 630,
        alt: "Crediris",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@CredirisFR",
    title: "Crediris",
    description: "Votre assurance emprunteur 100% digitale.",
    image: "/images/twitter-card.jpg",
  },
};
