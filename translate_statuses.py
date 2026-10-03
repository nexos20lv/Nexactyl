import os
import re

replacements = {
    # ServerRow.tsx dynamic status
    r"return 'Online';": "return 'En ligne';",
    r"return 'Running';": "return 'En ligne';",
    r"return 'Starting';": "return 'Démarrage';",
    r"return 'Stopping';": "return 'Arrêt';",
    r"return 'Offline';": "return 'Hors ligne';",
    
    # ServerRow Manage button
    r">Manage<": ">Gérer<",
    r"Manage\n": "Gérer\n",
    
    # ServerDetailsBlock.tsx
    r"capitalize\(status\)": "status === 'running' ? 'En ligne' : status === 'starting' ? 'Démarrage' : status === 'stopping' ? 'Arrêt' : 'Hors ligne'",
    r"title={'Address'}": "title={'Adresse'}",
    
    # Common English words still lingering
    r">Name<": ">Nom<",
    r">Status<": ">Statut<",
    r"label={'Name'}": "label={'Nom'}",
    r"label={'Status'}": "label={'Statut'}",
    r"title={'Uptime'}": "title={'Temps en ligne'}",
    r"title={'CPU Load'}": "title={'Charge CPU'}",
    r"title={'Memory'}": "title={'RAM'}",
    r"title={'Disk'}": "title={'Disque'}",
    r"title={'Network'}": "title={'Réseau'}",
    
    # Pagination
    r">Next<": ">Suivant<",
    r">Previous<": ">Précédent<",
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

print(f"Translated {modified_files} files with statuses.")
