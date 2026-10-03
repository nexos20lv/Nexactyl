import os
import re

directory = '/var/www/pterodactyl/resources/scripts'

replacements = {
    r'jexpanel\.com': 'nexactyl.com',
    r'Jexpanel\.com': 'Nexactyl.com',
    r'jexpanel': 'nexactyl',
    r'Jexpanel': 'Nexactyl',
    r'JEXPANEL': 'NEXACTYL'
}

modified_files = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            # Apply regex replacements
            for old, new in replacements.items():
                new_content = re.sub(old, new, new_content)
                
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                modified_files += 1

print(f"Renamed Jexpanel in {modified_files} files.")
