import os
import re
import json
from collections import Counter

directory = '/var/www/pterodactyl/resources/scripts/components'
strings = []

# Basic regex for UI strings (starts with capital, has letters/spaces)
regexes = [
    r'>([A-Z][A-Za-z\s]+)[<\n]',
    r'label={\'([A-Z][A-Za-z\s]+)\'}',
    r'title={\'([A-Z][A-Za-z\s]+)\'}',
    r'placeholder={\'([A-Z][A-Za-z\s\.]+)\'}',
    r'description={\'([^\']+)\'}',
    r'button\s+title="([^"]+)"'
]

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
            
            for regex in regexes:
                matches = re.findall(regex, content)
                for m in matches:
                    s = m.strip()
                    # Filter out purely technical strings like "MB", "GB", camelCase
                    if len(s) > 3 and not re.match(r'^[A-Z]+$', s) and " " in s:
                        strings.append(s)

counter = Counter(strings)
print(json.dumps(counter.most_common(50), indent=2))
