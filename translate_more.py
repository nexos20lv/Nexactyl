import os
import re

replacements = {
    # Schedules
    r">New Task<": ">Nouvelle tâche<",
    r">Run Now<": ">Exécuter maintenant<",
    r">Edit Schedule<": ">Modifier la tâche planifiée<",
    r">Tasks<": ">Tâches<",
    r">No tasks exist for this schedule\. Create one to get started\.<": ">Aucune tâche n'existe pour cette planification. Créez-en une pour commencer.<",
    r">Action<": ">Action<",
    r">Time Offset<": ">Décalage temporel<",
    r">Payload<": ">Charge utile (Payload)<",
    r">Send command<": ">Envoyer une commande<",
    r">Send power action<": ">Envoyer une action d'alimentation<",
    r">Create backup<": ">Créer une sauvegarde<",
    r"label={'Time Offset \(in seconds\)'}": "label={'Décalage temporel (en secondes)'}",

    # Settings
    r">Debug Information<": ">Informations de débogage<",
    r">Node<": ">Nœud<",
    r">Server ID<": ">ID du Serveur<",

    # Startup
    r">Variables<": ">Variables<",
    r">No variables exist for this server\.<": ">Aucune variable n'existe pour ce serveur.<",

    # Admin common
    r">Nodes<": ">Nœuds<",
    r">Nests<": ">Nids (Nests)<",
    r">Eggs<": ">Œufs (Eggs)<",
    r">Locations<": ">Emplacements<",
    r">Mounts<": ">Montages<",
    r">Roles<": ">Rôles<",
    r">System<": ">Système<",
    r">Billing<": ">Facturation<",

    # Errors
    r">An error was encountered\.<": ">Une erreur a été rencontrée.<",
    r">An error occurred while<": ">Une erreur s'est produite lors de<",
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

print(f"Translated {modified_files} more files.")
