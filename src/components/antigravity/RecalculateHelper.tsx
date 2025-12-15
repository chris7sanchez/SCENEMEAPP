
// HELPER: Re-Calculate Elements based on Signs
const recalculateElements = (baseElements: any, sun: string, moon: string, asc: string) => {
    // Element mapping
    const signs: Record<string, string> = {
        'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire', 'Sagitario': 'fire',
        'Taurus': 'earth', 'Tauro': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth', 'Capricornio': 'earth',
        'Gemini': 'air', 'Géminis': 'air', 'Libra': 'air', 'Aquarius': 'air', 'Acuario': 'air',
        'Cancer': 'water', 'Cáncer': 'water', 'Scorpio': 'water', 'Escorpio': 'water', 'Pisces': 'water', 'Piscis': 'water'
    };

    const newElements = { ...baseElements };

    // Boost factor per sign placement
    const boost = (sign: string, amount: number) => {
        const el = signs[sign] || signs[Object.keys(signs).find(k => sign.includes(k)) || 'Aries'];
        if (el && newElements[el] !== undefined) {
            newElements[el] += amount;
        }
    };

    // Weightings: Sun (Strong), Moon (Deep), Asc (Surface)
    boost(sun, 30);
    boost(moon, 20);
    boost(asc, 10);

    return newElements;
};
