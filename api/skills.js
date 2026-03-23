// api/skills.js
module.exports = async (req, res) => {
    // Set up skills list based on your stack yaml
    const skills = [
        { name: "Python", logo: "python", color: "#d4af37" },
        { name: "Next.js", logo: "next.js", color: "#d4af37" },
        { name: "React", logo: "react", color: "#d4af37" },
        { name: "Tailwind", logo: "tailwindcss", color: "#d4af37" },
        // ...add others from image grid
    ];

    const generateTile = (skill, index) => {
        const xOffset = 30 + (index % 4) * 160; // 4 columns
        const yOffset = 30 + Math.floor(index / 4) * 160; // multiple rows
        
        return `
            <g transform="translate(${xOffset},${yOffset})">
                <rect width="140" height="140" rx="12" fill="#0d0b00" stroke="#d4af3740" stroke-width="1" />
                
                <text x="70" y="70" text-anchor="middle" font-family="Rajdhani, sans-serif" font-size="20" fill="#d4af37">${skill.logo.toUpperCase()}</text>
                <text x="70" y="95" text-anchor="middle" font-family="Rajdhani, sans-serif" font-size="14" fill="#9ca3af">${skill.name}</text>
                
                <rect width="140" height="140" rx="12" fill="none" stroke="#d4af37" stroke-width="2">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
                </rect>
            </g>
        `;
    };

    const tilesSVG = skills.map((skill, index) => generateTile(skill, index)).join("\n");

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="670" height="500" viewBox="0 0 670 500" fill="none">
        <rect width="670" height="500" rx="16" fill="#050400" />
        ${tilesSVG}
    </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
};
