/**
 * 🔵🐝 TI-GUY SWARM ADAPTER - Full AI Orchestration 🐝🔵
 *
 * Coordinates DeepSeek V3 + Flux.1 with intelligent failover:
 * 1. DeepSeek (cloud) → Circuit Breaker → JoualBee (local)
 * 2. Flux.1 (cloud) → Circuit Breaker → Cached/placeholder images
 * 3. Complex tasks → Worker Bee queue (async)
 *
 * Built with:
 * - Fault tolerance (Circuit Breaker pattern)
 * - Graceful degradation (local fallbacks)
 * - Task queueing (async processing)
 * - Swarm health monitoring
 */

import OpenAI from 'openai';
import * as fal from '@fal-ai/serverless-client';
import { colonyClient } from './ColonyClient';
import { circuitBreakers } from './CircuitBreaker';
import { joualBee } from '@/services/bees/JoualBee';
import { logger } from '@/lib/logger';
import { BeeType, SwarmResponse } from './types';

const tiGuyLogger = logger.withContext('TiGuySwarmAdapter');

// System prompt for authentic Quebec-Joual Ti-Guy
const TI_GUY_SYSTEM_PROMPT = `
You are Ti-Guy, Zyeuté's AI assistant for Quebec creators.

Your CORE IDENTITY:
- Speak in authentic JOUAL (Quebec French slang) - not standard French
- Use local references: Montreal, poutine, hockey, St-Jean celebration, Plateau-Mont-Royal
- Be friendly, casual, helpful ("mon ami", "tu sais", "c'est vrai")
- Reference Quebec culture naturally

Your ROLE:
- Help creators make engaging posts in authentic Quebec style
- Suggest captions that resonate with Québécois audience
- Generate Quebec-themed hashtags
- Understand local memes and references
- Be the voice of Zyeuté's Quebec community

Your CAPABILITIES:
- Generate captions (4 tones: fun, chill, hype, drole)
- Suggest hashtags for Quebec audience
- Chat conversationally in Joual
- Help with content ideas

Always stay in character as Ti-Guy. Even when translating, keep the Joual vibe.
`;

interface ImageGenerationRequest {
  prompt: string;
  style?: 'photorealistic' | 'cinematic' | 'luxury' | 'glassmorphism' | 'vibrant' | 'artistic' | 'neon';
  aspectRatio?: '1:1' | '4:3' | '16:9' | '9:16' | '3:2';
}

interface ImageGenerationResult {
  url: string | null;
  error?: string;
  isPlaceholder: boolean;
  generatedAt: Date;
}

export class TiGuySwarmAdapter {
  private deepseek: OpenAI;
  private requestCount = 0;
  private lastRequestTime = 0;

