/**
 * ENERGETIC ALCHEMIST ENGINE
 * 
 * Core Logic for Energetic Balancing and Perfume Formulation based on Natal Chart & Intention.
 * Does not modify existing files. Designed to be imported as a module.
 */

if (typeof window === 'undefined') {
    // Node.js environment support (if needed for testing)
    global.ACEITES_SIGNOS = require('./exquisit-data').ACEITES_SIGNOS;
    global.PROPIEDADES_ACEITES = require('./exquisit-data').PROPIEDADES_ACEITES;
    global.CORRESPONDENCIAS_ASTROLOGICAS = require('./exquisit-pro').CORRESPONDENCIAS_ASTROLOGICAS; // Assuming we can export or mock this
}

class EnergeticAlchemist {
    constructor() {
        this.version = '1.0.0';
    }

    /**
     * analyzeEnergeticNeeds
     * 
     * Analyzes the user's chart and intention to determine the energetic 'gap' or target state.
     * 
     * @param {Object} chart - { sun: 'Leo', moon: 'Pisces', ascendant: 'Scorpio' }
     * @param {string} intention - User's demanding need (e.g., "Confidence", "Calm", "Focus")
     */
    analyzeEnergeticNeeds(chart, intention) {
        // 1. Analyze Core Elemental Balance
        const chartElements = this._calculateElementalBalance(chart);

        // 2. Identify Target Energy based on Intention
        const targetEnergy = this._mapIntentionToEnergy(intention);

        // 3. Determine Strategy
        // Strategy can be: 'AMPLIFY' (if element is low but needed) or 'BALANCE' (if element is high and causing issues)
        const strategy = this._determineStrategy(chartElements, targetEnergy);

        return {
            chartElements,
            targetEnergy,
            strategy
        };
    }

    /**
     * generateTherapeuticFormula
     * 
     * Creates the perfect perfume formula based on the analysis.
     */
    generateTherapeuticFormula(analysis) {
        const { targetEnergy, strategy } = analysis;

        // 1. Select Core Potentiators (The "Active Principle")
        const activeIngredients = this._selectIngredientsForEnergy(targetEnergy.element, 'High');

        // 2. Select Balancing Agents (The "Harmonizer")
        // If Fire is too high, we might add Earth for grounding, etc.
        const balancingIngredients = this._selectBalancingIngredients(targetEnergy.element);

        // 3. Select Bridge Ingredients (Connecting Body & Mind)
        // Based on Chakras associated with the intention
        const bridgeIngredients = this._selectChakraIngredients(targetEnergy.chakra);

        return {
            name: `Elixir of ${targetEnergy.name}`,
            composition: {
                top: activeIngredients.slice(0, 1), // Immediate impact
                heart: [...activeIngredients.slice(1, 2), ...bridgeIngredients], // Emotional core
                base: balancingIngredients // Lasting effect
            },
            energyProfile: {
                amplifies: targetEnergy.name,
                balances: strategy.balances
            }
        };
    }

    // --- INTERNAL HELPERS ---

    _calculateElementalBalance(chart) {
        // Simplified elemental calculation
        const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
        // Weight: Sun (40%), Moon (30%), Asc (30%)
        const signData = window.ACEITES_SIGNOS || ACEITES_SIGNOS; // Access global data

        if (chart.sun) elements[signData[chart.sun].elemento] += 40;
        if (chart.moon) elements[signData[chart.moon].elemento] += 30;
        if (chart.ascendant) elements[signData[chart.ascendant].elemento] += 30;

        return elements;
    }

    _mapIntentionToEnergy(intention) {
        const intentionMap = {
            'confidence': { name: 'Radiance', element: 'Fuego', chakra: 'Plexo Solar' },
            'action': { name: 'Power', element: 'Fuego', chakra: 'Plexo Solar' },
            'calm': { name: 'Peace', element: 'Agua', chakra: 'Sacro' },
            'intuition': { name: 'Vision', element: 'Agua', chakra: 'Tercer Ojo' },
            'focus': { name: 'Clarity', element: 'Aire', chakra: 'Garganta' },
            'communication': { name: 'Voice', element: 'Aire', chakra: 'Garganta' },
            'stability': { name: 'Grounding', element: 'Tierra', chakra: 'Raíz' },
            'abundance': { name: 'Prosperity', element: 'Tierra', chakra: 'Raíz' }
        };
        // Simple keyword matching or default to Balance
        const key = Object.keys(intentionMap).find(k => intention.toLowerCase().includes(k)) || 'stability';
        return intentionMap[key];
    }

    _determineStrategy(elements, target) {
        const currentLevel = elements[target.element] || 0;
        return {
            mode: currentLevel < 30 ? 'AMPLIFY' : 'HARMONIZE',
            balances: target.element === 'Fuego' ? 'Agua' :
                target.element === 'Agua' ? 'Fuego' :
                    target.element === 'Aire' ? 'Tierra' : 'Aire'
        };
    }

    _selectIngredientsForEnergy(element, intensity) {
        // Filter global MOLECULES or ACEITES based on element
        // This relies on the data structure being available
        const data = window.MOLECULAS ?
            Object.entries(window.MOLECULAS).map(([k, v]) => ({ name: k, ...v })) :
            []; // Fallback if MOLECULAS not directly accessible, though ExquisitPro has it.

        // If using MOLECULAS from Exquisit Pro (which are premium), we map elements manually or via new metadata
        // For standard oils (ACEITES_SIGNOS), we use that.

        // Using ACEITES_SIGNOS for standard:
        const oils = Object.values(window.ACEITES_SIGNOS || ACEITES_SIGNOS)
            .filter(o => o.elemento === element);

        return oils.map(o => o.principal);
    }

    _selectBalancingIngredients(element) {
        const opposites = { 'Fuego': 'Tierra', 'Tierra': 'Fuego', 'Aire': 'Agua', 'Agua': 'Tierra' }; // Simplified alchemy
        const target = opposites[element];
        return this._selectIngredientsForEnergy(target, 'Medium').slice(0, 1);
    }

    _selectChakraIngredients(chakra) {
        const oils = Object.values(window.ACEITES_SIGNOS || ACEITES_SIGNOS)
            .filter(o => o.chakra === chakra);
        return oils.map(o => o.principal).slice(0, 1);
    }
}

// Make it available globally
window.EnergeticAlchemist = new EnergeticAlchemist();
console.log('⚗ ENERGETIC ALCHEMIST ENGINE LOADED');
