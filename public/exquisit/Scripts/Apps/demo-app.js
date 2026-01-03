// Demo App - Muestra prompts mejorados sin generar imágenes

class AlchemisteryDemo {
    constructor() {
        this.currentGeneration = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const form = document.getElementById('astralForm');
        const createAnotherBtn = document.getElementById('createAnotherBtn');
        const copyBtn = document.getElementById('copyBtn');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        createAnotherBtn.addEventListener('click', () => this.resetForm());
        copyBtn.addEventListener('click', () => this.copyPrompt());
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            sun: document.getElementById('sunSign').value,
            moon: document.getElementById('moonSign').value,
            ascendant: document.getElementById('ascendant').value,
            style: document.getElementById('style').value
        };

        if (!formData.sun || !formData.moon || !formData.ascendant) {
            alert('Por favor completa todos los campos astrológicos');
            return;
        }

        this.generatePrompt(formData);
    }

    generatePrompt(data) {
        // Generate image prompt
        const { prompt, characterTitle } = generateImagePrompt(
            data.sun,
            data.moon,
            data.ascendant,
            data.style,
            ''
        );

        // Generate interpretation
        const interpretation = generateInterpretation(
            data.sun,
            data.moon,
            data.ascendant
        );

        // Calculate elemental balance
        const elements = calculateElementalBalance(
            data.sun,
            data.moon,
            data.ascendant
        );

        // Store current generation
        this.currentGeneration = {
            ...data,
            prompt,
            characterTitle,
            interpretation,
            elements
        };

        // Display results
        this.displayResults();
    }

    displayResults() {
        const gen = this.currentGeneration;

        // Update character info
        document.getElementById('characterTitle').textContent = gen.characterTitle;

        // Update astral signature
        document.getElementById('sunDisplay').textContent =
            `☉ ${ZODIAC_DATA[gen.sun].name}`;
        document.getElementById('moonDisplay').textContent =
            `☽ ${ZODIAC_DATA[gen.moon].name}`;
        document.getElementById('ascDisplay').textContent =
            `↑ ${ZODIAC_DATA[gen.ascendant].name}`;

        // Display prompt
        document.getElementById('promptText').textContent = gen.prompt;

        // Update stats
        document.getElementById('promptLength').textContent = gen.prompt.length;

        // Count features (animal features mentioned)
        const features = gen.prompt.match(/HORNS|MANE|TAIL|WINGS|SHELL|SCALES|FISH|CENTAUR|VESSEL|WHEAT/g);
        document.getElementById('featureCount').textContent = features ? features.length : 0;

        // Update interpretation
        document.getElementById('interpretationText').textContent = gen.interpretation;

        // Update elemental balance
        this.displayElementalBalance(gen.elements);

        // Show result section
        document.getElementById('resultSection').classList.remove('hidden');

        // Scroll to results
        document.getElementById('resultSection').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    displayElementalBalance(elements) {
        const container = document.getElementById('elementsGrid');
        container.innerHTML = '';

        Object.entries(elements).forEach(([element, percentage]) => {
            const elementData = ELEMENT_INFO[element];
            const div = document.createElement('div');
            div.className = `element-item ${element}`;
            div.innerHTML = `
                <span class="element-name">
                    <span class="element-icon">${elementData.icon}</span>
                    ${elementData.name}
                </span>
                <span class="element-percentage">${percentage}%</span>
            `;
            container.appendChild(div);
        });
    }

    copyPrompt() {
        if (!this.currentGeneration) return;

        const prompt = this.currentGeneration.prompt;

        // Copy to clipboard
        navigator.clipboard.writeText(prompt).then(() => {
            const btn = document.getElementById('copyBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>✅</span> ¡Copiado!';
            btn.style.background = '#22c55e';

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Error copiando:', err);
            alert('Error al copiar. Por favor, selecciona y copia manualmente el texto.');
        });
    }

    resetForm() {
        document.getElementById('astralForm').reset();
        document.getElementById('resultSection').classList.add('hidden');

        // Scroll to form
        document.querySelector('.generator-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.demoApp = new AlchemisteryDemo();
    console.log('🌟 Alchemistery Demo initialized');
    console.log('✨ Prompts ultra-mejorados listos para copiar');
});
