/**
 * 🎨 Image Generation Service - Flux.1 [Schnell] Integration
 *
 * Zyeuté's image generation powered by Flux.1 Schnell via Fal.ai
 *
 * Why Flux.1 Schnell?
 * - Open source (vs DALL-E 3's proprietary model)
 * - Faster generation (4-8 seconds vs 15-30 seconds)
 * - More creative freedom (less censorship)
 * - Cost-effective
 * - Photorealistic quality
 *
 * Provider: Fal.ai (fast, reliable API wrapper)
 * Future: Self-host on Colony OS for full control
 */

import * as fal from '@fal-ai/serverless-client';
import { logger } from '@/lib/logger';

const imageGenLogger = logger.withContext('ImageGenService');

// Configure Fal.ai client
const FAL_API_KEY = import.meta.env.VITE_FAL_API_KEY;
if (FAL_API_KEY) {
  fal.config({
    credentials: FAL_API_KEY,
  });
}

// ==================== TYPES ====================

export type ImageStyle =
  | 'photorealistic'
  | 'cinematic'
  | 'luxury'
  | 'glassmorphism'
  | 'quebec-heritage'
  | 'vibrant'
  | 'artistic';

export type ImageAspectRatio = 'square' | 'portrait' | 'landscape' | '9:16' | '16:9';

export interface ImageGenerationOptions {
  prompt: string;
  style?: ImageStyle;
  aspectRatio?: ImageAspectRatio;
  enhancePrompt?: boolean; // Auto-enhance prompt for better results
  numImages?: number; // 1-4 images
}

export interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  contentType: string;
}

// ==================== STYLE PRESETS ====================

const STYLE_MODIFIERS: Record<ImageStyle, string> = {
  photorealistic:
    'photorealistic, highly detailed, 8k uhd, professional photography, sharp focus, natural lighting',
  cinematic:
    'cinematic lighting, dramatic shadows, film grain, anamorphic lens, color grading, hollywood style',
  luxury:
    'luxury aesthetic, premium materials, leather texture, gold accents, elegant composition, high-end',
  glassmorphism:
    'glassmorphism design, frosted glass effect, translucent layers, soft gradients, modern ui, premium feel',
  'quebec-heritage':
    'Quebec cultural heritage, fleur-de-lys motifs, maple leaf elements, blue and white colors, Canadian luxury',
  vibrant:
    'vibrant colors, high saturation, energetic, bold composition, eye-catching, instagram-worthy',
  artistic:
    'artistic interpretation, creative composition, unique perspective, stylized, expressive',
};

// ==================== ASPECT RATIO DIMENSIONS ====================

const ASPECT_RATIO_DIMENSIONS: Record<ImageAspectRatio, { width: number; height: number }> = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 768, height: 1024 },
  landscape: { width: 1024, height: 768 },
  '9:16': { width: 576, height: 1024 }, // Instagram Stories, TikTok
  '16:9': { width: 1024, height: 576 }, // YouTube, Desktop
};

// ==================== CORE FUNCTIONS ====================

