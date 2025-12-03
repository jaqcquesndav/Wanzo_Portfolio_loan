# Instructions de Configuration Azure - Wanzo Accounting

## ✅ Fichiers de Production Créés

Les fichiers suivants ont été créés pour permettre le déploiement sur Azure :

1. **`production-server.js`** - Serveur Express pour production
2. **`production-package.json`** - Dépendances et scripts de production
3. **`.deployment`** - Configuration Azure (désactive le rebuild)
4. **`vite.config.ts`** - Modifié avec plugin de copie automatique
5. **`.github/workflows/main_wanzo-accounting.yml`** - Pipeline CI/CD

---

## 📋 Étapes de Configuration Azure

### 1. Créer l'App Service Azure

Dans le portail Azure :

1. Créer un **Azure App Service**
   - Nom : `wanzo-accounting`
   - Système : **Linux**
   - Runtime : **Node 20 LTS**
   - Région : Canada Central (ou votre région préférée)

2. Configuration du domaine personnalisé
   - Aller dans **Custom domains**
   - Ajouter le domaine : `accounting.wanzzo.com`
   - Configurer le CNAME DNS chez votre fournisseur :
     ```
     Type: CNAME
     Name: accounting
     Value: wanzo-accounting.azurewebsites.net
     ```

3. Configuration SSL
   - Activer **HTTPS Only**
   - Certificat géré par Azure (gratuit)

---

### 2. Télécharger le Publish Profile

1. Dans le portail Azure, aller sur votre App Service `wanzo-accounting`
2. Cliquer sur **Get publish profile** (dans la barre du haut)
3. Un fichier `.PublishSettings` sera téléchargé

---

### 3. Ajouter le Secret GitHub

1. Aller sur votre repository GitHub : `jaqcquesndav/wanzo_compta`
2. Cliquer sur **Settings** → **Secrets and variables** → **Actions**
3. Cliquer sur **New repository secret**
4. Nom du secret : `AZUREAPPSERVICE_PUBLISHPROFILE_ACCOUNTING`
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
git commit -m "Add Azure production configuration"
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
   https://wanzo-accounting.azurewebsites.net
   ```

2. **URL de production (après config DNS) :**
   ```
   https://accounting.wanzzo.com
   ```

### Logs Azure

```bash
# Via Azure Portal
App Service → Log stream

# Ou via URL directe
https://wanzo-accounting.scm.azurewebsites.net/api/logstream/
```

**Logs attendus :**
```
Starting container...
npm install --production
added 65 packages
Wanzo Accounting app listening on port 8080
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
│    Azure Web App (wanzo-accounting)         │
│  • Domaine: accounting.wanzzo.com           │
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

## 🔄 Différences avec Landing Page

| Aspect | Landing Page | Accounting App |
|--------|-------------|----------------|
| **Domaine** | wanzzo.com | accounting.wanzzo.com |
| **App Service** | wanzzo | wanzo-accounting |
| **Base URL** | `/` | `/` (pas `/accounting/`) |
| **Secret GitHub** | AZUREAPPSERVICE_PUBLISHPROFILE_XXX | AZUREAPPSERVICE_PUBLISHPROFILE_ACCOUNTING |
| **Repository** | Wanzo_Land | wanzo_compta |

**Note importante :** Le `base: '/'` dans Vite car le sous-domaine `accounting.wanzzo.com` sert l'app à la racine, pas dans un sous-dossier.

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
- `/journals/123` → `index.html`
- `/assets/index.js` → Fichier statique servi directement

### 3. Variables d'Environnement

Pour ajouter des variables d'environnement (API keys, etc.) :

1. Azure Portal → App Service → Configuration
2. Application settings → New application setting
3. Ajouter vos variables (ex: `VITE_API_URL`, `VITE_AUTH0_DOMAIN`)

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
3. Tests échouent → Désactiver temporairement ou corriger

### ⚠️ Problème : Déploiement réussi mais site reste "waiting for content"

**Symptômes :**
- GitHub Actions build réussit ✅
- Déploiement Azure réussit ✅
- Mais le site affiche toujours "Your web app is running and waiting for your content"
- Version de déploiement Azure ne change jamais (reste sur ancienne version)

**Causes identifiées :**

#### 1. Workflow déploie le dépôt entier au lieu de dist/

**Problème :** Dans `.github/workflows/main_*.yml`, si vous uploadez le dépôt complet :
```yaml
- name: Upload artifact for deployment job
  uses: actions/upload-artifact@v4
  with:
    name: node-app
    path: .  # ❌ MAUVAIS - déploie tout le repo
```

**Solution :** Uploader UNIQUEMENT le dossier `dist/` :
```yaml
- name: Upload artifact for deployment job
  uses: actions/upload-artifact@v4
  with:
    name: node-app
    path: dist/  # ✅ CORRECT - déploie seulement les fichiers buildés
```

**Pourquoi c'est critique :**
- Azure cherche `package.json` à la racine du déploiement
- Si vous déployez le repo entier, Azure trouve le `package.json` de développement
- Ce package.json contient des devDependencies et pas de script `start` adapté
- Azure ne démarre jamais le serveur Express