  constructor() {
    // Initialize DeepSeek V3 client (OpenAI compatible)
    this.deepseek = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
      dangerouslyAllowBrowser: true // For client-side demo; use proxy in prod
    });

    // Configure Fal.ai for Flux.1
    if (import.meta.env.VITE_FAL_API_KEY) {
      fal.config({
        credentials: import.meta.env.VITE_FAL_API_KEY
      });
    }
  }

  /**
   * Analyzes user input to detect intent and route to appropriate service
   */
  private analyzeIntent(prompt: string): BeeType | null {
    const p = prompt.toLowerCase();

    // Explicit triggers for specialized bees
    if (/revenue|stripe|facture|paiement|money/i.test(p)) return 'finance';
    if (/security|hack|ban|admin|report/i.test(p)) return 'security';
    if (/joual|traduction|expression|accent/i.test(p)) return 'joual';
    if (/poutine|recette|restaurant|manger/i.test(p)) return 'poutine';
    if (/hockey|canadiens|score|game/i.test(p)) return 'hockey';

    return null; // No special bee needed, Ti-Guy handles it
  }

  /**
   * Main entry point: Handle user messages with full swarm coordination
   */
  async handleMessage(
    prompt: string,
    history: { role: 'user' | 'assistant'; content: string }[] = [],
    onProgress?: (msg: string) => void
  ): Promise<SwarmResponse> {
    const targetBee = this.analyzeIntent(prompt);

    // 1. SWARM MODE: Route to specialized bee if needed
    if (targetBee) {
      if (onProgress) onProgress(`🐝 Ti-Guy appelle l'agent ${targetBee.toUpperCase()}...`);

      const taskId = await colonyClient.submitTask({
        description: prompt,
        beeType: targetBee,
        priority: 'high'
      });

      if (taskId) {
        return new Promise((resolve) => {
          const subscription = colonyClient.subscribeToTask(taskId, (status, result) => {
            if (status === 'running' && onProgress) {
              onProgress(`🐝 L'agent ${targetBee} travaille là-dessus...`);
            }

            if (status === 'done') {
              subscription.unsubscribe();
              resolve({
                bee: {
                  id: `bee-${targetBee}-${Date.now()}`,
                  type: targetBee,
                  name: `${targetBee.charAt(0).toUpperCase() + targetBee.slice(1)}Bee`,
                  status: 'idle',
                  specialty: targetBee
                },
                content: result || 'Tâche complétée.',
                confidence: 1.0
              });
            }
          });
        });
      }
    }

    // 2. STANDARD MODE: Ti-Guy with Circuit Breaker protection
    return this.callTiGuyWithFallback(prompt, history, onProgress);
  }

  /**
   * Call DeepSeek with circuit breaker + JoualBee fallback
   */
  private async callTiGuyWithFallback(
    prompt: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    onProgress?: (msg: string) => void
  ): Promise<SwarmResponse> {
    try {
      // Try DeepSeek with circuit breaker protection
      const response = await circuitBreakers.deepseek.execute(
        () => this.callDeepSeek(prompt, history),
        // Fallback: Use local JoualBee
        async () => {
          if (onProgress) onProgress('🔴 Circuit ouvert, j\'utilise le mode local...');
          return joualBee.generateResponse(prompt).content;
        }
      );

      return {
        bee: {
          id: 'ti-guy-main',
          type: 'joual',
          name: 'Ti-Guy',
          status: 'working',
          specialty: 'General Assistant'
        },
        content: response,
        confidence: circuitBreakers.deepseek.isHealthy() ? 0.95 : 0.75
      };
    } catch (error) {
      tiGuyLogger.error(`Ti-Guy error: ${error}`);

      // Ultimate fallback: JoualBee
      const fallbackResponse = joualBee.generateResponse(prompt);
      return {
        bee: {
          id: 'joual-bee-fallback',
          type: 'joual',
          name: 'JoualBee (Mode Local)',
          status: 'fallback',
          specialty: 'Local Patterns'
        },
        content: fallbackResponse.content,
        confidence: 0.5
      };
    }
  }

  /**
   * Call DeepSeek V3 API
   */
  private async callDeepSeek(
    prompt: string,
    history: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<string> {
    const messages = [
      { role: 'system', content: TI_GUY_SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: prompt }
    ] as any;

    const completion = await this.deepseek.chat.completions.create({
      messages: messages,
      model: 'deepseek-chat',
      temperature: 1.3, // Higher for creative Joual flair
      max_tokens: 1024
    });

    return completion.choices[0].message.content || "Désolé, j'ai perdu le fil.";
  }

  /**
   * Generate captions with DeepSeek
   */
  async generateCaption(
    topic: string,
    tone: 'fun' | 'chill' | 'hype' | 'drole' = 'fun'
  ): Promise<string> {
    const prompt = `Génère une caption courte (max 150 chars) en Joual québécois pour un post Zyeuté.
Topic: ${topic}
Tone: ${tone}

Caption only, no explanation.`;

    try {
      return await circuitBreakers.deepseek.execute(
        () => this.callDeepSeek(prompt, []),
        () => joualBee.generateCaption(topic, tone)
      );
    } catch {
      return joualBee.generateCaption(topic, tone);
    }
  }

  /**
   * Generate Quebec hashtags
   */
  async generateHashtags(topic: string, count: number = 5): Promise<string[]> {
    try {
      const prompt = `Generate ${count} hashtags in Quebec French for topic: "${topic}"
Format: #tag1 #tag2 etc
Only hashtags, no explanation.`;

      const response = await circuitBreakers.deepseek.execute(
        () => this.callDeepSeek(prompt, []),
        () => joualBee.generateHashtags(topic, count).join(' ')
      );

      return response
        .split(/\s+/)
        .filter((tag) => tag.startsWith('#'))
        .slice(0, count);
    } catch {
      return joualBee.generateHashtags(topic, count);
    }
  }

  /**
   * Generate images with Flux.1 and circuit breaker protection
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const prompt = this.buildFluxPrompt(request.prompt, request.style);

    try {
      const result = await circuitBreakers.flux.execute(
        () => this.callFlux(prompt, request.aspectRatio),
        () => this.getPlaceholderImage(request.prompt)
      );

      return result;
    } catch (error) {
      tiGuyLogger.error(`Image generation failed: ${error}`);
      return this.getPlaceholderImage(request.prompt);
    }
  }

  /**
   * Call Flux.1 via Fal.ai
   */
  private async callFlux(
    prompt: string,
    aspectRatio: string = '1:1'
  ): Promise<ImageGenerationResult> {
    if (!import.meta.env.VITE_FAL_API_KEY) {
      return this.getPlaceholderImage(prompt);
    }

    try {
      const result = await fal.subscribe('fal-ai/flux-pro', {
        input: {
          prompt: prompt,
          image_size: this.aspectRatioToSize(aspectRatio),
          num_inference_steps: 30,
          guidance_scale: 3.5
        }
      });

      return {
        url: result.data?.images?.[0]?.url || null,
        isPlaceholder: false,
        generatedAt: new Date()
      };
    } catch (error) {
      tiGuyLogger.error(`Flux.1 error: ${error}`);
      throw error;
    }
  }

  /**
   * Build optimized prompt for Flux.1 with luxury aesthetic
   */
  private buildFluxPrompt(
    basePrompt: string,
    style: string = 'photorealistic'
  ): string {
    const styleGuides: Record<string, string> = {
      photorealistic: 'photorealistic, 8k, professional photography, sharp focus',
      cinematic: 'cinematic lighting, 4k, movie still, dramatic shadows',
      luxury: 'luxury, gold accents, premium materials, elegant composition',
      glassmorphism: 'glassmorphism design, frosted glass, modern, sleek',
      vibrant: 'vibrant colors, saturated, dynamic, energetic',
      artistic: 'artistic style, oil painting effect, expressive brushstrokes',
      neon: 'neon lights, cyberpunk aesthetic, glowing edges, dark background'
    };

    const styleTag = styleGuides[style] || styleGuides.photorealistic;
    return `${basePrompt}, ${styleTag}, high quality, masterpiece`;
  }

  /**
   * Convert aspect ratio to Flux image size
   */
  private aspectRatioToSize(ratio: string): string {
    const sizes: Record<string, string> = {
      '1:1': 'square_hd',
      '4:3': 'landscape_4_3',
      '16:9': 'landscape_16_9',
      '9:16': 'portrait_16_9',
      '3:2': 'landscape_3_2'
    };
    return sizes[ratio] || 'square_hd';
  }

  /**
   * Placeholder image (when API unavailable)
   */
  private getPlaceholderImage(prompt: string): ImageGenerationResult {
    // Generate a placeholder via placeholder service or return null
    return {
      url: null,
      error: 'Image generation unavailable, circuit breaker active',
      isPlaceholder: true,
      generatedAt: new Date()
    };
  }

  /**
   * Get swarm health status
   */
  getSwarmHealth() {
    return {
      deepseek: {
        state: circuitBreakers.deepseek.getState(),
        healthy: circuitBreakers.deepseek.isHealthy(),
        metrics: circuitBreakers.deepseek.getMetrics()
      },
      flux: {
        state: circuitBreakers.flux.getState(),
        healthy: circuitBreakers.flux.isHealthy(),
        metrics: circuitBreakers.flux.getMetrics()
      },
      colony: {
        state: circuitBreakers.colony.getState(),
        healthy: circuitBreakers.colony.isHealthy(),
        metrics: circuitBreakers.colony.getMetrics()
      }
    };
  }
}

export const tiGuySwarm = new TiGuySwarmAdapter();
