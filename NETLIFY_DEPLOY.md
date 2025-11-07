# Guide de déploiement Netlify

## Variables d'environnement requises

Avant de déployer sur Netlify, vous DEVEZ configurer ces variables d'environnement :

### Étapes dans Netlify Dashboard :

1. Allez dans **Site settings** → **Environment variables** (ou **Build & deploy** → **Environment**)
2. Cliquez sur **Add a variable** ou **Edit variables**
3. Ajoutez les variables suivantes :

```
NEXT_PUBLIC_SUPABASE_URL=https://eoadmnhdvbrxatdgcsft.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYWRtbmhkdmJyeGF0ZGdjc2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTk5NTIsImV4cCI6MjA3NzkzNTk1Mn0.5cA06KgQQ5I6mC1RzZFG7zQ1kQePGIPGL0GqoaLBuEw
ODDS_API_KEY=ca99219a56903c64ec1834c6983bee5e
```

### Important :
- Ces variables doivent être disponibles pour **tous les contextes** : Production, Deploy Previews, et Branch deploys
- Netlify utilise Node.js 20 (configuré dans netlify.toml)
- Le plugin @netlify/plugin-nextjs est automatiquement installé

## Configuration automatique

Le fichier `netlify.toml` est déjà configuré avec :
- Commande de build : `npm run build`
- Répertoire de publication : `.next`
- Version Node.js : 20
- Plugin Next.js pour Netlify

## Déploiement

1. **Push votre code** sur GitHub
2. **Connectez votre repo** à Netlify
3. **Ajoutez les variables d'environnement** (voir ci-dessus)
4. **Déployez** !

Netlify détectera automatiquement la configuration et déploiera votre application Next.js.
