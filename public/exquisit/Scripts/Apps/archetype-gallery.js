// Archetype Gallery - 144 Cosmic Combinations

const ZODIAC_SIGNS = {
    aries: { name: 'Aries', symbol: '♈', element: 'fire', modality: 'cardinal', archetype: 'El Guerrero', color: '#ff4444' },
    tauro: { name: 'Tauro', symbol: '♉', element: 'earth', modality: 'fixed', archetype: 'El Constructor', color: '#22c55e' },
    geminis: { name: 'Géminis', symbol: '♊', element: 'air', modality: 'mutable', archetype: 'El Mensajero', color: '#eab308' },
    cancer: { name: 'Cáncer', symbol: '♋', element: 'water', modality: 'cardinal', archetype: 'El Guardián', color: '#94a3b8' },
    leo: { name: 'Leo', symbol: '♌', element: 'fire', modality: 'fixed', archetype: 'El Rey', color: '#f59e0b' },
    virgo: { name: 'Virgo', symbol: '♍', element: 'earth', modality: 'mutable', archetype: 'El Sanador', color: '#84cc16' },
    libra: { name: 'Libra', symbol: '♎', element: 'air', modality: 'cardinal', archetype: 'El Diplomático', color: '#ec4899' },
    escorpio: { name: 'Escorpio', symbol: '♏', element: 'water', modality: 'fixed', archetype: 'El Alquimista', color: '#7c3aed' },
    sagitario: { name: 'Sagitario', symbol: '♐', element: 'fire', modality: 'mutable', archetype: 'El Explorador', color: '#3b82f6' },
    capricornio: { name: 'Capricornio', symbol: '♑', element: 'earth', modality: 'cardinal', archetype: 'El Maestro', color: '#475569' },
    acuario: { name: 'Acuario', symbol: '♒', element: 'air', modality: 'fixed', archetype: 'El Visionario', color: '#06b6d4' },
    piscis: { name: 'Piscis', symbol: '♓', element: 'water', modality: 'mutable', archetype: 'El Místico', color: '#a78bfa' }
};

