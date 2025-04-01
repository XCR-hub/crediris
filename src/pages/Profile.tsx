import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ProfileContent } from '@/components/profile/ProfileContent';

// Schema.org structured data for profile page
const schema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "name": "Mon profil Crediris",
  "description": "Gérez vos informations personnelles et suivez vos demandes d'assurance emprunteur",
  "provider": {
    "@type": "Organization",
    "name": "Crediris",
    "url": "https://www.crediris.fr"
  }
};

export default function Profile() {
  return (
    <AuthGuard>
      <Helmet>
        <title>Mon profil - Crediris</title>
        <meta 
          name="description" 
          content="Gérez vos informations personnelles et suivez vos demandes d'assurance emprunteur." 
        />
        <meta name="robots" content="noindex,nofollow" />
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>

      <ProfileContent />
    </AuthGuard>
  );
}