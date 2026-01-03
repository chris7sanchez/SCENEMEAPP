const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint para generar imágenes
app.post('/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;

        console.log('🎨 Recibiendo solicitud de generación...');
        console.log('📝 Prompt:', prompt.substring(0, 200) + '...');

        // Aquí puedes integrar cualquier API de generación de imágenes
        // Por ahora, devolvemos un placeholder

        // Simular delay de generación
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generar hash del prompt para imagen consistente
        const hash = hashCode(prompt);
        const imageUrl = `https://picsum.photos/seed/${hash}/1024/1024`;

        console.log('✅ Imagen generada:', imageUrl);

        res.json({
            success: true,
            imageUrl: imageUrl,
            prompt: prompt.substring(0, 100) + '...'
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Función hash
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Alchemistery Image Server Running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de imágenes corriendo en http://localhost:${PORT}`);
    console.log(`💡 Endpoint: POST http://localhost:${PORT}/generate-image`);
});
