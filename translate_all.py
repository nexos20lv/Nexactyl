import os
import re

# We use word boundaries or exact HTML/JSX structures to avoid breaking code.
# The format is either exact string replacement or regex.
replacements = {
    # Navigation & General
    r">Dashboard<": ">Tableau de bord<",
    r">Account<": ">Compte<",
    r">Security<": ">Sécurité<",
    r">Activity<": ">Activités<",
    r">Tickets<": ">Tickets<",
    r">Billing<": ">Facturation<",
    r">Orders<": ">Commandes<",
    r">Logout<": ">Déconnexion<",
    r">Cancel<": ">Annuler<",
    r">Save<": ">Sauvegarder<",
    r">Delete<": ">Supprimer<",
    r">Create<": ">Créer<",
    r">Update<": ">Mettre à jour<",
    r">Submit<": ">Envoyer<",
    r">Close<": ">Fermer<",
    r">Yes<": ">Oui<",
    r">No<": ">Non<",
    r">Continue<": ">Continuer<",
    r">Go Back<": ">Retour<",
    r">Refresh<": ">Actualiser<",
    r">Search<": ">Rechercher<",
    r">Loading\.\.\.<": ">Chargement...<",
    r">None<": ">Aucun<",
    r">Required<": ">Requis<",
    r">Optional<": ">Optionnel<",

    # Account
    r">Account Overview<": ">Aperçu du compte<",
    r">Update Password<": ">Mettre à jour le mot de passe<",
    r"label={'Current Password'}": "label={'Mot de passe actuel'}",
    r"label={'New Password'}": "label={'Nouveau mot de passe'}",
    r"label={'Confirm Password'}": "label={'Confirmer le mot de passe'}",
    r">Update Email<": ">Mettre à jour l'email<",
    r">Two-Factor Authentication<": ">Authentification à deux facteurs<",
    r">Enable Two-Factor<": ">Activer l'A2F<",
    r">Disable Two-Factor<": ">Désactiver l'A2F<",
    r">API Credentials<": ">Identifiants API<",
    r">SSH Keys<": ">Clés SSH<",
    r">Add SSH Key<": ">Ajouter une clé SSH<",
    r">Description<": ">Description<",
    r">Save Key<": ">Sauvegarder la clé<",

    # Server Navigation
    r">Console<": ">Console<",
    r">Files<": ">Fichiers<",
    r">Databases<": ">Bases de données<",
    r">Schedules<": ">Tâches planifiées<",
    r">Users<": ">Utilisateurs<",
    r">Backups<": ">Sauvegardes<",
    r">Network<": ">Réseau<",
    r">Startup<": ">Démarrage<",
    r">Settings<": ">Paramètres<",
    r">Activity Logs<": ">Historique d'activité<",

    # Console
    r"placeholder={'Type a command\.\.\.'}": "placeholder={'Tapez une commande...'}",
    r">Type a command\.\.\.<": ">Tapez une commande...<",
    r">Start<": ">Démarrer<",
    r">Restart<": ">Redémarrer<",
    r">Stop<": ">Arrêter<",
    r">Kill<": ">Forcer l'arrêt<",
    r">Offline<": ">Hors ligne<",
    r">Running<": ">En ligne<",
    r">Starting<": ">Démarrage<",
    r">Stopping<": ">Arrêt<",
    r">Memory<": ">RAM<",
    r"label={'Memory'}": "label={'RAM'}",
    r"label={'Disk'}": "label={'Disque'}",
    r">Disk<": ">Disque<",
    r">CPU Load<": ">Charge CPU<",
    r">Uptime<": ">Temps en ligne<",
    r">Server Details<": ">Détails du serveur<",
    
    # Files
    r">File Manager<": ">Gestionnaire de fichiers<",
    r">Mass Actions<": ">Actions de masse<",
    r">Create Directory<": ">Créer un dossier<",
    r">New File<": ">Nouveau fichier<",
    r">Upload<": ">Uploader<",
    r">Rename<": ">Renommer<",
    r">Move<": ">Déplacer<",
    r">Copy<": ">Copier<",
    r">Download<": ">Télécharger<",
    r">Archive<": ">Archiver<",
    r">Unarchive<": ">Désarchiver<",
    r">Delete Files<": ">Supprimer les fichiers<",
    r">Delete File<": ">Supprimer le fichier<",
    r">Rename File<": ">Renommer le fichier<",
    r"label={'File Name'}": "label={'Nom du fichier'}",
    r"label={'Folder Name'}": "label={'Nom du dossier'}",
    r"title={'Create Folder'}": "title={'Créer un dossier'}",
    r">Create Folder<": ">Créer le dossier<",
    r">Edit File<": ">Modifier le fichier<",
    r">Save Content<": ">Sauvegarder le contenu<",

    # Databases
    r">New Database<": ">Nouvelle base de données<",
    r">Create Database<": ">Créer la base<",
    r"label={'Database Name'}": "label={'Nom de la base'}",
    r"label={'Connections From'}": "label={'Connexions depuis'}",
    r">Endpoint<": ">Point d'accès<",
    r">Username<": ">Nom d'utilisateur<",
    r">Password<": ">Mot de passe<",
    
    # Schedules
    r">Create Schedule<": ">Créer une tâche<",
    r"label={'Schedule Name'}": "label={'Nom de la tâche'}",
    r">Minute<": ">Minute<",
    r">Hour<": ">Heure<",
    r">Day of Month<": ">Jour du mois<",
    r">Month<": ">Mois<",
    r">Day of Week<": ">Jour de la semaine<",
    r"label={'Only When Server Is Online'}": "label={'Uniquement si le serveur est en ligne'}",
    r">New Task<": ">Nouvelle action<",
    r">Run Now<": ">Exécuter maintenant<",
    
    # Users
    r">New User<": ">Nouvel utilisateur<",
    r">Email Address<": ">Adresse Email<",
    r"label={'Email Address'}": "label={'Adresse Email'}",
    r">Invite User<": ">Inviter l'utilisateur<",
    r">Permissions<": ">Permissions<",
    r">Select All<": ">Tout sélectionner<",
    r">Deselect All<": ">Tout désélectionner<",
    
    # Backups
    r">Create Backup<": ">Créer une sauvegarde<",
    r"title={'Create Backup'}": "title={'Créer une sauvegarde'}",
    r"label={'Backup Name'}": "label={'Nom de la sauvegarde'}",
    r"label={'Ignored Files & Directories'}": "label={'Fichiers & Dossiers ignorés'}",
    r">Start Backup<": ">Lancer la sauvegarde<",
    r">Delete Backup<": ">Supprimer la sauvegarde<",
    r"title={'Delete Backup'}": "title={'Supprimer la sauvegarde'}",
    r">Restore<": ">Restaurer<",
    r">Restore Backup<": ">Restaurer la sauvegarde<",
    
    # Network
    r">Create Allocation<": ">Créer une allocation<",
    r">Delete Allocation<": ">Supprimer l'allocation<",
    r">Make Primary<": ">Définir principal<",
    r">IP Address<": ">Adresse IP<",
    r">Port<": ">Port<",
    r">Alias<": ">Alias<",

    # Startup
    r">Startup Command<": ">Commande de démarrage<",
    r">Docker Image<": ">Image Docker<",
    r">Variables<": ">Variables<",

    # Settings
    r">Server Name<": ">Nom du serveur<",
    r"label={'Server Name'}": "label={'Nom du serveur'}",
    r">Reinstall Server<": ">Réinstaller le serveur<",
    r">Reinstall<": ">Réinstaller<",
    r">SFTP Details<": ">Détails SFTP<",
    r">Launch SFTP<": ">Lancer SFTP<",
    r">Server Address<": ">Adresse du serveur<",
    r">Your server will be stopped and some files may be deleted or modified during this process, are you sure you wish to continue\?<": ">Votre serveur sera arrêté et certains fichiers pourront être modifiés ou supprimés, voulez-vous continuer ?<",
    
    # Activity
    r">No activity logs found\.<": ">Aucun historique d'activité trouvé.<",
    
    # Auth
    r">Login<": ">Connexion<",
    r">Register<": ">S'inscrire<",
    r"label={'Username or Email'}": "label={'Utilisateur ou Email'}",
    r"label={'Password'}": "label={'Mot de passe'}",
    r">Forgot Password\?<": ">Mot de passe oublié ?<",
}

directory = '/var/www/pterodactyl/resources/scripts'

import sys

modified_files = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for pattern, replacement in replacements.items():
                new_content = re.sub(pattern, replacement, new_content)
                
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                modified_files += 1

print(f"Translated {modified_files} files.")
