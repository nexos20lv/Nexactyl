import os
import re

replacements = {
    r"title={'Startup Command'}": "title={'Commande de démarrage'}",
    r"title={'Confirm module removal'}": "title={'Confirmer la suppression'}",
    r"title={'Activity Log'}": "title={'Historique d\\'activité'}",
    r"title={'Node Information'}": "title={'Infos du nœud'}",
    r"title={'Confirm server reinstallation'}": "title={'Confirmer la réinstallation'}",
    r"title={'Transfer Server'}": "title={'Transférer le serveur'}",
    r"title={'Resource Limits'}": "title={'Limites de ressources'}",
    r"title={'Feature Limits'}": "title={'Limites de fonctionnalités'}",
    r"title={'Billing Orders'}": "title={'Commandes'}",
    r"title={'Message Content'}": "title={'Contenu du message'}",
    r"title={'Confirm ticket deletion'}": "title={'Confirmer la suppression'}",
    r"title={'Forcibly Stop Process'}": "title={'Forcer l\\'arrêt du processus'}",
    r"title={'Remove Passkey'}": "title={'Supprimer le passkey'}",
    r"title={'Add Passkey'}": "title={'Ajouter un passkey'}",
    r">Support Tickets<": ">Tickets de Support<",
    r">Reset Password<": ">Réinitialiser le mot de passe<",
    r">Enter a message for this ticket\.<": ">Entrez un message pour ce ticket.<",
    r">Passwords must be at least 8 characters in length\.<": ">Les mots de passe doivent faire au moins 8 caractères.<",
    r"label={'Account Recovery Code'}": "label={'Code de récupération'}",
    r">Reset your Password<": ">Réinitialiser votre mot de passe<",
    r">Import Egg<": ">Importer un Egg<",
    r">Edit Nest<": ">Modifier le nid<",
    r">New Nest<": ">Nouveau nid<",
    r">Author email<": ">Email de l'auteur<",
}

directory = '/var/www/pterodactyl/resources/scripts'

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

print(f"Translated {modified_files} cleanup files.")