const FAMOUS_PEOPLE = {
    'aries-aries': 'Lady Gaga, Robert Downey Jr.',
    'aries-tauro': 'Emma Watson',
    'aries-geminis': 'Mariah Carey',
    'aries-cancer': 'Celine Dion',
    'aries-leo': 'Elton John',
    'aries-virgo': 'Keira Knightley',
    'aries-libra': 'Heath Ledger',
    'aries-escorpio': 'Kristen Stewart',
    'aries-sagitario': 'Reese Witherspoon',
    'aries-capricornio': 'Sarah Jessica Parker',
    'aries-acuario': 'Pharrell Williams',
    'aries-piscis': 'Diana Ross',

    'tauro-aries': 'Penélope Cruz',
    'tauro-tauro': 'David Beckham, Adele',
    'tauro-geminis': 'Megan Fox',
    'tauro-cancer': 'Cher',
    'tauro-leo': 'George Clooney',
    'tauro-virgo': 'Audrey Hepburn',
    'tauro-libra': 'Barbra Streisand',
    'tauro-escorpio': 'Al Pacino',
    'tauro-sagitario': 'Dwayne "The Rock" Johnson',
    'tauro-capricornio': 'Queen Elizabeth II',
    'tauro-acuario': 'Uma Thurman',
    'tauro-piscis': 'Stevie Wonder',

    'geminis-aries': 'Angelina Jolie',
    'geminis-tauro': 'Clint Eastwood',
    'geminis-geminis': 'Kanye West, Marilyn Monroe',
    'geminis-cancer': 'Nicole Kidman',
    'geminis-leo': 'Paul McCartney',
    'geminis-virgo': 'Johnny Depp',
    'geminis-libra': 'Naomi Campbell',
    'geminis-escorpio': 'Tupac Shakur',
    'geminis-sagitario': 'Kendrick Lamar',
    'geminis-capricornio': 'Natalie Portman',
    'geminis-acuario': 'Anderson Cooper',
    'geminis-piscis': 'Liam Neeson',

    'cancer-aries': 'Tom Cruise',
    'cancer-tauro': 'Ariana Grande',
    'cancer-geminis': 'Selena Gomez',
    'cancer-cancer': 'Princess Diana, Robin Williams',
    'cancer-leo': 'Elon Musk',
    'cancer-virgo': 'Meryl Streep',
    'cancer-libra': 'Tom Hanks',
    'cancer-escorpio': 'Frida Kahlo',
    'cancer-sagitario': 'Sylvester Stallone',
    'cancer-capricornio': 'Nelson Mandela',
    'cancer-acuario': 'Nikola Tesla',
    'cancer-piscis': 'Ringo Starr',

    'leo-aries': 'Madonna',
    'leo-tauro': 'Jennifer Lopez',
    'leo-geminis': 'Barack Obama',
    'leo-cancer': 'Meghan Markle',
    'leo-leo': 'Jennifer Lawrence, Daniel Radcliffe',
    'leo-virgo': 'Whitney Houston',
    'leo-libra': 'Robert De Niro',
    'leo-escorpio': 'Mick Jagger',
    'leo-sagitario': 'Coco Chanel',
    'leo-capricornio': 'Arnold Schwarzenegger',
    'leo-acuario': 'Kylie Jenner',
    'leo-piscis': 'Halle Berry',

    'virgo-aries': 'Cameron Diaz',
    'virgo-tauro': 'Beyoncé',
    'virgo-geminis': 'Keanu Reeves',
    'virgo-cancer': 'Mother Teresa',
    'virgo-leo': 'Sean Connery',
    'virgo-virgo': 'Michael Jackson, Freddie Mercury',
    'virgo-libra': 'Sophia Loren',
    'virgo-escorpio': 'Kobe Bryant',
    'virgo-sagitario': 'Salma Hayek',
    'virgo-capricornio': 'Warren Buffett',
    'virgo-acuario': 'Amy Winehouse',
    'virgo-piscis': 'Agatha Christie',

    'libra-aries': 'Eminem',
    'libra-tauro': 'Serena Williams',
    'libra-geminis': 'Will Smith',
    'libra-cancer': 'Kim Kardashian',
    'libra-leo': 'Gwyneth Paltrow',
    'libra-virgo': 'Avril Lavigne',
    'libra-libra': 'Kate Winslet, Bruno Mars',
    'libra-escorpio': 'Snoop Dogg',
    'libra-sagitario': 'John Lennon',
    'libra-capricornio': 'Sting',
    'libra-acuario': 'Gwen Stefani',
    'libra-piscis': 'Usher',

    'escorpio-aries': 'Julia Roberts',
    'escorpio-tauro': 'Bill Gates',
    'escorpio-geminis': 'Leonardo DiCaprio',
    'escorpio-cancer': 'Björk',
    'escorpio-leo': 'Katy Perry',
    'escorpio-virgo': 'Ryan Gosling',
    'escorpio-libra': 'Drake',
    'escorpio-escorpio': 'Pablo Picasso, RuPaul',
    'escorpio-sagitario': 'Jodie Foster',
    'escorpio-capricornio': 'Hillary Clinton',
    'escorpio-acuario': 'Whoopi Goldberg',
    'escorpio-piscis': 'Björk',

    'sagitario-aries': 'Brad Pitt',
    'sagitario-tauro': 'Miley Cyrus',
    'sagitario-geminis': 'Taylor Swift',
    'sagitario-cancer': 'Britney Spears',
    'sagitario-leo': 'Tina Turner',
    'sagitario-virgo': 'Nicki Minaj',
    'sagitario-libra': 'Jay-Z',
    'sagitario-escorpio': 'Scarlett Johansson',
    'sagitario-sagitario': 'Frank Sinatra, Jimi Hendrix',
    'sagitario-capricornio': 'Steven Spielberg',
    'sagitario-acuario': 'Walt Disney',
    'sagitario-piscis': 'Billie Eilish',

    'capricornio-aries': 'Muhammad Ali',
    'capricornio-tauro': 'Elvis Presley',
    'capricornio-geminis': 'Michelle Obama',
    'capricornio-cancer': 'Dolly Parton',
    'capricornio-leo': 'David Bowie',
    'capricornio-virgo': 'Kate Moss',
    'capricornio-libra': 'Denzel Washington',
    'capricornio-escorpio': 'Jared Leto',
    'capricornio-sagitario': 'Jim Carrey',
    'capricornio-capricornio': 'Martin Luther King Jr., Tiger Woods',
    'capricornio-acuario': 'Ricky Martin',
    'capricornio-piscis': 'Orlando Bloom',

    'acuario-aries': 'Oprah Winfrey',
    'acuario-tauro': 'Shakira',
    'acuario-geminis': 'Harry Styles',
    'acuario-cancer': 'Ed Sheeran',
    'acuario-leo': 'Cristiano Ronaldo',
    'acuario-virgo': 'Alicia Keys',
    'acuario-libra': 'Justin Timberlake',
    'acuario-escorpio': 'Bob Marley',
    'acuario-sagitario': 'The Weeknd',
    'acuario-capricornio': 'Ellen DeGeneres',
    'acuario-acuario': 'Michael Jordan, Jennifer Aniston',
    'acuario-piscis': 'Ashton Kutcher',

    'piscis-aries': 'Lady Gaga',
    'piscis-tauro': 'Rihanna',
    'piscis-geminis': 'Justin Bieber',
    'piscis-cancer': 'Kurt Cobain',
    'piscis-leo': 'Steve Jobs',
    'piscis-virgo': 'Bruce Willis',
    'piscis-libra': 'Drew Barrymore',
    'piscis-escorpio': 'Albert Einstein',
    'piscis-sagitario': 'Johnny Cash',
    'piscis-capricornio': 'George Washington',
    'piscis-acuario': 'Daniel Craig',
    'piscis-piscis': 'Kurt Russell, Eva Mendes'
};

