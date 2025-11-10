# Synchronisation Automatique des Matchs

## Fonctionnement

Le système de synchronisation automatique des matchs avec The Odds API est entièrement configuré et fonctionne comme suit :

### En Production
- ✅ Synchronisation automatique toutes les heures
- ✅ Suppression automatique des anciens matchs
- ✅ Évitement des doublons via `external_api_id`
- ✅ Rafraîchissement automatique de la page Home
- ✅ Logs console détaillés

### En Développement Local (Environnement Conteneurisé)

**⚠️ Limitation :** Les appels vers l'API externe The Odds API sont bloqués dans l'environnement de développement conteneurisé pour des raisons de sécurité.

**Solution :** Utilisez le bouton **"Matchs Demo"** pour ajouter des matchs de test.

## Architecture

### 1. Edge Function `sync-matches`
- Localisation : `/supabase/functions/sync-matches/index.ts`
- Appelle The Odds API pour récupérer les matchs
- Filtre et nettoie les données
- Insère/met à jour dans Supabase

### 2. Fonction Client `syncMatches()`
- Localisation : `/lib/match-sync.ts`
- Appelle l'Edge Function
- Gère les erreurs
- Dispatch l'événement `matches-synced`

### 3. Auto-Sync
- Démarre automatiquement au chargement de la page Home
- Intervalle : 60 minutes
- Se désactive automatiquement au démontage du composant

### 4. Rafraîchissement Automatique
- La page Home écoute l'événement `matches-synced`
- Recharge automatiquement la liste des matchs
- Affiche "Aucun match à venir" si nécessaire

## Logs Console

```
🌀 Synchronisation Odds API...        # Début de la sync
✅ Matchs mis à jour { ... }          # Succès avec statistiques
⚠️ Aucun match trouvé                 # Aucun nouveau match
⚠️ Erreur lors de la synchronisation  # Erreur réseau/API
```

## Configuration

### Variables d'Environnement
- `ODDS_API_KEY` : Clé API The Odds API (configurée)
- `SUPABASE_URL` : URL Supabase (configurée)
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service Supabase (configurée)

### Compétitions Supportées
- 🇫🇷 Ligue 1
- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League
- 🇪🇸 La Liga
- 🇮🇹 Serie A
- 🇩🇪 Bundesliga
- ⭐ Champions League
- 🏆 Europa League
- 🥉 Europa Conference League

## Déploiement en Production

Une fois déployé en production (Netlify, Vercel, etc.), le système fonctionnera automatiquement sans aucune modification nécessaire.

## Test en Local

Pour tester la synchronisation localement :
1. Déployez l'application sur une plateforme cloud
2. Ou utilisez les matchs de démo avec le bouton "Matchs Demo"
