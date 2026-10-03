import os

filepath = '/var/www/pterodactyl/resources/scripts/routers/ServerRouter.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """                            const categoryRoutes = routes.server.filter(
                                route => route.category === category && route.name,
                            );"""

new_code = """                            const categoryRoutes = routes.server.filter(
                                route => route.category === category && route.name && (!route.condition || route.condition({ billable, activityEnabled, server })),
                            );"""

if old_code in content:
    content = content.replace(old_code, new_code)
else:
    print("WARNING: Could not find old_code")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("ServerRouter category condition patched!")
