// Astrological Data and Interpretations

const ZODIAC_DATA = {
    aries: {
        name: 'Aries',
        symbol: '♈',
        element: 'fire',
        quality: 'cardinal',
        ruler: 'Marte',
        keywords: ['guerrero', 'pionero', 'valiente', 'impulsivo', 'líder'],
        archetype: 'El Guerrero',
        colors: ['#ff4444', '#ff6b6b'],
        visualTraits: 'massive curved metallic RAM HORNS protruding from battle helmet with intricate war engravings, blazing crimson and orange FIRE erupting violently from entire body creating explosive aura, battle-scarred crimson armor with razor-sharp angular edges and Mars war symbols etched in glowing red, aggressive forward-charging warrior stance with weapon raised, eyes burning with inner flame, molten lava cracks in armor, sparks and embers flying, war-torn battlefield with flames in background, smoke and ash particles, intense dramatic rim lighting, powerful intimidating presence radiating conquest energy'
    },
    tauro: {
        name: 'Tauro',
        symbol: '♉',
        element: 'earth',
        quality: 'fixed',
        ruler: 'Venus',
        keywords: ['terrenal', 'sensual', 'fuerte', 'estable', 'leal'],
        archetype: 'El Constructor',
        colors: ['#22c55e', '#16a34a'],
        visualTraits: 'powerful curved BULL HORNS made of polished obsidian and jade protruding from head, emerald green living armor constructed from intertwined vines moss and ancient stone with blooming roses and peonies, chunks of earth and crystalline rocks levitating in orbital rings around muscular body, bare feet rooted into fertile ground with plants growing from footsteps, Venus symbol glowing softly on chest in rose gold, nature goddess aesthetic with flower crown, grounded immovable stance radiating stability, lush garden paradise background, soft golden hour lighting, sensual earthy textures, connection to material world visible'
    },
    geminis: {
        name: 'Géminis',
        symbol: '♊',
        element: 'air',
        quality: 'mutable',
        ruler: 'Mercurio',
        keywords: ['dual', 'comunicativo', 'ágil', 'curioso', 'versátil'],
        archetype: 'El Mensajero',
        colors: ['#eab308', '#facc15'],
        visualTraits: 'TWIN FORM with body split into two mirror halves or dual shadowy clone beside main figure, massive feathered WINGS like Mercury with individual feathers visible spreading from back, electric yellow and white lightning crackling intensely between both hands, floating holographic communication symbols letters and glyphs orbiting head, golden caduceus staff with twin serpents, motion blur effect showing rapid movement, visible swirling air currents and wind trails, costume split perfectly down middle with contrasting yellow and silver colors, androgynous youthful appearance, curious intelligent expression, cloudy sky background, dynamic action pose mid-flight'
    },
    cancer: {
        name: 'Cáncer',
        symbol: '♋',
        element: 'water',
        quality: 'cardinal',
        ruler: 'Luna',
        keywords: ['protector', 'emocional', 'intuitivo', 'maternal', 'sensible'],
        archetype: 'El Guardián',
        colors: ['#94a3b8', '#cbd5e1'],
        visualTraits: 'thick CRAB SHELL armor plating covering shoulders back and arms with iridescent pearl sheen, soft silver moonlight beams emanating from entire body illuminating surroundings, flowing water and tidal waves swirling protectively around character, multiple lunar crescent symbols glowing on armor, large ornate protective shield with moon phases depicted, gentle tidal wave effects at feet, decorative pearls shells and coral embedded in costume, nurturing maternal yet fierce warrior expression, oceanic background with full moon reflection, bioluminescent glow, emotional depth in eyes, defensive protective stance guarding something precious'
    },
    leo: {
        name: 'Leo',
        symbol: '♌',
        element: 'fire',
        quality: 'fixed',
        ruler: 'Sol',
        keywords: ['real', 'radiante', 'creativo', 'orgulloso', 'generoso'],
        archetype: 'El Rey',
        colors: ['#f59e0b', '#fbbf24'],
        visualTraits: 'magnificent flowing golden LION MANE cascading from head like living flames with individual strands visible, ornate royal crown with sun motifs and diamonds, brilliant blinding sun rays radiating outward from entire body in all directions, polished golden armor engraved with intricate sun patterns and Leo constellation, majestic royal cape flowing dramatically in wind, solar flares and plasma eruptions surrounding figure, fierce lion facial features with fangs visible, commanding regal presence with chin raised, dramatic sunburst background with lens flare, warm golden hour lighting, standing on elevated throne or platform, one hand raised in blessing gesture, absolutely radiating confidence and creative power'
    },
    virgo: {
        name: 'Virgo',
        symbol: '♍',
        element: 'earth',
        quality: 'mutable',
        ruler: 'Mercurio',
        keywords: ['perfeccionista', 'analítico', 'servicial', 'puro', 'detallista'],
        archetype: 'El Sanador',
        colors: ['#84cc16', '#a3e635'],
        visualTraits: 'pristine white and lime green flowing robes with embroidered WHEAT stalks and grain patterns in gold thread, multiple healing crystals quartz and emeralds orbiting body in perfect geometric patterns, glowing sacred geometry mandalas and mathematical symbols floating around, analytical glowing third eye on forehead emitting light, precise clockwork mechanical elements integrated with natural vines, seamless fusion of nature and technology, purification white aura with green accents, small Mercury wings on sandals or boots, virginal maiden aesthetic with modest elegant beauty, hands positioned in healing gesture, clean minimalist background with soft diffused lighting, aura of perfection and purity, holding medicinal herbs'
    },
    libra: {
        name: 'Libra',
        symbol: '♎',
        element: 'air',
        quality: 'cardinal',
        ruler: 'Venus',
        keywords: ['equilibrado', 'diplomático', 'armonioso', 'justo', 'elegante'],
        archetype: 'El Diplomático',
        colors: ['#ec4899', '#f472b6'],
        visualTraits: 'ornate golden SCALES of justice held as weapon or floating beside in perfect balance, completely symmetrical character design mirrored on both sides, pink rose gold and white armor with elegant curves, balanced yin-yang energy swirling around body in perfect harmony, Venus symbols and roses incorporated throughout, elegant flowing silk fabrics and ribbons defying gravity, harmonious gradient from pink to gold to white, diplomatic serene peaceful expression, gentle air currents in perfect equilibrium, soft romantic lighting, standing in balanced pose with equal weight on both feet, beautiful androgynous features, background split between day and night in harmony, radiating fairness and beauty'
    },
    escorpio: {
        name: 'Escorpio',
        symbol: '♏',
        element: 'water',
        quality: 'fixed',
        ruler: 'Plutón',
        keywords: ['intenso', 'transformador', 'misterioso', 'poderoso', 'magnético'],
        archetype: 'El Alquimista',
        colors: ['#7c3aed', '#8b5cf6'],
        visualTraits: 'deadly segmented SCORPION TAIL with venomous stinger emerging from lower back as primary weapon dripping with purple venom, obsidian black and deep purple metallic armor with Pluto symbols glowing ominously, transformation imagery with phoenix rising from ashes in background, mysterious hooded cloak billowing dramatically, intense piercing eyes glowing from within hood, death and rebirth symbols skulls and phoenixes, venomous purple energy crackling around body, occult alchemical symbols floating in air, dark water with ink-like tendrils swirling at feet, intimidating powerful magnetic presence, underground cave or temple setting, dramatic chiaroscuro lighting, secrets and mysteries emanating, poised to strike stance'
    },
    sagitario: {
        name: 'Sagitario',
        symbol: '♐',
        element: 'fire',
        quality: 'mutable',
        ruler: 'Júpiter',
        keywords: ['aventurero', 'filosófico', 'optimista', 'libre', 'visionario'],
        archetype: 'El Explorador',
        colors: ['#3b82f6', '#60a5fa'],
        visualTraits: 'powerful CENTAUR lower body with muscular horse legs and flowing tail, ornate bow drawn with glowing arrow aimed at distant stars, adventurer leather gear with travel pouches and maps, Jupiter symbols and lightning bolts, ancient philosophical scrolls floating around, blue and purple cosmic fire trailing from arrow, expansive infinite cosmic background with galaxies visible, archer pose with perfect form targeting the horizon, optimistic adventurous heroic expression with wind-blown hair, travel compass and navigation tools, freedom and movement embodied, dynamic action shot mid-gallop, starlight illuminating figure, sense of infinite possibility and exploration'
    },
    capricornio: {
        name: 'Capricornio',
        symbol: '♑',
        element: 'earth',
        quality: 'cardinal',
        ruler: 'Saturno',
        keywords: ['ambicioso', 'disciplinado', 'responsable', 'maestro', 'resistente'],
        archetype: 'El Maestro',
        colors: ['#475569', '#64748b'],
        visualTraits: 'curved GOAT HORNS protruding from head and lower body transforming into powerful goat legs with hooves, armor constructed from mountain stone granite and marble, Saturn planetary rings incorporated as floating halos or belt, ancient master robes in grey and black with silver trim, actively climbing steep mountain peak with determination, disciplined stern wise expression with weathered features, time symbols hourglasses and clock gears integrated into design, grey black and silver color scheme, architectural columns and structures in background, wise elder energy radiating authority, staff or walking stick, snow-capped mountain setting, harsh dramatic lighting from above, embodiment of perseverance and ambition, reaching toward summit'
    },
    acuario: {
        name: 'Acuario',
        symbol: '♒',
        element: 'air',
        quality: 'fixed',
        ruler: 'Urano',
        keywords: ['innovador', 'rebelde', 'humanitario', 'único', 'visionario'],
        archetype: 'El Visionario',
        colors: ['#06b6d4', '#22d3ee'],
        visualTraits: 'WATER BEARER vessel pouring streams of liquid cosmic energy and starlight, electric cyan and blue lightning bolts crackling across body, futuristic high-tech armor with glowing circuits and holographic interfaces, Uranus planetary symbols, multiple holographic displays and screens floating around showing data, innovative technological gadgets and devices, rebellious punk aesthetic with asymmetrical haircut mixed with sleek sci-fi elements, completely unique asymmetrical armor design breaking all conventions, humanitarian symbols and icons for equality, electric blue and cyan aura pulsing with energy, revolutionary defiant stance, futuristic cityscape or space station background, neon lighting, embodiment of progress and innovation, one fist raised in solidarity'
    },
    piscis: {
        name: 'Piscis',
        symbol: '♓',
        element: 'water',
        quality: 'mutable',
        ruler: 'Neptuno',
        keywords: ['místico', 'compasivo', 'soñador', 'artístico', 'trascendente'],
        archetype: 'El Místico',
        colors: ['#a78bfa', '#c4b5fd'],
        visualTraits: 'TWO FISH swimming in eternal circle around body creating yin-yang pattern with scales shimmering, ethereal translucent purple and lavender robes flowing like underwater currents, ornate Neptune trident weapon with three prongs, thick mystical fog and mist surrounding figure, dream-like watercolor and ink wash effects blending colors, deeply compassionate serene expression with closed or half-closed eyes, underwater aesthetic with bubbles and light rays, glowing spiritual third eye on forehead, artistic graceful flowing dance-like movements, transcendent luminous aura radiating outward, psychic energy waves rippling through space, floating in meditation pose, deep ocean or cosmic void background, bioluminescent creatures, soft diffused ethereal lighting, connection to collective unconscious visible, absolutely otherworldly presence'
    }
};

