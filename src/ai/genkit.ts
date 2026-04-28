import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

let aiInstance: any = null;

export function getAI() {
    if (!aiInstance) {
        const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("ERROR_CONFIG: Falta GOOGLE_GENAI_API_KEY en las variables de entorno.");
        }

        console.log("[Antigravity AI] Activating Google AI (Studio) Backend...");

        aiInstance = genkit({
            plugins: [googleAI({ apiKey })],
            model: 'googleai/gemini-2.5-flash' as any,
        });

        console.log("[Antigravity AI] Engine Ready. Model: gemini-2.5-flash");
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
