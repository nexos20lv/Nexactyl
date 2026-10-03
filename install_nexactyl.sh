#!/bin/bash
# Nexactyl Panel Interactive Installation Script
# Compatible with Ubuntu 22.04 / 24.04 and Debian 11 / 12

set -e

# Couleurs
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}=================================================${NC}"
echo -e "${GREEN}      Installation Automatique de Nexactyl       ${NC}"
echo -e "${CYAN}=================================================${NC}"
echo ""

if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Ce script doit être exécuté en tant que root.${NC}" 
   exit 1
fi

echo -e "${CYAN}[1/7] Mise à jour du système et installation des dépendances...${NC}"
apt update -y
apt -y install software-properties-common curl apt-transport-https ca-certificates gnupg tar unzip git redis-server nginx certbot python3-certbot-nginx mariadb-server

echo -e "${CYAN}[2/7] Installation de PHP 8.4...${NC}"
curl -sSL https://packages.sury.org/php/README.txt | bash -x
apt update -y
apt -y install php8.4 php8.4-{common,cli,gd,mysql,mbstring,bcmath,xml,fpm,curl,zip}

echo -e "${CYAN}[3/7] Installation de Composer...${NC}"
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

echo -e "${CYAN}[4/7] Téléchargement de Nexactyl...${NC}"
mkdir -p /var/www/nexactyl
cd /var/www/nexactyl

# On clone le repo du fork de l'utilisateur
if [ ! -d ".git" ]; then
    git clone https://github.com/nexos20lv/Nexactyl.git .
else
    git pull
fi

chmod -R 755 storage/* bootstrap/cache/

echo -e "${CYAN}[5/7] Installation des dépendances Backend...${NC}"
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate --force

echo -e "${CYAN}[6/7] Création de la base de données...${NC}"
DB_PASS=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS nexactyl;"
mysql -u root -e "CREATE USER IF NOT EXISTS 'nexactyl'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';"
mysql -u root -e "GRANT ALL PRIVILEGES ON nexactyl.* TO 'nexactyl'@'127.0.0.1' WITH GRANT OPTION;"
mysql -u root -e "FLUSH PRIVILEGES;"

echo -e "${GREEN}Base de données créée avec succès !${NC}"
echo -e "Utilisateur : nexactyl"
echo -e "Mot de passe : ${DB_PASS}"

# Configuration automatique du fichier .env pour la BDD
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASS}/g" .env
sed -i "s/DB_DATABASE=.*/DB_DATABASE=nexactyl/g" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=nexactyl/g" .env

echo -e "${CYAN}[7/7] Compilation du Frontend (Node.js & pnpm)...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
npm install -g pnpm
pnpm install
pnpm build
php artisan optimize:clear

chown -R www-data:www-data /var/www/nexactyl/*

echo -e "${CYAN}=================================================${NC}"
echo -e "${GREEN}Installation terminée avec succès !${NC}"
echo -e "${CYAN}Il ne vous reste plus qu'à finaliser la configuration :${NC}"
echo -e "1. cd /var/www/nexactyl"
echo -e "2. php artisan p:environment:setup"
echo -e "3. php artisan migrate --seed --force"
echo -e "4. php artisan p:user:make"
echo -e "${CYAN}=================================================${NC}"

