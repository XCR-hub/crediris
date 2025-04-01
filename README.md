# Crediris - Assurance Emprunteur En Ligne

Plateforme de souscription d'assurance emprunteur 100% en ligne avec simulation instantanée et signature électronique.

## 🚀 Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Framer Motion
- Radix UI
- Lucide Icons

## 📋 Prérequis

- Node.js 20+
- npm 10+
- Compte Supabase

## 🛠 Installation

1. Cloner le repository :
```bash
git clone https://github.com/votre-org/crediris.git
cd crediris
```

2. Installer les dépendances :
```bash
npm install
```

3. Copier le fichier d'environnement :
```bash
cp .env.example .env
```

4. Configurer les variables d'environnement dans `.env` :
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AFI ESCA API
VITE_AFI_ESCA_WSDL_URL=https://api.afi-esca.com/ws
VITE_AFI_ESCA_LOGIN=your_login
VITE_AFI_ESCA_PASSWORD=your_password
VITE_AFI_ESCA_PARTNER_ID=your_partner_id

# Application
VITE_APP_URL=http://localhost:3000
```

5. Démarrer le serveur de développement :
```bash
npm run dev
```

## 🏗 Scripts

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build pour la production
- `npm run preview` - Preview de la build
- `npm run lint` - Lint du code
- `npm run format` - Formate le code avec Prettier
- `npm run test` - Lance les tests
- `npm run typecheck` - Vérifie les types TypeScript
- `npm run analyze` - Analyse la taille du bundle

## 📁 Structure du projet

```
src/
  ├── components/     # Composants React
  ├── lib/           # Utilitaires et hooks
  ├── pages/         # Pages de l'application
  ├── types/         # Types TypeScript
  └── main.tsx       # Point d'entrée
```

## 🔒 Sécurité

- CORS configuré
- CSP implémenté
- Headers de sécurité
- RLS Supabase activé
- Validation des données

## 📦 Déploiement

### Netlify

1. Connectez votre repository à Netlify
2. Configurez les variables d'environnement
3. Déployez avec les paramètres suivants :
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20

Le fichier `netlify.toml` est déjà configuré avec :
- Redirections pour le SPA
- Headers de sécurité
- Configuration du cache
- CSP

### Supabase

1. Créez un projet sur Supabase
2. Exécutez les migrations :
   ```bash
   supabase db push
   ```
3. Configurez les Edge Functions :
   ```bash
   supabase functions deploy
   ```

## 📝 License

MIT

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'feat: add amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request