const STYLE_MODIFIERS = {
    superhero: {
        name: 'Superhéroe Épico',
        prompt: 'EPIC SUPERHERO character in dynamic heroic pose, Marvel Studios and DC Comics cinematic style, powerful commanding stance with dramatic foreshortening, volumetric god rays and rim lighting, flowing cape billowing in wind, muscular heroic proportions, intense determined expression, comic book panel composition, vibrant saturated colors, high contrast lighting, action movie poster aesthetic, lens flare effects, heroic low-angle camera shot, professional concept art quality'
    },
    mythology: {
        name: 'Deidad Mitológica',
        prompt: 'ANCIENT MYTHOLOGICAL DEITY or god/goddess, classical Greek Roman Norse or Egyptian mythology aesthetic, divine radiant aura emanating power, ethereal otherworldly beauty, ornate ceremonial robes and divine armor, holding legendary artifacts or weapons, temple or Mount Olympus background, soft diffused heavenly lighting with golden hour glow, marble and gold materials, timeless immortal presence, renaissance painting style meets modern digital art, majestic and awe-inspiring, worshipful composition'
    },
    fantasy: {
        name: 'Guerrero Fantasy',
        prompt: 'EPIC FANTASY WARRIOR character, high fantasy RPG game concept art style like Dungeons & Dragons or World of Warcraft, intricate magical armor with glowing runes and enchantments, legendary mystical weapons radiating power, fantasy landscape background with castles or magical forests, dramatic atmospheric lighting with magic particle effects, rich saturated fantasy colors, detailed textures on leather metal and cloth, heroic adventurer pose ready for battle, Artstation trending quality, painterly digital art style'
    },
    cosmic: {
        name: 'Ser Cósmico',
        prompt: 'COSMIC CELESTIAL BEING entity made of living starlight and galaxies, body composed of swirling nebulas and cosmic dust, stars twinkling within form, deep space background with distant galaxies, ethereal translucent glowing appearance, aurora borealis color palette, zero gravity floating pose, cosmic energy radiating outward, space opera sci-fi aesthetic, bioluminescent glow effects, infinite universe scale, transcendent god-like presence, James Webb telescope inspired colors, absolutely otherworldly and alien'
    },
    alchemical: {
        name: 'Alquimista Místico',
        prompt: 'MYSTICAL ALCHEMIST sorcerer character, occult and hermetic aesthetic with sacred geometry patterns glowing in air, alchemical symbols and transmutation circles, flowing ceremonial robes with arcane embroidery, holding ancient grimoires or alchemical apparatus, laboratory or sanctum background with candles and mystical artifacts, warm candlelight and magical glow lighting, gold and deep purple color scheme, esoteric mysterious atmosphere, tarot card art style, renaissance alchemy manuscripts inspiration, wisdom and ancient knowledge embodied'
    }
};

