import os
import re

replacements = {
    r">Startup Command<": ">Commande de démarrage<",
    r">Save Changes<": ">Enregistrer les modifications<",
    r">New Server<": ">Nouveau serveur<",
    r">Confirm module removal<": ">Confirmer la désactivation<",
    r">Confirm New Password<": ">Confirmer le mot de passe<",
    r"label={'Confirm New Password'}": "label={'Confirmer le mot de passe'}",
    r">Activity Log<": ">Journal d'activité<",
    r">Memory Limit<": ">Limite de RAM<",
    r"label={'Memory Limit'}": "label={'Limite de RAM'}",
    r">Disk Limit<": ">Limite de disque<",
    r"label={'Disk Limit'}": "label={'Limite de disque'}",
    r">New Ticket<": ">Nouveau ticket<",
    r">No description<": ">Aucune description<",
    r">New Egg<": ">Nouvel Œuf<",
    r">Suggested Actions<": ">Actions suggérées<",
    r">Standard Mode<": ">Mode Standard<",
    r">Personal Mode<": ">Mode Personnel<",
    r">Your API Key<": ">Votre Clé API<",
    r">Read Only<": ">Lecture seule<",
    r">Application API<": ">API Application<",
    r">Node Information<": ">Informations du Nœud<",
    r">Primary Allocation<": ">Allocation Principale<",
    r"placeholder={'Select a user\.\.\.'}": "placeholder={'Sélectionner un utilisateur...'}",
    r">Docker Image<": ">Image Docker<",
    r"label={'Docker Image'}": "label={'Image Docker'}",
    r">Service Configuration<": ">Configuration du Service<",
    r">Confirm server reinstallation<": ">Confirmer la réinstallation<",
    r">Transfer Server<": ">Transférer le serveur<",
    r">Preset Name<": ">Nom du préréglage<",
    r">Resource Limits<": ">Limites de ressources<",
    r">Backup Limit<": ">Limite de sauvegardes<",
    r"label={'Backup Limit'}": "label={'Limite de sauvegardes'}",
    r">Database Limit<": ">Limite de DB<",
    r"label={'Database Limit'}": "label={'Limite de bases de données'}",
    r">Feature Limits<": ">Limites de fonctionnalités<",
    r">User Accounts<": ">Comptes Utilisateurs<",
    r">Custom Links<": ">Liens Personnalisés<",
    r">Disable Billing Module<": ">Désactiver la facturation<",
    r">Download invoice<": ">Télécharger la facture<",
    r">Billing Orders<": ">Historique des commandes<",
    r">Disable JexpanelAI<": ">Désactiver l'IA<",
    r">Ticket Dashboard<": ">Tableau des tickets<",
    r">In Progress<": ">En cours<",
    r">Message Content<": ">Contenu du message<",
    r">Confirm ticket deletion<": ">Confirmer la suppression du ticket<",
    r"Connections from": "Connexions depuis",
    r">Forcibly Stop Process<": ">Forcer l'arrêt du processus<",
    r">Confirm<": ">Confirmer<",
    r"label={'Description'}": "label={'Description'}",
    r">Description<": ">Description<",
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

print(f"Translated {modified_files} files in final scan.")
