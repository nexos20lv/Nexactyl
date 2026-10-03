import os
import re

replacements = {
    # File Manager
    r">Mass Actions<": ">Actions de masse<",
    r">Create Directory<": ">Créer un dossier<",
    r">Delete Files<": ">Supprimer les fichiers<",
    r">Delete File<": ">Supprimer le fichier<",
    r">Rename File<": ">Renommer le fichier<",
    r">Rename<": ">Renommer<",
    r">File Name<": ">Nom du fichier<",
    r">Edit File<": ">Modifier le fichier<",
    r">Download<": ">Télécharger<",
    
    # Account & Settings
    r">Account API<": ">API du compte<",
    r">Account Security<": ">Sécurité du compte<",
    r">Manage Passkeys<": ">Gérer les Passkeys<",
    r">SSH Keys<": ">Clés SSH<",
    r"label={'Description'}": "label={'Description'}",
    
    # Server Console & Settings
    r">Power Actions<": ">Actions d'alimentation<",
    r">Start<": ">Démarrer<",
    r">Restart<": ">Redémarrer<",
    r">Stop<": ">Arrêter<",
    r">Kill<": ">Tuer<",
    r">Uptime<": ">Temps en ligne<",
    r">Server Details<": ">Détails du serveur<",
    r">Server Name<": ">Nom du serveur<",
    r">Description<": ">Description<",
    r">Reinstall Server<": ">Réinstaller le serveur<",
    r">Reinstall<": ">Réinstaller<",
    r">Your server will be stopped and some files may be deleted or modified during this process, are you sure you wish to continue\?<": ">Votre serveur sera arrêté et certains fichiers pourront être modifiés ou supprimés, voulez-vous continuer ?<",
    
    # Users
    r">New User<": ">Nouvel utilisateur<",
    r">Email Address<": ">Adresse Email<",
    r"label={'Email Address'}": "label={'Adresse Email'}",
    
    # Misc
    r">No servers were found\.<": ">Aucun serveur n'a été trouvé.<",
    r">Search\.\.\.<": ">Rechercher...<",
}

directory = '/var/www/pterodactyl/resources/scripts/components/'

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
                print(f"Translated: {filepath}")