// Generate archetype descriptions
function generateArchetypeDescription(sun, moon) {
    const sunData = ZODIAC_SIGNS[sun];
    const moonData = ZODIAC_SIGNS[moon];

    const descriptions = {
        'fire-fire': 'Una explosión de energía pura. Pasión desbordante, acción constante y un espíritu indomable que ilumina todo a su paso.',
        'fire-earth': 'Fuego que construye imperios. La pasión encuentra propósito, la energía se canaliza en logros tangibles y duraderos.',
        'fire-air': 'Llamas que danzan con el viento. Ideas brillantes que se ejecutan con velocidad, comunicación apasionada y visión inspiradora.',
        'fire-water': 'Vapor místico. Intensidad emocional que impulsa la acción, intuición que guía el coraje, pasión que sana.',

        'earth-fire': 'Volcán en erupción. Estabilidad que explota en momentos clave, paciencia que acumula poder para el momento perfecto.',
        'earth-earth': 'Montaña inquebrantable. Solidez absoluta, construcción metódica, logros que perduran generaciones.',
        'earth-air': 'Jardín de ideas. Practicidad que da forma a conceptos abstractos, comunicación con propósito concreto.',
        'earth-water': 'Río que esculpe cañones. Emoción profunda que construye con paciencia, sensibilidad que crea belleza duradera.',

        'air-fire': 'Tormenta eléctrica. Ideas que encienden revoluciones, palabras que inspiran acción, mente brillante con corazón ardiente.',
        'air-earth': 'Arquitecto visionario. Conceptos que se materializan, comunicación que construye estructuras, ideas con fundamento sólido.',
        'air-air': 'Tornado de pensamientos. Mente infinita, comunicación constante, conexiones que abarcan universos enteros.',
        'air-water': 'Niebla mística. Intuición que se articula, emociones que se comprenden, sensibilidad que se comunica.',

        'water-fire': 'Géiser ardiente. Emoción que explota en acción, sensibilidad que impulsa el coraje, intuición que guía la pasión.',
        'water-earth': 'Manantial que nutre. Emociones que construyen, sensibilidad que crea seguridad, intuición práctica.',
        'water-air': 'Nubes que viajan. Sentimientos que se expresan, emociones que se comprenden, intuición que se comunica.',
        'water-water': 'Océano infinito. Profundidad emocional absoluta, empatía sin límites, conexión psíquica con todo.'
    };

    const key = `${sunData.element}-${moonData.element}`;
    return descriptions[key] || 'Una combinación única de energías cósmicas.';
}

