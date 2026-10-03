import os

filepath = '/var/www/pterodactyl/resources/scripts/routers/ServerRouter.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("condition({ billable, activityEnabled })", "condition({ billable, activityEnabled, server })")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("ServerRouter patched!")