const ELEMENT_INFO = {
    fire: {
        name: 'Fuego',
        icon: '🔥',
        traits: 'Pasión, acción, creatividad, impulso'
    },
    earth: {
        name: 'Tierra',
        icon: '🌍',
        traits: 'Estabilidad, materialidad, practicidad, sensualidad'
    },
    air: {
        name: 'Aire',
        icon: '💨',
        traits: 'Intelecto, comunicación, ideas, socialización'
    },
    water: {
        name: 'Agua',
        icon: '💧',
        traits: 'Emoción, intuición, profundidad, sensibilidad'
    }
};

// Generate character interpretation
function generateInterpretation(sun, moon, ascendant) {
    const sunData = ZODIAC_DATA[sun];
    const moonData = ZODIAC_DATA[moon];
    const ascData = ZODIAC_DATA[ascendant];

    const interpretation = `
        Tu esencia solar de ${sunData.name} te otorga el arquetipo de ${sunData.archetype}, 
        manifestando ${sunData.keywords.slice(0, 3).join(', ')} en tu expresión externa. 
        
        Tu Luna en ${moonData.name} revela tu mundo emocional como ${moonData.archetype}, 
        procesando la vida a través de ${moonData.keywords.slice(0, 2).join(' y ')}.
        
        Con ${ascData.name} ascendente, te presentas al mundo como ${ascData.archetype}, 
        proyectando una energía ${ascData.keywords[0]} y ${ascData.keywords[1]}.
        
        Esta combinación cósmica crea un ser único que fusiona ${sunData.element === moonData.element ? 'la poderosa energía de ' + ELEMENT_INFO[sunData.element].name : 'las energías complementarias de ' + ELEMENT_INFO[sunData.element].name + ' y ' + ELEMENT_INFO[moonData.element].name}.
    `.trim().replace(/\s+/g, ' ');

    return interpretation;
}