function generateKeywords(sun, moon) {
    const sunData = ZODIAC_SIGNS[sun];
    const moonData = ZODIAC_SIGNS[moon];

    const keywords = {
        fire: ['Pasión', 'Acción', 'Coraje', 'Inspiración', 'Liderazgo'],
        earth: ['Estabilidad', 'Práctica', 'Construcción', 'Paciencia', 'Logro'],
        air: ['Comunicación', 'Ideas', 'Conexión', 'Intelecto', 'Visión'],
        water: ['Emoción', 'Intuición', 'Empatía', 'Profundidad', 'Sanación']
    };

    const sunKeywords = keywords[sunData.element];
    const moonKeywords = keywords[moonData.element];

    // Combine and deduplicate
    return [...new Set([...sunKeywords.slice(0, 3), ...moonKeywords.slice(0, 3)])];
}

// Generate all 144 archetypes
function generateArchetypes() {
    const archetypes = [];
    const signs = Object.keys(ZODIAC_SIGNS);

    for (const sun of signs) {
        for (const moon of signs) {
            const sunData = ZODIAC_SIGNS[sun];
            const moonData = ZODIAC_SIGNS[moon];

            archetypes.push({
                sun,
                moon,
                sunData,
                moonData,
                name: `${sunData.archetype} ${moonData.archetype}`,
                description: generateArchetypeDescription(sun, moon),
                keywords: generateKeywords(sun, moon),
                famous: FAMOUS_PEOPLE[`${sun}-${moon}`] || 'Combinación única y rara',
                dominantElement: sunData.element,
                modality: sunData.modality
            });
        }
    }

    return archetypes;
}

// Render archetypes
function renderArchetypes(filter = 'all') {
    const grid = document.getElementById('archetypeGrid');
    const archetypes = generateArchetypes();

    const filtered = filter === 'all'
        ? archetypes
        : archetypes.filter(a => a.dominantElement === filter);

    grid.innerHTML = filtered.map(archetype => `
        <div class="archetype-card" 
             style="--sun-color: ${archetype.sunData.color}; --moon-color: ${archetype.moonData.color}"
             onclick='showArchetype(${JSON.stringify(archetype)})'>
            <div class="card-header">
                <div class="signs">
                    <span title="${archetype.sunData.name}">${archetype.sunData.symbol}</span>
                    <span title="${archetype.moonData.name}">${archetype.moonData.symbol}</span>
                </div>
                <span class="element-badge ${archetype.dominantElement}">
                    ${archetype.dominantElement}
                </span>
            </div>
            <h3 class="archetype-name">${archetype.name}</h3>
            <p class="archetype-desc">${archetype.description}</p>
            <div class="keywords">
                ${archetype.keywords.map(k => `<span class="keyword">${k}</span>`).join('')}
            </div>
            <div class="famous">⭐ ${archetype.famous}</div>
        </div>
    `).join('');
}

// Show archetype details
function showArchetype(archetype) {
    document.getElementById('modalSigns').textContent =
        `${archetype.sunData.symbol} ${archetype.moonData.symbol}`;
    document.getElementById('modalTitle').textContent = archetype.name;
    document.getElementById('modalSubtitle').textContent =
        `${archetype.sunData.name} Sol × ${archetype.moonData.name} Luna`;
    document.getElementById('modalDesc').textContent = archetype.description;
    document.getElementById('modalKeywords').innerHTML =
        archetype.keywords.map(k => `<span class="keyword">${k}</span>`).join('');
    document.getElementById('modalFamous').textContent = archetype.famous;
    document.getElementById('modalElement').textContent =
        archetype.dominantElement.charAt(0).toUpperCase() + archetype.dominantElement.slice(1);
    document.getElementById('modalModality').textContent =
        archetype.modality.charAt(0).toUpperCase() + archetype.modality.slice(1);

    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderArchetypes(btn.dataset.filter);
    });
});

// Generate stars
function generateStars() {
    const container = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.animationDelay = `${Math.random() * 3}s`;
        container.appendChild(star);
    }
}

// Initialize
generateStars();
renderArchetypes();

// Close modal on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Close modal on background click
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
});

console.log('✨ Galería de 144 Arquetipos Cósmicos cargada');
