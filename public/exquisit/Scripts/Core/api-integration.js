// Advanced API Integration Module
// Este módulo maneja las llamadas a diferentes proveedores de IA

class ImageGenerationAPI {
    constructor(config) {
        this.config = config || API_CONFIG;
        this.provider = this.config.provider;
    }

    async generate(prompt) {
        switch (this.provider) {
            case 'openai':
                return await this.generateWithOpenAI(prompt);
            case 'stability':
                return await this.generateWithStability(prompt);
            case 'leonardo':
                return await this.generateWithLeonardo(prompt);
            case 'replicate':
                return await this.generateWithReplicate(prompt);
            default:
                return await this.generatePlaceholder(prompt);
        }
    }

    async generateWithOpenAI(prompt) {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKeys.openai}`
            },
            body: JSON.stringify({
                model: this.config.openai.model,
                prompt: this.enhancePrompt(prompt),
                n: 1,
                size: this.config.openai.size,
                quality: this.config.openai.quality,
                style: this.config.openai.style
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].url;
    }

    async generateWithStability(prompt) {
        const response = await fetch(
            `https://api.stability.ai/v1/generation/${this.config.stability.model}/text-to-image`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKeys.stability}`
                },
                body: JSON.stringify({
                    text_prompts: [
                        { text: this.enhancePrompt(prompt), weight: 1 }
                    ],
                    cfg_scale: this.config.stability.cfg_scale,
                    height: this.config.stability.height,
                    width: this.config.stability.width,
                    samples: 1,
                    steps: this.config.stability.steps
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Stability AI error: ${response.statusText}`);
        }

        const data = await response.json();
        return `data:image/png;base64,${data.artifacts[0].base64}`;
    }

    async generateWithLeonardo(prompt) {
        // Paso 1: Iniciar generación
        const generateResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'authorization': `Bearer ${this.config.apiKeys.leonardo}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                prompt: this.enhancePrompt(prompt),
                modelId: this.config.leonardo.modelId,
                width: this.config.leonardo.width,
                height: this.config.leonardo.height,
                num_images: this.config.leonardo.num_images,
                promptMagic: true, // Mejora automática del prompt
                alchemy: true // Mejor calidad
            })
        });

        if (!generateResponse.ok) {
            throw new Error(`Leonardo AI error: ${generateResponse.statusText}`);
        }

        const { sdGenerationJob } = await generateResponse.json();
        const generationId = sdGenerationJob.generationId;

        // Paso 2: Polling para obtener resultado
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s

            const resultResponse = await fetch(
                `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
                {
                    headers: {
                        'accept': 'application/json',
                        'authorization': `Bearer ${this.config.apiKeys.leonardo}`
                    }
                }
            );

            const result = await resultResponse.json();

            if (result.generations_by_pk.status === 'COMPLETE') {
                return result.generations_by_pk.generated_images[0].url;
            }

            attempts++;
        }

        throw new Error('Leonardo AI: Timeout waiting for image generation');
    }

    async generateWithReplicate(prompt) {
        console.log('🎨 Generando con Replicate:', this.config.replicate.model);

        // Paso 1: Crear predicción
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${this.config.apiKeys.replicate}`,
                'Content-Type': 'application/json',
                'Prefer': 'wait'
            },
            body: JSON.stringify({
                version: this.getModelVersion(this.config.replicate.model),
                input: {
                    prompt: this.enhancePrompt(prompt),
                    width: this.config.replicate.width || 1024,
                    height: this.config.replicate.height || 1024,
                    num_outputs: 1,
                    output_format: this.config.replicate.output_format || 'png',
                    output_quality: this.config.replicate.output_quality || 90,
                    disable_safety_checker: true // Para arte fantástico
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Replicate API error: ${response.statusText} - ${error}`);
        }

        let prediction = await response.json();
        console.log('📊 Predicción iniciada:', prediction.id);

        // Paso 2: Polling para resultado
        let attempts = 0;
        const maxAttempts = 60; // 60 segundos máximo

        while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const pollResponse = await fetch(
                `https://api.replicate.com/v1/predictions/${prediction.id}`,
                {
                    headers: {
                        'Authorization': `Token ${this.config.apiKeys.replicate}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            prediction = await pollResponse.json();
            console.log(`⏳ Estado: ${prediction.status} (${attempts + 1}/${maxAttempts})`);
            attempts++;
        }

        if (prediction.status === "failed") {
            throw new Error(`Replicate: ${prediction.error || 'Image generation failed'}`);
        }

        if (attempts >= maxAttempts) {
            throw new Error('Replicate: Timeout - La generación tomó demasiado tiempo');
        }

        console.log('✅ Imagen generada exitosamente');

        // Replicate devuelve un array de URLs
        const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
        return imageUrl;
    }

    getModelVersion(modelName) {
        // Versiones actualizadas de los modelos más populares
        const modelVersions = {
            'black-forest-labs/flux-schnell': 'f2ab8a5569479b4b51c3a3e4e6f5e6e5e5e5e5e5', // Placeholder - se actualiza automáticamente
            'black-forest-labs/flux-pro': 'latest',
            'stability-ai/sdxl': 'latest',
            'lucataco/sdxl-lightning-4step': 'latest'
        };

        // Si no especificamos versión, Replicate usa la última automáticamente
        return modelVersions[modelName] || 'latest';
    }

    async generatePlaceholder(prompt) {
        // Generar imagen placeholder basada en el prompt
        const seed = this.hashCode(prompt);

        // Simular delay de API real
        await new Promise(resolve => setTimeout(resolve, 3000));

        return `https://picsum.photos/seed/${seed}/1024/1024`;
    }

    enhancePrompt(prompt) {
        // Añadir términos de calidad al prompt
        const qualityTerms = [
            'masterpiece',
            'best quality',
            'highly detailed',
            '8k uhd',
            'professional',
            'sharp focus'
        ];

        return `${prompt}, ${qualityTerms.join(', ')}`;
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
}

// Exportar para uso en app.js
if (typeof window !== 'undefined') {
    window.ImageGenerationAPI = ImageGenerationAPI;
}