// Calculate elemental balance
function calculateElementalBalance(sun, moon, ascendant) {
    const elements = {
        fire: 0,
        earth: 0,
        air: 0,
        water: 0
    };

    // Sun counts for 50%, Moon 30%, Ascendant 20%
    elements[ZODIAC_DATA[sun].element] += 50;
    elements[ZODIAC_DATA[moon].element] += 30;
    elements[ZODIAC_DATA[ascendant].element] += 20;

    return elements;
}

// Generate AI image prompt
function generateImagePrompt(sun, moon, ascendant, style, characterName) {
    const sunData = ZODIAC_DATA[sun];
    const moonData = ZODIAC_DATA[moon];
    const ascData = ZODIAC_DATA[ascendant];
    const styleData = STYLE_MODIFIERS[style];

    const characterTitle = characterName || `${sunData.archetype} de ${sunData.name}`;

    // Determinar elemento dominante
    const elements = calculateElementalBalance(sun, moon, ascendant);
    const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0][0];
    const secondaryElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[1][0];

    // Construir prompt ULTRA OPTIMIZADO para modelos modernos
    const prompt = `
${styleData.prompt},

SUBJECT: Single powerful character embodying the fusion of ${sunData.name}, ${moonData.name}, and ${ascData.name} zodiac energies.

PRIMARY FEATURES (${sunData.name} Sun - Core Identity):
${sunData.visualTraits}

SECONDARY FEATURES (${moonData.name} Moon - Emotional Essence):
${moonData.visualTraits}

TERTIARY FEATURES (${ascData.name} Rising - Outer Presence):
${ascData.visualTraits}

FUSION REQUIREMENTS:
- This is ONE unified character seamlessly combining all three zodiac signs
- Primary animal/creature features: ${extractAnimalFeatures(sunData, moonData, ascData)}
- All three sets of characteristics must be visible and harmoniously integrated
- Color palette blending: ${sunData.colors[0]} (primary), ${moonData.colors[0]} (secondary), ${ascData.colors[0]} (accent)
- Elemental manifestation: dominant ${ELEMENT_INFO[dominantElement].name} energy with ${ELEMENT_INFO[secondaryElement].name} undertones

COMPOSITION:
- Full body portrait in dynamic heroic pose
- Dramatic cinematic lighting with strong contrast
- Epic background matching character's combined energy
- Professional concept art quality, 8K resolution
- Sharp focus on character details
- Artstation trending aesthetic

TECHNICAL SPECS:
- Single character only, no duplicates
- No text, letters, or words visible in image
- Highly detailed textures and materials
- Photorealistic rendering with fantasy elements
- Masterpiece quality, best quality
- Perfect anatomy and proportions
- Cinematic color grading

MOOD: ${getCharacterMood(sunData.element, moonData.element, ascData.element)}
ARCHETYPE: ${sunData.archetype} × ${moonData.archetype} × ${ascData.archetype}
    `.trim().replace(/\s+/g, ' ');

    return {
        prompt: prompt,
        characterTitle: characterTitle
    };
}