#### 2. Mauvais secret de déploiement Azure

**Problème :** Le workflow utilise un secret qui n'existe pas dans GitHub :
```yaml
publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_ACCOUNTING }}
# ❌ Ce secret n'existe pas
```

**Erreur dans logs :**
```
Error: Deployment Failed, Error: No credentials found. 
Add an Azure login action before this action.
```

**Solution :** Utiliser le secret qui existe réellement :
```yaml
publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_07A533CD3FA84844BF4FBC50B8ECB58F }}
# ✅ Secret existant dans le repository
```

**Comment vérifier :**
1. GitHub → Repository → Settings → Secrets and variables → Actions
2. Copier le nom EXACT du secret (respecter la casse)
3. Utiliser ce nom dans le workflow

#### 3. Plusieurs workflows en conflit

**Problème :** Plusieurs fichiers workflow avec des noms différents :
- `.github/workflows/main_wanzo-accounting.yml`
- `.github/workflows/main_wzaccounting.yml`
- `.github/workflows/main_wanzzo.yml`

**Solution :**
1. Azure utilise le workflow dont le nom correspond à l'App Service
2. Pour `wanzo-accounting` → Utiliser `main_wanzo-accounting.yml`
3. Pour `wzaccounting` → Utiliser `main_wzaccounting.yml`
4. Désactiver ou supprimer les workflows inutiles

#### 4. Configuration environment manquante

**Problème initial :** Même avec le bon secret, erreur "No credentials found"

**Solution :** Ajouter la section `environment` dans le job deploy :
```yaml
deploy:
  runs-on: ubuntu-latest
  needs: build
  environment:
    name: 'Production'
    url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}
```

**Note :** Cette solution a été tentée mais le vrai problème était le mauvais nom de secret.

### ⚠️ Problème : JavaScript heap out of memory

**Symptôme :**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Cause :** L'application est très volumineuse (7.2GB+ après minification)

**Solution :** Augmenter la mémoire Node.js dans le script build :
```json
{
  "scripts": {
    "build": "node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build"
  }
}
```

### ⚠️ Problème : Plugin Vite ne copie pas les fichiers

**Symptôme :** `server.js` et `package.json` manquants dans `dist/` après build

**Causes possibles :**
1. Le contenu des fichiers est identique → Pas de modification de timestamp
2. Le plugin utilise `copyFileSync` qui peut échouer silencieusement

**Solution préventive :** Vérifier manuellement après build :
```bash
ls dist/
# Doit contenir : index.html, assets/, server.js, package.json
```

Si manquant, copier manuellement :
```bash
cp production-server.js dist/server.js
cp production-package.json dist/package.json
```

### 📊 Processus de Résolution Complet (Cas Accounting App)

**Chronologie des problèmes rencontrés :**

1. ✅ **Fichiers de production créés** (server.js, package.json, plugin Vite)
2. ✅ **Build réussit localement** (après augmentation heap memory)
3. ✅ **GitHub Actions build réussit**
4. ❌ **Site Azure affiche "waiting for content"**
5. 🔍 **Investigation :** Vérification Kudu → Fichiers corrects dans `/home/site/wwwroot`
6. 🔍 **Logs Azure :** Toujours même ancienne version de déploiement
7. 🔍 **Analyse workflows :** 3 fichiers trouvés
8. 🔍 **Lecture main_wzaccounting.yml :** Découverte `path: .` au lieu de `path: dist/`
9. ✅ **Fix 1 :** Changement de `path: .` → `path: dist/`
10. ❌ **Erreur :** "No credentials found"
11. ✅ **Fix 2 :** Ajout section `environment` (sans effet)
12. ✅ **Fix 3 :** Changement du nom du secret vers celui existant
13. ✅ **Déploiement réussi !** Site fonctionne sur accounting.wanzzo.com

**Leçons apprises :**
- Toujours vérifier quel workflow est actif (basé sur le nom de l'App Service)
- Le `path` dans `upload-artifact` est CRITIQUE - doit pointer vers `dist/`
- Les secrets doivent avoir le nom EXACT configuré dans GitHub
- La section `environment` n'est pas obligatoire si le secret est correct
- Vérifier la version de déploiement dans Azure logs pour confirmer qu'un nouveau déploiement est appliqué

---

## 📝 Checklist Avant le Premier Déploiement

- [ ] Azure App Service créé (wanzo-accounting)
- [ ] Publish Profile téléchargé depuis Azure
- [ ] Secret GitHub `AZUREAPPSERVICE_PUBLISHPROFILE_ACCOUNTING` configuré
- [ ] DNS CNAME configuré (accounting → wanzo-accounting.azurewebsites.net)
- [ ] SSL/HTTPS activé dans Azure
- [ ] Fichiers de production créés localement
- [ ] Commit et push sur `main`
- [ ] Workflow GitHub Actions vérifié (onglet Actions)
- [ ] Site accessible sur accounting.wanzzo.com

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
