<?php
// PanelAddressOverride - Patcher
$pteroDir = getenv('PTERODACTYL_DIRECTORY') ?: '/var/www/pterodactyl';

// --- Patch DatabaseTransformer ---
$dbFile = $pteroDir . '/app/Transformers/Api/Client/DatabaseTransformer.php';
$content = file_get_contents($dbFile);

if (!str_contains($content, '[PanelAddressOverride]')) {
    copy($dbFile, $dbFile . '.paneladdressoverride.bak');

    $find = "        \$model->loadMissing('host');\n\n        return [\n            'id' => \$this->hashids->encode(\$model->id),\n            'host' => [\n                'address' => \$model->getRelation('host')->host,\n                'port' => \$model->getRelation('host')->port,\n            ],";

    $replace = "        \$model->loadMissing('host');\n\n        // [PanelAddressOverride] Check for address overrides\n        \$dbOverride = \\Illuminate\\Support\\Facades\\DB::table('settings')->where('key', 'paneladdressoverride::db_override')->value('value');\n        \$hostAddress = !empty(\$dbOverride) ? \$dbOverride : \$model->getRelation('host')->host;\n\n        return [\n            'id' => \$this->hashids->encode(\$model->id),\n            'host' => [\n                'address' => \$hostAddress,\n                'port' => \$model->getRelation('host')->port,\n            ],";

    $newContent = str_replace($find, $replace, $content);
    if ($newContent === $content) {
        echo "WARNING: Could not patch DatabaseTransformer.\n";
    } else {
        file_put_contents($dbFile, $newContent);
        echo "DatabaseTransformer patched successfully.\n";
    }
} else {
    echo "DatabaseTransformer already patched, skipping.\n";
}

// --- Patch ServerTransformer ---
$sftpFile = $pteroDir . '/app/Transformers/Api/Client/ServerTransformer.php';
$content = file_get_contents($sftpFile);

if (!str_contains($content, '[PanelAddressOverride]')) {
    copy($sftpFile, $sftpFile . '.paneladdressoverride.bak');

    $find = "            'sftp_details' => [\n                'ip' => \$server->node->fqdn,\n                'port' => \$server->node->daemonSFTP,\n            ],";

    $replace = "            // [PanelAddressOverride] Check for SFTP address override\n            'sftp_details' => [\n                'ip' => (function() { \$v = \\Illuminate\\Support\\Facades\\DB::table('settings')->where('key', 'paneladdressoverride::sftp_override')->value('value'); return !empty(\$v) ? \$v : null; })() ?? \$server->node->fqdn,\n                'port' => \$server->node->daemonSFTP,\n            ],";

    $newContent = str_replace($find, $replace, $content);
    if ($newContent === $content) {
        echo "WARNING: Could not patch ServerTransformer.\n";
    } else {
        file_put_contents($sftpFile, $newContent);
        echo "ServerTransformer patched successfully.\n";
    }
} else {
    echo "ServerTransformer already patched, skipping.\n";
}