// Helper: Extraer características animales principales
function extractAnimalFeatures(sunData, moonData, ascData) {
    const features = [];

    // Mapeo de signos a características animales
    const animalMap = {
        'Aries': 'RAM HORNS',
        'Tauro': 'BULL HORNS',
        'Géminis': 'TWIN WINGS',
        'Cáncer': 'CRAB SHELL',
        'Leo': 'LION MANE',
        'Virgo': 'WHEAT CROWN',
        'Libra': 'SCALES',
        'Escorpio': 'SCORPION TAIL',
        'Sagitario': 'CENTAUR BODY',
        'Capricornio': 'GOAT HORNS and LEGS',
        'Acuario': 'WATER VESSEL',
        'Piscis': 'TWIN FISH'
    };

    if (animalMap[sunData.name]) features.push(animalMap[sunData.name]);
    if (animalMap[moonData.name] && moonData.name !== sunData.name) features.push(animalMap[moonData.name]);
    if (animalMap[ascData.name] && ascData.name !== sunData.name && ascData.name !== moonData.name) {
        features.push(animalMap[ascData.name]);
    }

    return features.join(' + ');
}

// Helper: Determinar mood basado en elementos
function getCharacterMood(sunElement, moonElement, ascElement) {
    const moods = {
        fire: 'passionate, intense, dynamic, energetic',
        earth: 'grounded, powerful, stable, majestic',
        air: 'ethereal, intellectual, graceful, swift',
        water: 'mysterious, emotional, flowing, deep'
    };

    // Combinar moods de los elementos presentes
    const uniqueElements = [...new Set([sunElement, moonElement, ascElement])];
    const combinedMood = uniqueElements.map(el => moods[el]).join(', ');

    return `Epic, awe-inspiring, ${combinedMood}, commanding presence`;
}

// Generate loading messages
const LOADING_MESSAGES = [
    'Alineando los planetas...',
    'Consultando las estrellas...',
    'Invocando energías cósmicas...',
    'Fusionando arquetipos astrales...',
    'Tejiendo el destino visual...',
    'Materializando tu esencia cósmica...',
    'Canalizando la energía de los signos...',
    'Transmutando símbolos en forma...',
    'Despertando a los guardianes zodiacales...',
    'Mezclando elementos primordiales...',
    'Convocando a las musas celestiales...',
    'Forjando armadura astral...',
    'Pintando con luz de estrellas...',
    'Destilando esencia planetaria...',
    'Cristalizando visiones cósmicas...',
    'Invocando al artista divino...',
    'Leyendo los registros akáshicos...',
    'Sincronizando con el universo...'
];

function getRandomLoadingMessage() {
    return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
}
