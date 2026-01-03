require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Servir archivos estáticos

// Inicializar OpenAI (puedes cambiar a otras APIs)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Rate limiting simple (en producción usa redis)
const requestCounts = new Map();
const RATE_LIMIT = 10; // requests por hora
const RATE_WINDOW = 60 * 60 * 1000; // 1 hora

function checkRateLimit(ip) {
    const now = Date.now();
    const userRequests = requestCounts.get(ip) || [];

    // Limpiar requests antiguos
    const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);

    if (recentRequests.length >= RATE_LIMIT) {
        return false;
    }

    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);
    return true;
}

// Endpoint principal de generación
app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt, provider = 'openai' } = req.body;
        const clientIp = req.ip;

        // Validación
        if (!prompt || prompt.length < 10) {
            return res.status(400).json({
                error: 'Prompt inválido o demasiado corto'
            });
        }

        // Rate limiting
        if (!checkRateLimit(clientIp)) {
            return res.status(429).json({
                error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
            });
        }

        console.log(`🎨 Generando imagen para: ${prompt.substring(0, 50)}...`);

        let imageUrl;

        switch (provider) {
            case 'openai':
                imageUrl = await generateWithOpenAI(prompt);
                break;
            case 'stability':
                imageUrl = await generateWithStability(prompt);
                break;
            default:
                return res.status(400).json({
                    error: 'Proveedor no soportado'
                });
        }

        console.log(`✅ Imagen generada exitosamente`);
        res.json({ imageUrl });

    } catch (error) {
        console.error('❌ Error generando imagen:', error);
        res.status(500).json({
            error: 'Error al generar la imagen',
            message: error.message
        });
    }
});

// Función para generar con OpenAI
async function generateWithOpenAI(prompt) {
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancePrompt(prompt),
        n: 1,
        size: "1024x1024",
        quality: process.env.OPENAI_QUALITY || "hd",
        style: process.env.OPENAI_STYLE || "vivid"
    });

    return response.data[0].url;
}

// Función para generar con Stability AI
async function generateWithStability(prompt) {
    const response = await fetch(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`
            },
            body: JSON.stringify({
                text_prompts: [{ text: enhancePrompt(prompt), weight: 1 }],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                samples: 1,
                steps: 30
            })
        }
    );

    if (!response.ok) {
        throw new Error(`Stability AI error: ${response.statusText}`);
    }

    const data = await response.json();
    return `data:image/png;base64,${data.artifacts[0].base64}`;
}

// Mejorar prompt con términos de calidad
function enhancePrompt(prompt) {
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        provider: process.env.AI_PROVIDER || 'openai'
    });
});

// Estadísticas (solo para desarrollo)
app.get('/api/stats', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const stats = {
        totalIPs: requestCounts.size,
        requests: Array.from(requestCounts.entries()).map(([ip, times]) => ({
            ip,
            count: times.length
        }))
    };

    res.json(stats);
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        error: 'Error interno del servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
    🌟 Alchemistery Backend Server
    ================================
    🚀 Server running on: http://localhost:${PORT}
    🎨 AI Provider: ${process.env.AI_PROVIDER || 'openai'}
    📊 Rate limit: ${RATE_LIMIT} requests/hour
    ================================
    `);
});
