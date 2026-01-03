// Main Application Logic

class AlchemisteryApp {
    constructor() {
        this.gallery = this.loadGallery();
        this.currentGeneration = null;
        this.initializeEventListeners();
        this.renderGallery();
    }

    initializeEventListeners() {
        const form = document.getElementById('astralForm');
        const createAnotherBtn = document.getElementById('createAnotherBtn');
        const downloadBtn = document.getElementById('downloadBtn');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        createAnotherBtn.addEventListener('click', () => this.resetForm());
        downloadBtn.addEventListener('click', () => this.downloadImage());
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            sun: document.getElementById('sunSign').value,
            moon: document.getElementById('moonSign').value,
            ascendant: document.getElementById('ascendant').value,
            characterName: document.getElementById('characterName').value,
            style: document.getElementById('style').value
        };

        if (!formData.sun || !formData.moon || !formData.ascendant) {
            alert('Por favor completa todos los campos astrológicos');
            return;
        }

        await this.generateAvatar(formData);
    }

    async generateAvatar(data) {
        // Show loading state
        this.showLoading();

        try {
            // Generate image prompt
            const { prompt, characterTitle } = generateImagePrompt(
                data.sun,
                data.moon,
                data.ascendant,
                data.style,
                data.characterName
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

            // Simulate AI image generation (in production, this would call an actual AI API)
            const imageUrl = await this.callImageGenerationAPI(prompt);

            // Store current generation
            this.currentGeneration = {
                ...data,
                imageUrl,
                prompt,
                characterTitle,
                interpretation,
                elements,
                timestamp: Date.now()
            };

            // Display results
            this.displayResults();

            // Add to gallery
            this.addToGallery(this.currentGeneration);

        } catch (error) {
            console.error('Error generating avatar:', error);
            alert('Hubo un error al generar tu avatar. Por favor intenta de nuevo.');
            this.hideLoading();
        }
    }

    async callImageGenerationAPI(prompt) {
        // Update loading message
        const loadingSubtext = document.getElementById('loadingSubtext');
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            loadingSubtext.textContent = getRandomLoadingMessage();
            messageIndex++;
        }, 2000);

        try {
            console.log('🎨 Generando imagen con prompt mejorado...');
            console.log('📝 Prompt:', prompt);

            // NUEVO: Usar servidor local para generar imágenes
            // Esto evita problemas de CORS
            const response = await fetch('http://localhost:3000/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            clearInterval(messageInterval);

            console.log('✅ Imagen generada exitosamente');
            return data.imageUrl;

        } catch (error) {
            clearInterval(messageInterval);
            console.error('❌ Error generando imagen:', error);

            // Fallback: usar placeholder con el hash del prompt
            console.log('💡 Usando imagen placeholder mientras configuramos el servidor');
            const seed = this.hashCode(prompt);
            return `https://picsum.photos/seed/${seed}/1024/1024`;
        }
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    showLoading() {
        document.getElementById('astralForm').style.display = 'none';
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('resultSection').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('astralForm').style.display = 'block';
    }

    displayResults() {
        const gen = this.currentGeneration;

        // Update image
        document.getElementById('generatedImage').src = gen.imageUrl;
        document.getElementById('generatedImage').alt = gen.characterTitle;

        // Update character info
        document.getElementById('characterTitle').textContent = gen.characterTitle;

        // Update astral signature
        document.getElementById('sunDisplay').textContent =
            `☉ ${ZODIAC_DATA[gen.sun].name}`;
        document.getElementById('moonDisplay').textContent =
            `☽ ${ZODIAC_DATA[gen.moon].name}`;
        document.getElementById('ascDisplay').textContent =
            `↑ ${ZODIAC_DATA[gen.ascendant].name}`;

        // Update interpretation
        document.getElementById('interpretationText').textContent = gen.interpretation;

        // Update elemental balance
        this.displayElementalBalance(gen.elements);

        // Show result section
        document.getElementById('loadingState').classList.add('hidden');
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

    resetForm() {
        document.getElementById('astralForm').reset();
        document.getElementById('astralForm').style.display = 'block';
        document.getElementById('resultSection').classList.add('hidden');

        // Scroll to form
        document.querySelector('.generator-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    downloadImage() {
        if (!this.currentGeneration) return;

        const link = document.createElement('a');
        link.href = this.currentGeneration.imageUrl;
        link.download = `${this.currentGeneration.characterTitle.replace(/\s+/g, '_')}_astral_avatar.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    addToGallery(generation) {
        this.gallery.unshift(generation);

        // Keep only last 12 generations
        if (this.gallery.length > 12) {
            this.gallery = this.gallery.slice(0, 12);
        }

        this.saveGallery();
        this.renderGallery();
    }

    renderGallery() {
        const container = document.getElementById('gallery');

        if (this.gallery.length === 0) {
            container.innerHTML = `
                <div class="gallery-placeholder">
                    <p>Tus avatares generados aparecerán aquí</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        this.gallery.forEach((gen, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${gen.imageUrl}" alt="${gen.characterTitle}">
                <div class="gallery-item-info">
                    <strong>${gen.characterTitle}</strong><br>
                    ${ZODIAC_DATA[gen.sun].symbol} ${ZODIAC_DATA[gen.moon].symbol} ${ZODIAC_DATA[gen.ascendant].symbol}
                </div>
            `;

            item.addEventListener('click', () => this.viewGalleryItem(index));
            container.appendChild(item);
        });
    }

    viewGalleryItem(index) {
        this.currentGeneration = this.gallery[index];
        this.displayResults();
    }

    saveGallery() {
        try {
            localStorage.setItem('alchemistery_gallery', JSON.stringify(this.gallery));
        } catch (e) {
            console.error('Error saving gallery:', e);
        }
    }

    loadGallery() {
        try {
            const saved = localStorage.getItem('alchemistery_gallery');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading gallery:', e);
            return [];
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AlchemisteryApp();
    console.log('🌟 Alchemistery initialized');
    console.log('💡 To integrate real AI image generation:');
    console.log('   1. Sign up for an AI image API (DALL-E, Midjourney, Stable Diffusion)');
    console.log('   2. Replace the callImageGenerationAPI method with actual API calls');
    console.log('   3. Add your API key to the configuration');
});
