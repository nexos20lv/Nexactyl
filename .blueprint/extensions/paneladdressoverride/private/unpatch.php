<?php
// PanelAddressOverride - Unpatcher
$pteroDir = getenv('PTERODACTYL_DIRECTORY') ?: '/var/www/pterodactyl';

// --- Revert DatabaseTransformer ---
$dbFile = $pteroDir . '/app/Transformers/Api/Client/DatabaseTransformer.php';
$dbBackup = $dbFile . '.paneladdressoverride.bak';

if (file_exists($dbBackup)) {
    copy($dbBackup, $dbFile);
    unlink($dbBackup);
    echo "DatabaseTransformer restored from backup.\n";
} else {
    echo "No DatabaseTransformer backup found.\n";
}

// --- Revert ServerTransformer ---
$sftpFile = $pteroDir . '/app/Transformers/Api/Client/ServerTransformer.php';
$sftpBackup = $sftpFile . '.paneladdressoverride.bak';

if (file_exists($sftpBackup)) {
    copy($sftpBackup, $sftpFile);
    unlink($sftpBackup);
    echo "ServerTransformer restored from backup.\n";
} else {
    echo "No ServerTransformer backup found.\n";
}
