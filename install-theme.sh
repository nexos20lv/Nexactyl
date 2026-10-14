#!/usr/bin/env bash

# ==============================================================================
#  NXSLab • Obsidian & Apple Fluid UI Theme - Installateur Universel Clé en Main
# ==============================================================================
#  Ce script automatise l'installation, les migrations, la compilation et le
#  déploiement du thème pour n'importe quelle instance Pterodactyl Panel (v1.11 / v1.12).
# ==============================================================================

set -e

# Couleurs & Formatage
BOLD='\033[1m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${PURPLE}${BOLD}"
echo "  _   ___   ______  _           _     "
echo " | \ | \ \ / / ___|| |    __ _ | |__  "
echo " |  \| |\ V /\___ \| |   / _\` || '_ \ "
echo " | |\  | > <  ___) | |__| (_| || |_) |"
echo " |_| \_//_/ \_\____/|_____\__,_||_.__/ "
echo -e "${NC}"
echo -e "${CYAN}${BOLD}==> Déploiement du Thème Obsidian & Apple Fluid UI pour Pterodactyl Panel <==${NC}\n"

# 1. Vérification des privilèges
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[ERREUR] Ce script doit être exécuté avec les privilèges root (sudo).${NC}"
    exit 1
fi

PANEL_DIR="/var/www/pterodactyl"
if [ ! -d "$PANEL_DIR" ]; then
    echo -e "${RED}[ERREUR] Le dossier $PANEL_DIR n'existe pas.${NC}"
    exit 1
fi

cd "$PANEL_DIR"

# 2. Vérification des dépendances système
echo -e "${YELLOW}[1/6] Vérification des outils requis (PHP, Node, Yarn, Composer)...${NC}"

for cmd in php yarn node composer; do
    if ! command -v "$cmd" &> /dev/null; then
        echo -e "${RED}[ERREUR] L'outil '$cmd' est introuvable. Veuillez l'installer avant de continuer.${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✓ Tous les prérequis sont installés.${NC}"

# 3. Application des migrations de base de données
echo -e "\n${YELLOW}[2/6] Exécution des migrations de base de données (Boutique, Boosters, Sous-domaines)...${NC}"
php artisan migrate --force
echo -e "${GREEN}✓ Migrations appliquées avec succès.${NC}"

# 4. Installation des paquets Node.js
echo -e "\n${YELLOW}[3/6] Vérification et installation des dépendances Node/Yarn...${NC}"
yarn install --frozen-lockfile --production=false
echo -e "${GREEN}✓ Dépendances Node prêtes.${NC}"

# 5. Compilation Webpack de Production
echo -e "\n${YELLOW}[4/6] Compilation des assets de production (Webpack & TypeScript)...${NC}"
yarn build:production
echo -e "${GREEN}✓ Compilation Webpack terminée avec succès.${NC}"

# 6. Vidage et réchauffage des caches Laravel
echo -e "\n${YELLOW}[5/6] Nettoyage et optimisation des caches Laravel...${NC}"
php artisan optimize:clear
php artisan view:clear
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:cache
echo -e "${GREEN}✓ Caches Laravel synchronisés.${NC}"

# 7. Correction stricte des permissions système
echo -e "\n${YELLOW}[6/6] Application des droits et permissions de sécurité (www-data)...${NC}"
chown -R www-data:www-data "$PANEL_DIR"
chmod -R 755 "$PANEL_DIR/storage" "$PANEL_DIR/bootstrap/cache"
echo -e "${GREEN}✓ Permissions appliquées avec succès.${NC}"

# Bannière finale
echo -e "\n${PURPLE}${BOLD}========================================================================${NC}"
echo -e "${GREEN}${BOLD}🎉 Félicitations ! Le Thème Obsidian & Apple Fluid UI est installé !${NC}"
echo -e "${PURPLE}${BOLD}========================================================================${NC}"
echo -e "${CYAN}Pour personnaliser l'apparence, connectez-vous en tant qu'administrateur :${NC}"
echo -e "  🌐 Panel Admin : ${BOLD}/admin/settings/nxslab${NC}"
echo -e "     - Changer le nom de marque (Whitelabel), le slogan et le logo"
echo -e "     - Définir l'accent par défaut (Violet, Azur, Émeraude, Carmin, Ambre, Fuchsia)"
echo -e "     - Configurer la monnaie du Store (ex: Crédits, cr)"
echo -e "     - Activer les sous-domaines gratuits avec Cloudflare DNS automatique"
echo -e ""
echo -e "${CYAN}Chaque utilisateur peut également choisir son accent personnalisé depuis :${NC}"
echo -e "  👤 Mon Compte : ${BOLD}/account${NC}"
echo -e "${PURPLE}${BOLD}========================================================================${NC}\n"