/**
 * Generate an image using Flux.1 Schnell
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<GeneratedImage | null> {
  if (!FAL_API_KEY) {
    imageGenLogger.warn('⚠️ No Fal.ai API Key. Using placeholder image.');
    return {
      url: 'https://placehold.co/1024x1024/1a1a1a/f5c842?text=Zyeute+Demo+Mode',
      width: 1024,
      height: 1024,
      contentType: 'image/png',
    };
  }

  try {
    const {
      prompt,
      style = 'photorealistic',
      aspectRatio = 'square',
      enhancePrompt = true,
      numImages = 1,
    } = options;

    // Enhance prompt with style modifiers
    const enhancedPrompt = enhancePrompt
      ? `${prompt}, ${STYLE_MODIFIERS[style]}`
      : prompt;

    // Get dimensions
    const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio];

    imageGenLogger.info('🎨 Generating image with Flux.1 Schnell...');
    imageGenLogger.info(`Prompt: ${enhancedPrompt.substring(0, 100)}...`);
    imageGenLogger.info(`Dimensions: ${dimensions.width}x${dimensions.height}`);

    // Call Fal.ai Flux.1 Schnell endpoint
    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: enhancedPrompt,
        image_size: {
          width: dimensions.width,
          height: dimensions.height,
        },
        num_inference_steps: 4, // Schnell = 4 steps for speed
        num_images: Math.min(numImages, 4),
        enable_safety_checker: true,
      },
      logs: false,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          imageGenLogger.info(`📊 Progress: ${update.logs?.join(', ')}`);
        }
      },
    });

    // Extract image URL
    const imageData = result.data as any;
    const imageUrl = imageData.images?.[0]?.url;

    if (!imageUrl) {
      imageGenLogger.error('❌ No image URL returned from Fal.ai');
      return null;
    }

    imageGenLogger.info('✅ Image generated successfully!');
    imageGenLogger.info(`URL: ${imageUrl}`);

    return {
      url: imageUrl,
      width: dimensions.width,
      height: dimensions.height,
      contentType: imageData.images[0].content_type || 'image/jpeg',
    };
  } catch (error) {
    imageGenLogger.error('❌ Flux.1 image generation error:', error);
    return null;
  }
}

/**
 * Generate Quebec-themed image
 * Automatically adds Quebec cultural elements to the prompt
 */
export async function generateQuebecImage(
  description: string,
  style: ImageStyle = 'luxury',
  aspectRatio: ImageAspectRatio = 'square'
): Promise<GeneratedImage | null> {
  // Add Quebec context to prompt
  const quebecPrompt = `${description}, Quebec cultural elements, fleur-de-lys ⚜️, Montreal cityscape, premium Quebec aesthetic`;

  return generateImage({
    prompt: quebecPrompt,
    style,
    aspectRatio,
    enhancePrompt: true,
  });
}

/**
 * Generate luxury glassmorphism image (Zyeuté's design aesthetic)
 */
export async function generateZyeuteStyledImage(
  description: string,
  aspectRatio: ImageAspectRatio = 'square'
): Promise<GeneratedImage | null> {
  const zyeutePrompt = `${description}, luxury fur trader aesthetic, leather texture, gold accents ⚜️, glassmorphism design, premium Quebec style, cinematic lighting`;

  return generateImage({
    prompt: zyeutePrompt,
    style: 'luxury',
    aspectRatio,
    enhancePrompt: true,
  });
}

/**
 * Generate profile picture / avatar
 */
export async function generateAvatar(
  description: string = 'Quebec person, friendly, authentic'
): Promise<GeneratedImage | null> {
  const avatarPrompt = `portrait photo of ${description}, professional headshot, natural lighting, high quality, 4k, centered composition`;

  return generateImage({
    prompt: avatarPrompt,
    style: 'photorealistic',
    aspectRatio: 'square',
    enhancePrompt: true,
  });
}

/**
 * Generate post thumbnail (optimized for social media)
 */
export async function generatePostThumbnail(
  description: string,
  aspectRatio: ImageAspectRatio = '9:16'
): Promise<GeneratedImage | null> {
  const thumbnailPrompt = `${description}, social media post, eye-catching, trending, vibrant colors, engaging composition`;

  return generateImage({
    prompt: thumbnailPrompt,
    style: 'vibrant',
    aspectRatio,
    enhancePrompt: true,
  });
}

/**
 * Check if Flux service is available
 */
export function isFluxAvailable(): boolean {
  return !!FAL_API_KEY;
}

/**
 * Get estimated generation time (in seconds)
 */
export function getEstimatedGenerationTime(numImages: number = 1): number {
  // Flux.1 Schnell is fast: ~4-8 seconds per image
  return Math.max(4, numImages * 6);
}

// ==================== EXPORT ====================
export default {
  generateImage,
  generateQuebecImage,
  generateZyeuteStyledImage,
  generateAvatar,
  generatePostThumbnail,
  isFluxAvailable,
  getEstimatedGenerationTime,
};
