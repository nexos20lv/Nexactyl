# 🎨 Guide de Personnalisation & Déploiement Universel

Bienvenue sur la documentation complète du thème **NXSLab • Obsidian & Apple Fluid UI** pour Pterodactyl Panel (v1.11 / v1.12).

Ce thème a été conçu pour être **100% universel, personnalisable à l'infini et adaptable en marque blanche (whitelabel)** par n'importe quel hébergeur, communauté de jeu ou administrateur système.

---

## ⚡ Installation Rapide Clé en Main (1 Commande)

Si vous avez cloné ou mis à jour le dépôt sur votre serveur :

```bash
cd /var/www/pterodactyl
sudo bash install-theme.sh
```

Le script s'occupe automatiquement de :
1. Vérifier les outils (`PHP`, `Node`, `Yarn`, `Composer`).
2. Appliquer les migrations de base de données (Boutique, Boosters, Sous-domaines).
3. Installer les dépendances Node.js.
4. Compiler les assets de production Webpack (`yarn build:production`).
5. Nettoyer et régénérer tous les caches Laravel (`php artisan optimize:clear`).
6. Rétablir les permissions strictes de sécurité (`www-data:www-data`).

---

## 🏢 Marque Blanche (Whitelabel Hub) depuis le Panel Admin

Rendez-vous dans votre espace d'administration sur l'onglet dédié :
👉 **Admin CP > Settings > NXSLab & Personnalisation** (`/admin/settings/nxslab`)

### 1. Identité Visuelle & Marque
| Champ | Description | Exemple |
|---|---|---|
| **Nom de la Plateforme / Marque** | Remplace "NXSLab" sur tout le site (titres, en-tête, sidebar, footer, console, page de connexion). | `NovaCloud`, `PixelHost`, `MonServeur` |
| **Slogan / Sous-titre** | Affiché sous le nom dans la barre latérale et au bas des pages. | `Hébergement Cloud Haute Performance` |
| **URL du Logo Personnalisé** | Lien HTTPS direct vers votre logo (PNG ou SVG transparent). Si laissé vide, affiche l'icône par défaut. | `https://monsite.com/assets/logo.png` |
| **Texte de Bas de Page (Footer)** | Copyright personnalisé au bas du panneau client. | `© 2026 NovaCloud • Tous droits réservés` |

### 2. Thème & Couleurs d'Accent par Défaut
Vous pouvez choisir la couleur lumineuse par défaut appliquée à tous les nouveaux visiteurs :
- 🟣 **Obsidian Violet** : Style signature sombre et cyberpunk (`#8b5cf6`)
- 🔵 **Neon Azure** : Bleu néon azur éclatant (`#38bdf8`)
- 🟢 **Matrix Emerald** : Vert émeraude matrix pur (`#34d399`)
- 🔴 **Cyber Crimson** : Rouge carmin passionné (`#f43f5e`)
- 🟠 **Sunset Amber** : Ambre solaire doré (`#fbbf24`)
- 🌸 **Neon Fuchsia** : Fuchsia cyberpunk haute saturation (`#e879f9`)

### 3. Économie & Monnaie de la Boutique
| Paramètre | Description | Valeur par défaut |
|---|---|---|
| **Nom de la Monnaie** | Nom affiché dans la boutique et sur les soldes. | `Crédits`, `Coins`, `Gemmes`, `Points` |
| **Symbole Monétaire** | Abréviation ou symbole accolé aux valeurs numériques. | `cr`, `🪙`, `💎`, `pts` |
| **Crédits de Bienvenue** | Montant offert à l'inscription de chaque nouveau compte. | `2500` |
| **Coûts des Boosters** | Tarifs personnalisables pour +1 Go RAM, +25% CPU, +10 Go SSD, +2 Sauvegardes. | Configurable en temps réel |

---

## 👤 Personnalisation par l'Utilisateur Final (`/account`)

Chaque utilisateur dispose d'un contrôle total sur son expérience visuelle :

### 1. Sélecteur de Thème & Couleurs d'Accent (Apple Fluid)
- Accessible dans **Mon Compte** (`/account`).
- **Aperçu Instantané** : Le changement d'accent s'applique immédiatement en direct sur l'ensemble de l'interface (sidebar, boutons, barres de défilement, sélections de texte) sans aucun rechargement de page.
- **Mémorisation locale** : Le choix est sauvegardé dans le navigateur du client.
- **Bouton « Rétablir »** : Permet à l'utilisateur de réinitialiser son thème sur celui configuré par l'administrateur.

### 2. Avatar & Photo de Profil (PFP) Custom
- **Téléversement Direct** : Glisser-déposer ou sélection de fichier jusqu'à 5 Mo (PNG, JPG, WebP, GIF).
- **Lien Direct URL** : Lien HTTPS public (Avatar Discord, Gravatar, Imgur, etc.).
- **Suppression 1-clic** : Retour instantané à l'avatar Gravatar officiel.

---

## 🌐 Configuration des Sous-Domaines Gratuits & Cloudflare DNS

Permet à chaque propriétaire de serveur Minecraft de bénéficier d'une adresse personnalisée (ex: `play.monserveur.in`) sans avoir à mémoriser l'adresse IP et le port numérique.

### Étapes de configuration Cloudflare :
1. Connectez-vous sur [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Sélectionnez votre domaine (ex: `nxslab.in`) et copiez le **Zone ID** situé en bas à droite de la page d'accueil du domaine.
3. Allez dans **My Profile > API Tokens > Create Token** :
   - Choisissez le template **Edit zone DNS** ou créez un token personnalisé.
   - Permissions :
     - `Zone` > `DNS` > `Edit`
     - `Zone` > `Zone` > `Read`
   - Zone Resources : `Include` > `All zones` (ou votre zone spécifique).
4. Copiez le token généré et collez-le dans **Admin CP > Settings > NXSLab** :
   - **Cloudflare API Token** : Votre token secret.
   - **Cloudflare Zone ID** : Votre ID de zone.
   - Cochez **Création & suppression automatique des enregistrements DNS SRV**.
5. Cliquez sur **Tester la connexion Cloudflare** pour valider en 1 seconde.

---

## 🎮 Modules Spéciaux Intégrés

1. **Éditeur Visuel de Configuration Minecraft** (`/server/:id/minecraft/config`) :
   - Modification de `server.properties` via des toggles ergonomiques Apple (PvP, Difficulté, Whitelist, Distance de vue, Slots max, etc.).
   - Éditeur de Message du Jour (MOTD) avec aperçu fidèle de la liste des serveurs in-game.

2. **Gestionnaire des Joueurs en Direct** (`/server/:id/players`) :
   - Affichage en temps réel des joueurs connectés avec têtes/skins Minecraft (Minotar).
   - Actions 1-clic : OP, Dé-OP, Kick, Bannissement, Téléportation et Message privé.

3. **Navigateur de Versions & Mods/Plugins** (`/server/:id/versions`) :
   - Installation 1-clic des moteurs Paper, Purpur, Fabric, NeoForge, Vanilla.
   - Intégration de l'API Modrinth v2 pour installer des plugins et mods en un clic.

4. **Boutique de Boosters Matériels** (`/server/:id/store`) :
   - Boosts matériels à la volée synchronisés directement avec Wings (`/build`) sans redémarrage du conteneur Docker.

---

## 🛠️ Commandes Utiles de Maintenance

```bash
# Vérifier la validité TypeScript
yarn tsc --noEmit

# Vérifier et corriger le style ESLint
yarn lint --fix

# Recompiler les assets pour la production
yarn build:production

# Vider tous les caches du panel
php artisan optimize:clear
```
