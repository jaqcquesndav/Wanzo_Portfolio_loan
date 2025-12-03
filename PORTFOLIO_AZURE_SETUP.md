# Instructions de Configuration Azure - Wanzo Portfolio

## ✅ Fichiers de Production Créés

Les fichiers suivants ont été créés pour permettre le déploiement sur Azure :

1. **`production-server.js`** - Serveur Express pour production
2. **`production-package.json`** - Dépendances et scripts de production
3. **`.deployment`** - Configuration Azure (désactive le rebuild)
4. **`vite.config.ts`** - Modifié avec plugin de copie automatique
5. **`.github/workflows/main_wanzo-portfolio.yml`** - Pipeline CI/CD

---

## 📋 Étapes de Configuration Azure

### 1. Créer l'App Service Azure

Dans le portail Azure :

1. Créer un **Azure App Service**
   - Nom : `wanzo-portfolio`
   - Système : **Linux**
   - Runtime : **Node 20 LTS**
   - Région : Canada Central (ou votre région préférée)

2. Configuration du domaine personnalisé
   - Aller dans **Custom domains**
   - Ajouter le domaine : `portfolio.wanzzo.com`
   - Configurer le CNAME DNS chez votre fournisseur :
     ```
     Type: CNAME
     Name: portfolio
     Value: wanzo-portfolio.azurewebsites.net
     ```

3. Configuration SSL
   - Activer **HTTPS Only**
   - Certificat géré par Azure (gratuit)

---

### 2. Télécharger le Publish Profile

1. Dans le portail Azure, aller sur votre App Service `wanzo-portfolio`
2. Cliquer sur **Get publish profile** (dans la barre du haut)
3. Un fichier `.PublishSettings` sera téléchargé

---

### 3. Ajouter le Secret GitHub

1. Aller sur votre repository GitHub : `jaqcquesndav/Wanzo_Portfolio_loan`
2. Cliquer sur **Settings** → **Secrets and variables** → **Actions**
3. Cliquer sur **New repository secret**
4. Nom du secret : `AZUREAPPSERVICE_PUBLISHPROFILE_PORTFOLIO`
5. Valeur : Copier-coller **tout le contenu** du fichier `.PublishSettings`
6. Cliquer sur **Add secret**

---

### 4. Configuration Azure App Service

Dans les **Configuration** → **Application settings** de l'App Service :

```
SCM_DO_BUILD_DURING_DEPLOYMENT = false
WEBSITE_NODE_DEFAULT_VERSION = ~20
```

Dans **General settings** :
```
Stack: Node
Major version: 20 LTS
Minor version: 20 LTS
Startup Command: (laisser vide, npm start sera exécuté automatiquement)
```

---

## 🚀 Déploiement

### Premier Déploiement

1. Commit et push des changements :
```bash
git add .
git commit -m "Add Azure production configuration for portfolio app"
git push origin main
```

2. Le workflow GitHub Actions se déclenche automatiquement :
   - Build de l'application (Vite)
   - Copie automatique de `server.js` et `package.json` dans `dist/`
   - Upload de `dist/` comme artifact
   - Déploiement sur Azure

3. Vérifier les logs :
   - GitHub : Actions tab
   - Azure : App Service → Log stream

---

## 🔍 Vérification

### Tester le Déploiement

1. **URL temporaire Azure :**
   ```
   https://wanzo-portfolio.azurewebsites.net
   ```

2. **URL de production (après config DNS) :**
   ```
   https://portfolio.wanzzo.com
   ```

### Logs Azure

```bash
# Via Azure Portal
App Service → Log stream

# Ou via URL directe
https://wanzo-portfolio.scm.azurewebsites.net/api/logstream/
```

**Logs attendus :**
```
Starting container...
npm install --production
added 65 packages
Wanzo Portfolio app listening on port 8080
Site startup probe succeeded
Site started
```

---

## 📊 Architecture de Production

```
┌─────────────────────────────────────────────┐
│    GitHub Actions (CI/CD)                   │
│  1. npm install                             │
│  2. npm run build (Vite)                    │
│  3. Plugin copie server.js + package.json   │
│  4. Upload dist/ uniquement                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│    Azure Web App (wanzo-portfolio)          │
│  • Domaine: portfolio.wanzzo.com            │
│  • Runtime: Node 20 LTS (Linux)             │
│  • Exécute: npm start                       │
│  • prestart: npm install --production       │
│  • start: node server.js                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│    Express Server                           │
│  • Port: 8080 (Azure PORT env var)          │
│  • Sert fichiers statiques                  │
│  • Catch-all → index.html (SPA routing)     │
└─────────────────────────────────────────────┘
```

