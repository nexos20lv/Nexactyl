import os

filepath = '/var/www/pterodactyl/resources/scripts/routers/routes/server.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_cond = "condition: ({ server }) => server?.dockerImage?.toLowerCase().includes('java') || server?.dockerImage?.toLowerCase().includes('minecraft') || server?.invocation?.toLowerCase().includes('java'),"
new_cond = "condition: ({ server }) => server?.dockerImage?.toLowerCase().includes(':java') || server?.dockerImage?.toLowerCase().includes('minecraft') || server?.invocation?.toLowerCase().includes('.jar'),"

if old_cond in content:
    content = content.replace(old_cond, new_cond)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("server.ts patched robustly!")
