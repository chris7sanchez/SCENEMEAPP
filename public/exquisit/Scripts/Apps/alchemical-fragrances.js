// Alchemical Fragrances - Astrology-based Perfume Generator

const ZODIAC_FRAGRANCES = {
    aries: {
        name: 'Aries',
        symbol: '♈',
        topNotes: ['Pimienta Rosa', 'Bergamota', 'Jengibre'],
        topDesc: 'Explosión inicial ardiente y energética, como el primer rayo de sol. Especias cálidas que despiertan los sentidos.',
        character: 'audaz y dinámico',
        intensity: 'Fuerte',
        family: 'Especiada',
        season: 'Primavera'
    },
    tauro: {
        name: 'Tauro',
        symbol: '♉',
        topNotes: ['Rosa Búlgara', 'Pera', 'Violeta'],
        topDesc: 'Suavidad terrena y sensual, como un jardín al amanecer. Flores opulentas con dulzor natural.',
        character: 'sensual y terreno',
        intensity: 'Media',
        family: 'Floral',
        season: 'Todo'
    },
    geminis: {
        name: 'Géminis',
        symbol: '♊',
        topNotes: ['Limón', 'Menta', 'Lavanda'],
        topDesc: 'Frescura aérea y chispeante, como el viento entre las hojas. Notas que danzan y se transforman.',
        character: 'ligero y versátil',
        intensity: 'Ligera',
        family: 'Cítrica',
        season: 'Verano'
    },
    cancer: {
        name: 'Cáncer',
        symbol: '♋',
        topNotes: ['Agua de Mar', 'Neroli', 'Melón'],
        topDesc: 'Frescura acuática y maternal, como la brisa marina al atardecer. Suavidad reconfortante.',
        character: 'acuático y nostálgico',
        intensity: 'Media',
        family: 'Acuática',
        season: 'Verano'
    },
    leo: {
        name: 'Leo',
        symbol: '♌',
        topNotes: ['Azahar', 'Ámbar', 'Cúrcuma'],
        topDesc: 'Radiancia dorada y majestuosa, como rayos de sol concentrados. Calidez que ilumina.',
        character: 'radiante y real',
        intensity: 'Fuerte',
        family: 'Oriental',
        season: 'Todo'
    },
    virgo: {
        name: 'Virgo',
        symbol: '♍',
        topNotes: ['Hierba Luisa', 'Té Verde', 'Albahaca'],
        topDesc: 'Limpieza herbácea y refinada, como un jardín de hierbas curativas. Frescura terrena.',
        character: 'puro y herbáceo',
        intensity: 'Ligera',
        family: 'Verde',
        season: 'Primavera'
    },
    libra: {
        name: 'Libra',
        symbol: '♎',
        topNotes: ['Peonía', 'Flor de Cerezo', 'Mandarina'],
        topDesc: 'Equilibrio floral perfecto, como una sinfonía de pétalos. Elegancia aérea y refinada.',
        character: 'equilibrado y elegante',
        intensity: 'Media',
        family: 'Floral',
        season: 'Primavera'
    },
    escorpio: {
        name: 'Escorpio',
        symbol: '♏',
        topNotes: ['Incienso', 'Pimienta Negra', 'Café'],
        topDesc: 'Profundidad magnética e intensa, como la noche más oscura. Misterio que atrae.',
        character: 'intenso y magnético',
        intensity: 'Muy Fuerte',
        family: 'Oriental',
        season: 'Otoño'
    },
    sagitario: {
        name: 'Sagitario',
        symbol: '♐',
        topNotes: ['Cedro', 'Cardamomo', 'Naranja Sanguina'],
        topDesc: 'Aventura especiada y cálida, como tierras lejanas. Energía expansiva y optimista.',
        character: 'aventurero y cálido',
        intensity: 'Fuerte',
        family: 'Amaderada',
        season: 'Otoño'
    },
    capricornio: {
        name: 'Capricornio',
        symbol: '♑',
        topNotes: ['Vetiver', 'Pachulí', 'Bergamota'],
        topDesc: 'Solidez terrena y sofisticada, como piedras antiguas. Profundidad estructurada.',
        character: 'sólido y atemporal',
        intensity: 'Media',
        family: 'Amaderada',
        season: 'Invierno'
    },
    acuario: {
        name: 'Acuario',
        symbol: '♒',
        topNotes: ['Ozono', 'Violeta', 'Aldehídos'],
        topDesc: 'Frescura eléctrica y futurista, como el aire ionizado. Originalidad pura.',
        character: 'único y eléctrico',
        intensity: 'Ligera',
        family: 'Aérea',
        season: 'Todo'
    },
    piscis: {
        name: 'Piscis',
        symbol: '♓',
        topNotes: ['Loto', 'Mirra', 'Ninfea'],
        topDesc: 'Misticismo acuático y etéreo, como sueños líquidos. Profundidad onírica.',
        character: 'místico y fluido',
        intensity: 'Media',
        family: 'Acuática',
        season: 'Invierno'
    }
};

