import { genkit, z } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';

// ============================================
// ANTIGRAVITY AI ENGINE v2.0
// Powered by Gemini Flash
// ============================================

// Initialize Genkit with the Google AI plugin.
// Using Gemini Flash for:
// - Universal availability and high quota
// - Excellent structured output adherence
// - Fast response times for real-time readings
export const ai = genkit({
    plugins: [googleAI()],
    model: gemini15Flash,
});

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
        return fallback;
    }
}
