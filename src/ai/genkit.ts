import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';

// ============================================
// ANTIGRAVITY AI ENGINE v3.0 (Vertex AI Edition)
// ============================================
/**
 * ENGINE v3.0 - Optimizado para producción con Vertex AI.
 * Resuelve problemas de cuota (429) usando Enterprise Grade AI.
 */
let aiInstance: any = null;

/**
 * MOTOR DE IA - INICIALIZACIÓN HÍBRIDA
 * Prioriza Vertex AI si hay Service Account, de lo contrario usa Gemini Studio API Key.
 */
export function getAI() {
    if (!aiInstance) {
        const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
        const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const saKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'scene-me';
        const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

        const plugins: any[] = [];

        // 1. Configuración de Vertex AI (Enterprise)
        // Usamos las credenciales explícitas del Service Account para garantizar acceso en Vercel.
        if (saEmail && saKey) {
            console.log("[Antigravity AI] Activating Vertex AI Backend (Explicit Auth)...");
            
            plugins.push(vertexAI({
                projectId,
                location,
                googleAuth: {
                    credentials: {
                        client_email: saEmail,
                        private_key: saKey.replace(/\\n/g, '\n'),
                    }
                }
            }));
        } 
        
        // 2. Configuración de Google AI (Gemini Studio)
        if (apiKey) {
            console.log("[Antigravity AI] Activating Google AI (Studio) Backend...");
            plugins.push(googleAI({ apiKey }));
        }

        if (plugins.length === 0) {
             throw new Error("ERROR_CONFIG: AI not configured. Missing Service Account or API Key.");
        }

        // Definimos el modelo primario según disponibilidad
        // Si hay Vertex, usamos su modelo flash para aprovechar cuotas generosas.
        const defaultModel = (saEmail && saKey) 
            ? 'vertexai/gemini-1.5-flash' 
            : 'googleai/gemini-2.0-flash'; // Fallback a 2.0 en studio si está disponible

        aiInstance = genkit({
            plugins,
            model: defaultModel as any, 
        });

        console.log(`[Antigravity AI] Engine Ready. Default Model: ${defaultModel}`);
    }
    return aiInstance;
}

/**
 * EXPORT 'ai' COMPATIBILITY LAYER
 * Flujos antiguos consumen 'ai' directamente. Este proxy asegura que getAI() se llame al usarlo.
 */
export const ai = new Proxy({} as any, {
    get(target, prop) {
        const instance = getAI();
        const value = instance[prop];
        return typeof value === 'function' ? value.bind(instance) : value;
    }
}); 


console.log("[Antigravity AI] Engine Init: Genkit v2.1 (Flash Mode Enabled)");

// ============================================
// RETRY UTILITY WITH EXPONENTIAL BACKOFF
// ============================================
// Handles rate limiting and transient errors gracefully

interface RetryOptions {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
}

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 10000 } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Check if it's a retryable error
            const errorMessage = (error as Error).message?.toLowerCase() || '';
            const isRetryable =
                errorMessage.includes('rate limit') ||
                errorMessage.includes('quota') ||
                errorMessage.includes('timeout') ||
                errorMessage.includes('503') ||
                errorMessage.includes('429') ||
                errorMessage.includes('overloaded');

            if (!isRetryable || attempt === maxRetries) {
                throw error;
            }

            // Calculate delay with exponential backoff + jitter
            const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
            const jitter = Math.random() * 500;
            const delay = Math.min(exponentialDelay + jitter, maxDelayMs);

            console.warn(`[Antigravity AI] Retry ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

// ============================================
// SAFE GENERATE WRAPPER
// ============================================
// Combines retry logic with fallback handling

export async function safeGenerate<T>(
    generateFn: () => Promise<{ output: T | null }>,
    fallback: T,
    context?: string
): Promise<T> {
    try {
        const result = await withRetry(async () => {
            const { output } = await generateFn();
            if (!output) {
                throw new Error('Empty output from model');
            }
            return { output };
        });
        return result.output;
    } catch (error) {
        console.error(`[Antigravity AI] ${context || 'Generation'} failed:`, error);
        if (typeof fallback === 'object' && fallback !== null && 'archetype' in fallback && 'analysis' in fallback) {
            (fallback as any).archetype = "ERROR DE CONEXIÓN AI";
            (fallback as any).analysis = `El sistema ha activado el perfil de emergencia porque falló la conexión con la IA. Mensaje interno: ${(error as Error).message}`;
            (fallback as any).essence = `Fallo en: ${context}`;
        }
        return fallback;
    }
}