---

## 🔄 Comparaison avec Landing Page

| Aspect | Landing Page | Portfolio App |
|--------|-------------|----------------|
| **Domaine** | wanzzo.com | portfolio.wanzzo.com |
| **App Service** | wanzzo | wanzo-portfolio |
| **Base URL** | `/` | `/` |
| **Secret GitHub** | AZUREAPPSERVICE_PUBLISHPROFILE_XXX | AZUREAPPSERVICE_PUBLISHPROFILE_PORTFOLIO |
| **Repository** | Wanzo_Land | Wanzo_Portfolio_loan |

**Note importante :** Le `base: '/'` dans Vite car le sous-domaine `portfolio.wanzzo.com` sert l'app à la racine, pas dans un sous-dossier.

---

## ⚠️ Points Importants

### 1. Structure du dist/ Déployé

```
dist/
├── index.html              # SPA entry point
├── server.js               # Express server (copié automatiquement)
├── package.json            # Production deps (copié automatiquement)
└── assets/
    ├── index-*.js          # Bundles JS
    ├── index-*.css         # Styles compilés
    └── *.png, *.svg        # Assets optimisés
```

### 2. Routing SPA

Le serveur Express gère toutes les routes :
- `/` → `index.html`
- `/dashboard` → `index.html` (React Router prend le relais)
- `/portfolio/123` → `index.html`
- `/assets/index.js` → Fichier statique servi directement

### 3. Variables d'Environnement

Pour ajouter des variables d'environnement (API keys, etc.) :

1. Azure Portal → App Service → Configuration
2. Application settings → New application setting
3. Ajouter vos variables (ex: `VITE_API_URL`, `VITE_SUPABASE_URL`)

**Important :** Les variables `VITE_*` doivent être configurées **au moment du build**, pas au runtime. Pour les utiliser :
- Les ajouter dans les **GitHub Actions secrets**
- Les injecter pendant le build

---

## 🐛 Dépannage

### Problème : "Site waiting for your content"

**Cause :** Azure ne trouve pas le serveur

**Solution :**
1. Vérifier que `dist/` contient `server.js` et `package.json`
2. Vérifier les logs Azure pour les erreurs npm

### Problème : Routes 404 (ex: /dashboard)

**Cause :** Serveur ne redirige pas vers index.html

**Solution :**
- Vérifier que `server.js` contient le catch-all `app.get('*', ...)`

### Problème : Build échoue dans GitHub Actions

**Causes possibles :**
1. Erreurs TypeScript → Corriger les erreurs
2. Dépendances manquantes → Vérifier `package.json`
3. JavaScript heap out of memory → Script build déjà configuré avec `--max-old-space-size=4096`

### ⚠️ Problème : Workflow déploie le repo entier au lieu de dist/

**Symptôme :** Site affiche "waiting for content" malgré déploiement réussi

**Solution :** Le workflow est déjà configuré correctement avec `path: dist/` ✅

### ⚠️ Problème : Mauvais secret de déploiement

**Solution :** Utiliser le nom EXACT du secret créé dans GitHub :
```yaml
publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_PORTFOLIO }}
```

### ⚠️ Problème : JavaScript heap out of memory

**Solution :** Déjà configuré dans `package.json` :
```json
"build": "node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build"
```

---

## 📝 Checklist Avant le Premier Déploiement

- [ ] Azure App Service créé (wanzo-portfolio)
- [ ] Publish Profile téléchargé depuis Azure
- [ ] Secret GitHub `AZUREAPPSERVICE_PUBLISHPROFILE_PORTFOLIO` configuré
- [ ] DNS CNAME configuré (portfolio → wanzo-portfolio.azurewebsites.net)
- [ ] SSL/HTTPS activé dans Azure
- [ ] Fichiers de production créés localement ✅
- [ ] Commit et push sur `main`
- [ ] Workflow GitHub Actions vérifié (onglet Actions)
- [ ] Site accessible sur portfolio.wanzzo.com

---

## 🎯 Prochaines Étapes

Une fois le déploiement réussi :

1. **Monitoring :** Activer Application Insights pour tracking
2. **CI/CD :** Ajouter des tests automatiques avant déploiement
3. **Performance :** Activer Azure CDN pour les assets statiques
4. **Sécurité :** Ajouter Helmet.js pour headers de sécurité
5. **Scaling :** Configurer autoscaling si nécessaire

---

**Status :** ✅ Configuration prête pour production  
**Date :** 3 décembre 2025  
**Environnement :** Azure App Service (Linux, Node 20 LTS)  
**Domaine :** portfolio.wanzzo.com
