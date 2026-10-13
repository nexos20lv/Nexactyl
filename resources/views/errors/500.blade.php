<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>500 - Erreur Interne du Serveur | NXSLab Cloud</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #07060a;
            color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-x: hidden;
            position: relative;
        }
        .glow-bg {
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, rgba(168, 85, 247, 0.05) 45%, transparent 70%);
            pointer-events: none;
            z-index: 0;
        }
        .container {
            position: relative;
            z-index: 1;
            max-width: 520px;
            width: 90%;
            margin: 2rem auto;
            text-align: center;
            background: rgba(13, 11, 22, 0.75);
            border: 1px solid rgba(124, 58, 237, 0.25);
            border-radius: 24px;
            padding: 3rem 2rem;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }
        .badge-logo {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(124, 58, 237, 0.15);
            border: 1px solid rgba(168, 85, 247, 0.35);
            padding: 8px 16px;
            border-radius: 9999px;
            margin-bottom: 1.5rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            font-weight: 600;
            color: #c084fc;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
        .badge-logo svg {
            width: 16px;
            height: 16px;
            fill: #c084fc;
        }
        .error-code {
            font-family: 'JetBrains Mono', monospace;
            font-size: 76px;
            font-weight: 800;
            line-height: 1;
            background: linear-gradient(135deg, #ffffff 20%, #c084fc 60%, #7c3aed 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.75rem;
            letter-spacing: -0.04em;
        }
        .error-title {
            font-size: 22px;
            font-weight: 700;
            color: #f8fafc;
            margin-bottom: 0.75rem;
        }
        .error-desc {
            font-size: 14px;
            line-height: 1.6;
            color: #94a3b8;
            margin-bottom: 2rem;
        }
        .btn-home {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            padding: 12px 28px;
            border-radius: 12px;
            text-decoration: none;
            box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
            transition: all 0.2s ease;
        }
        .btn-home:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(124, 58, 237, 0.6);
            background: linear-gradient(135deg, #6d28d9 0%, #7e22ce 100%);
        }
        .footer-note {
            margin-top: 2rem;
            font-size: 12px;
            color: #64748b;
            font-family: 'JetBrains Mono', monospace;
        }
        .footer-note span {
            color: #a855f7;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="glow-bg"></div>
    <div class="container">
        <div class="badge-logo">
            <svg viewBox="0 0 24 24">
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V8.26l7-3.89v7.62z"/>
            </svg>
            NXSLab Cloud
        </div>
        <div class="error-code">500</div>
        <h1 class="error-title">Erreur Interne du Serveur</h1>
        <p class="error-desc">Le syst&egrave;me a rencontr&eacute; une condition inattendue. Veuillez r&eacute;essayer ou contacter le support.</p>
        <a href="/" class="btn-home">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Retourner au Tableau de Bord
        </a>
        <div class="footer-note">
            <span>NXSLab</span> &bull; Haute Disponibilit&eacute; &bull; Engine v1.12.3
        </div>
    </div>
</body>
</html>