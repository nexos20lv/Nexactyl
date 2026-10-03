import os

directory = '/var/www/pterodactyl/resources/scripts'
replacements = {
    'Jexactyl': 'Nexactyl',
    'jexactyl': 'nexactyl',
    'JEXACTYL': 'NEXACTYL'
}

modified_files = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                if old in new_content:
                    # Ignore the github url if it exists, though there's probably none in UI
                    new_content = new_content.replace(old, new)
                
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                modified_files += 1

print(f"Renamed in {modified_files} files.")
