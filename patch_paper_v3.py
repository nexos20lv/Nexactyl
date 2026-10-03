import os

filepath = '/var/www/pterodactyl/resources/scripts/components/server/mods/ModManagerContainer.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace paper fetch versions
old_v2_fetch = "await fetch('https://api.papermc.io/v2/projects/paper')"
new_v3_fetch = "await fetch('https://fill.papermc.io/v3/projects/paper', { headers: { 'User-Agent': 'Jexactyl-Panel/1.0' } })"
content = content.replace(old_v2_fetch, new_v3_fetch)

# Replace paper install version
old_install_logic = """                const bRes = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}`);
                const bData = await bRes.json();
                const latest = bData.builds[bData.builds.length - 1];
                url = `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${latest}/downloads/paper-${version}-${latest}.jar`;"""

new_install_logic = """                const bRes = await fetch(`https://fill.papermc.io/v3/projects/paper/versions/${version}/builds`, { headers: { 'User-Agent': 'Jexactyl-Panel/1.0' } });
                const bData = await bRes.json();
                // Extract stable builds if possible, or fallback to the last one
                const stableBuilds = bData.filter((b: any) => b.channel === 'STABLE');
                const buildToUse = stableBuilds.length > 0 ? stableBuilds[stableBuilds.length - 1] : bData[bData.length - 1];
                url = buildToUse.downloads['server:default'].url;"""

content = content.replace(old_install_logic, new_install_logic)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("ModManagerContainer.tsx updated to PaperMC v3!")