class FragranceGenerator {
    generateFragrance(sun, moon, ascendant) {
        const sunData = ZODIAC_FRAGRANCES[sun];
        const moonData = ZODIAC_FRAGRANCES[moon];
        const ascData = ZODIAC_FRAGRANCES[ascendant];

        // Generate unique fragrance name
        const name = this.generateName(sunData, moonData, ascData);

        // Create fragrance profile
        return {
            name: name,
            subtitle: `${sunData.name} × ${moonData.name} × ${ascData.name}`,
            signature: `${sunData.symbol} ${moonData.symbol} ${ascData.symbol}`,

            // Pyramid structure
            topNotes: sunData.topNotes,
            topDesc: sunData.topDesc,

            heartNotes: moonData.topNotes,
            heartDesc: moonData.topDesc,

            baseNotes: ascData.topNotes,
            baseDesc: ascData.topDesc,

            // Character
            character: this.generateCharacter(sunData, moonData, ascData),

            // Stats
            intensity: this.calculateIntensity(sunData, moonData, ascData),
            family: this.determineFamilygroup(sunData, moonData, ascData),
            season: sunData.season
        };
    }

    generateName(sun, moon, asc) {
        const prefix = ['Essence de', 'Élixir de', 'Aura de', 'Esprit de'];
        const middle = [sun.character.split(' ')[0], moon.character.split(' ')[0]];

        return `${prefix[Math.floor(Math.random() * prefix.length)]} ${sun.name}`;
    }

    generateCharacter(sun, moon, asc) {
        return `Una fragancia ${sun.character} que revela un corazón ${moon.character}, 
                dejando una impresión final ${asc.character}. Esta composición única 
                captura la esencia de tu carta astral en una sinfonía olfativa que 
                evoluciona a lo largo del día, reflejando las diferentes facetas de tu personalidad cósmica.`;
    }

    calculateIntensity(sun, moon, asc) {
        const intensities = {
            'Ligera': 1,
            'Media': 2,
            'Fuerte': 3,
            'Muy Fuerte': 4
        };

        const avg = (intensities[sun.intensity] + intensities[moon.intensity] + intensities[asc.intensity]) / 3;

        if (avg <= 1.5) return 'Ligera';
        if (avg <= 2.5) return 'Media';
        if (avg <= 3.5) return 'Fuerte';
        return 'Muy Fuerte';
    }

    determineFamilygroup(sun, moon, asc) {
        // Count family occurrences
        const families = [sun.family, moon.family, asc.family];
        const counts = {};

        families.forEach(f => {
            counts[f] = (counts[f] || 0) + 1;
        });

        // Return most common, or create hybrid
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

        if (sorted[0][1] === 3) return sorted[0][0];
        if (sorted[0][1] === 2) return sorted[0][0];
        return `${sorted[0][0]}-${sorted[1][0]}`;
    }
}

// Initialize
const generator = new FragranceGenerator();

document.getElementById('fragranceForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const sun = document.getElementById('sunSign').value;
    const moon = document.getElementById('moonSign').value;
    const asc = document.getElementById('ascendant').value;

    if (!sun || !moon || !asc) {
        alert('Por favor completa todos los campos');
        return;
    }

    const fragrance = generator.generateFragrance(sun, moon, asc);
    displayFragrance(fragrance);
});

function displayFragrance(fragrance) {
    // Header
    document.getElementById('fragranceName').textContent = fragrance.name;
    document.getElementById('fragranceSubtitle').textContent = fragrance.subtitle;
    document.getElementById('astralSignature').textContent = fragrance.signature;

    // Top notes
    document.getElementById('topNotes').innerHTML =
        fragrance.topNotes.map(n => `<span class="ingredient">${n}</span>`).join('');
    document.getElementById('topDesc').textContent = fragrance.topDesc;

    // Heart notes
    document.getElementById('heartNotes').innerHTML =
        fragrance.heartNotes.map(n => `<span class="ingredient">${n}</span>`).join('');
    document.getElementById('heartDesc').textContent = fragrance.heartDesc;

    // Base notes
    document.getElementById('baseNotes').innerHTML =
        fragrance.baseNotes.map(n => `<span class="ingredient">${n}</span>`).join('');
    document.getElementById('baseDesc').textContent = fragrance.baseDesc;

    // Character
    document.getElementById('characterDesc').textContent = fragrance.character;

    // Stats
    document.getElementById('intensity').textContent = fragrance.intensity;
    document.getElementById('family').textContent = fragrance.family;
    document.getElementById('season').textContent = fragrance.season;

    // Show result
    document.getElementById('result').classList.add('active');
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

console.log('✨ Alchemical Fragrances initialized');
