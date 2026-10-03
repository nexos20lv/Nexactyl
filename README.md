<p align="center">
  <br>
  <a href="https://nexactyl.com">
    <img src="https://raw.githubusercontent.com/jexactyl/jexactyl/main/public/assets/svgs/jexactyl.svg" width="200" alt="Nexactyl">
  </a>
  <br>
  <br>
</p>

<h1 align="center">Nexactyl Panel</h1>

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)]()

Nexactyl est le panel de gestion de serveurs de jeu ultime, rapide, sécurisé, et intégralement traduit en français. Conçu pour offrir l'expérience la plus aboutie aux hébergeurs et à leurs clients.

</div>

## ✨ Fonctionnalités Exclusives

- **Traduction Intégrale en Français** : 100% de l'interface client et administrateur traduite.
- **Gestionnaire de Mods & Versions Avancé** :
  - Installation en 1-clic pour **Paper, Purpur, Fabric et Vanilla**.
  - Recherche et installation de **Plugins, Mods et Modpacks** propulsé par l'API Modrinth.
  - Filtre automatique pour n'apparaître que sur les serveurs Minecraft.
- **Auto-Updater natif** : Mise à jour automatique de l'interface via ce dépôt GitHub.
- **Système de Crédits & Boutique Intégrée** (Système Jexactyl amélioré).
- Nettoyage des modules inutiles (Suppression de l'IA intrusive pour une interface plus claire).

## 🚀 Installation Rapide (Ubuntu 22.04 / 24.04)

Nous avons conçu un script d'installation automatique complet qui installe les dépendances (PHP 8.1, MariaDB, Node.js, etc.) et compile le panel pour vous. Exécutez cette commande en tant que `root` :

```bash
curl -sL https://raw.githubusercontent.com/nexos20lv/Nexactyl/master/install_nexactyl.sh | bash
```

Une fois l'installation terminée, suivez les instructions à l'écran pour finaliser la configuration de l'environnement, des emails, et créer votre compte administrateur.

## 🛠 Compilation Manuelle

Si vous développez sur le panel, vous aurez besoin de recompiler l'interface React :

```bash
# Installation des dépendances
pnpm install

# Compilation
pnpm build

# Nettoyage des caches Laravel
php artisan optimize:clear
```

## 📜 Licence

Nexactyl est un fork hautement modifié, distribué sous licence MIT. Il est basé sur le travail exceptionnel des équipes de Jexactyl et Pterodactyl.

