/**
 * AI Provider Abstraction Layer
 * 
 * This module provides a unified interface for different AI providers
 * allowing easy switching between DeepSeek V3, OpenAI, and other models.
 */

import OpenAI from 'openai';

export type AIProvider = 'deepseek' | 'openai';
export type ImageProvider = 'flux' | 'dalle';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface ChatCompletionResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

/**
 * Get configured AI provider for text generation
 * Defaults to DeepSeek V3 if available, falls back to OpenAI
 */
export function getTextProvider(): AIProvider {
  const deepseekKey = process.env.VITE_DEEPSEEK_API_KEY || import.meta.env?.VITE_DEEPSEEK_API_KEY;
  const openaiKey = process.env.VITE_OPENAI_API_KEY || import.meta.env?.VITE_OPENAI_API_KEY;
  
  if (deepseekKey) return 'deepseek';
  if (openaiKey) return 'openai';
  
  return 'deepseek'; // default
}

/**
 * Get configured AI provider for image generation
 * Defaults to Flux.1 Schnell if available, falls back to DALL-E
 */
export function getImageProvider(): ImageProvider {
  const falKey = process.env.VITE_FAL_API_KEY || import.meta.env?.VITE_FAL_API_KEY;
  const openaiKey = process.env.VITE_OPENAI_API_KEY || import.meta.env?.VITE_OPENAI_API_KEY;
  
  if (falKey) return 'flux';
  if (openaiKey) return 'dalle';
  
  return 'flux'; // default
}

/**
 * Initialize OpenAI-compatible client for a specific provider
 */
export function initializeTextClient(provider: AIProvider): OpenAI | null {
  try {
    if (provider === 'deepseek') {
      const apiKey = process.env.VITE_DEEPSEEK_API_KEY || import.meta.env?.VITE_DEEPSEEK_API_KEY;
      if (!apiKey) return null;
      
      return new OpenAI({
        apiKey,
        baseURL: 'https://api.deepseek.com',
        dangerouslyAllowBrowser: true,
      });
    }
    
    if (provider === 'openai') {
      const apiKey = process.env.VITE_OPENAI_API_KEY || import.meta.env?.VITE_OPENAI_API_KEY;
      if (!apiKey) return null;
      
      return new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to initialize ${provider} client:`, error);
    return null;
  }
}

/**
 * Get model name for a specific provider
 */
export function getModelName(provider: AIProvider, customModel?: string): string {
  if (customModel) return customModel;
  
  const models: Record<AIProvider, string> = {
    deepseek: 'deepseek-chat',
    openai: 'gpt-4o',
  };
  
  return models[provider];
}

/**
 * Universal chat completion function
 * Automatically uses the best available provider
 */
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResponse | null> {
  const provider = getTextProvider();
  const client = initializeTextClient(provider);
  
  if (!client) {
    console.warn('No AI provider available');
    return null;
  }
  
  try {
    const response = await client.chat.completions.create({
      model: getModelName(provider, options.model),
      messages: options.messages,
      max_tokens: options.maxTokens || 500,
      temperature: options.temperature || 0.8,
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    
    return {
      content,
      usage: response.usage,
      model: response.model,
    };
  } catch (error) {
    console.error(`Chat completion error (${provider}):`, error);
    return null;
  }
}

/**
 * Check if a specific provider is available
 */
export function isProviderAvailable(provider: AIProvider): boolean {
  if (provider === 'deepseek') {
    return !!(process.env.VITE_DEEPSEEK_API_KEY || import.meta.env?.VITE_DEEPSEEK_API_KEY);
  }
  if (provider === 'openai') {
    return !!(process.env.VITE_OPENAI_API_KEY || import.meta.env?.VITE_OPENAI_API_KEY);
  }
  return false;
}

/**
 * Get list of available providers
 */
export function getAvailableProviders(): {
  text: AIProvider[];
  image: ImageProvider[];
} {
  const text: AIProvider[] = [];
  const image: ImageProvider[] = [];
  
  if (isProviderAvailable('deepseek')) text.push('deepseek');
  if (isProviderAvailable('openai')) {
    text.push('openai');
    image.push('dalle');
  }
  
  const falKey = process.env.VITE_FAL_API_KEY || import.meta.env?.VITE_FAL_API_KEY;
  if (falKey) image.push('flux');
  
  return { text, image };
}

/**
 * Get provider information
 */
export function getProviderInfo(provider: AIProvider | ImageProvider) {
  const info = {
    deepseek: {
      name: 'DeepSeek V3',
      type: 'text',
      description: 'Open-source, cost-efficient text generation',
      model: 'deepseek-chat',
    },
    openai: {
      name: 'OpenAI GPT-4',
      type: 'text',
      description: 'Advanced language model by OpenAI',
      model: 'gpt-4o',
    },
    flux: {
      name: 'Flux.1 Schnell',
      type: 'image',
      description: 'Fast, open-source image generation',
      provider: 'Fal.ai',
    },
    dalle: {
      name: 'DALL-E 3',
      type: 'image',
      description: 'Advanced image generation by OpenAI',
      provider: 'OpenAI',
    },
  };
  
  return info[provider];
}
