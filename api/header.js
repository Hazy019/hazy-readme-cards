// api/header.js
module.exports = async (req, res) => {
    // Cyber-Noir colors
    const colorGold = "#d4af37";
    const colorBg = "#050400";
    const colorSubText = "#9ca3af";

    // Replicating the "Waving" design requires manual SVG paths
    const wavePath = "M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,80C960,96,1056,128,1152,128C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z";

    // Raw SVG code
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="230" viewBox="0 0 1440 230" fill="none">
        <defs>
            <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        <rect width="1440" height="230" fill="${colorBg}"/>
        <path fill="${colorGold}" fill-opacity="0.1" d="${wavePath}"/>

        <text x="50%" y="110" text-anchor="middle" font-family="Orbitron, monospace" font-size="82" font-weight="900" fill="${colorGold}" filter="url(#goldGlow)">HAZY019</text>
        
        <text x="50%" y="145" text-anchor="middle" font-family="Rajdhani, sans-serif" font-size="14" fill="${colorSubText}">Kyrell Santillan  |  Web Designer · Developer · Cybersecurity</text>

        <polyline points="20,210 20,220 30,220" stroke="${colorGold}" stroke-width="1" fill="none" />
        <polyline points="1420,210 1420,220 1410,220" stroke="${colorGold}" stroke-width="1" fill="none" />
        <animate attributeName="opacity" values="0;1" dur="2s" fill="freeze" />
    </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
};
