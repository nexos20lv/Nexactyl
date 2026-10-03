import os

filepath = '/var/www/pterodactyl/resources/scripts/routers/routes/server.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_statement = "const ModManagerContainer = lazy(() => import('@server/mods/ModManagerContainer'));\n"
if "ModManagerContainer" not in content:
    content = content.replace("const ServerConsoleContainer =", import_statement + "const ServerConsoleContainer =")

# Add route
route_statement = """    route('mods', ModManagerContainer, {
        permission: 'file.*',
        name: 'Mods & Plugins',
        icon: Icon.PuzzleIcon,
        category: 'data',
    }),
"""
if "'mods'" not in content:
    content = content.replace("route('files/*',", route_statement + "    route('files/*',")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("server.ts patched!")
