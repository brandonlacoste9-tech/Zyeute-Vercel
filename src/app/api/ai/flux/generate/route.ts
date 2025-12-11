import { NextRequest, NextResponse } from 'next/server';
import * as fal from '@fal-ai/serverless-client';

/**
 * Flux.1 Schnell Image Generation API Endpoint
 * 
 * POST /api/ai/flux/generate
 * 
 * Body:
 * - prompt: string (image description)
 * - style?: 'photorealistic' | 'cinematic' | 'luxury' | 'glassmorphism' | 'quebec-heritage' | 'vibrant' | 'artistic'
 * - aspectRatio?: 'square' | 'portrait' | 'landscape' | '9:16' | '16:9'
 * - enhancePrompt?: boolean (default: true)
 */

type ImageStyle = 'photorealistic' | 'cinematic' | 'luxury' | 'glassmorphism' | 'quebec-heritage' | 'vibrant' | 'artistic';
type ImageAspectRatio = 'square' | 'portrait' | 'landscape' | '9:16' | '16:9';

const STYLE_MODIFIERS: Record<ImageStyle, string> = {
  photorealistic: 'photorealistic, highly detailed, 8k uhd, professional photography, sharp focus, natural lighting',
  cinematic: 'cinematic lighting, dramatic shadows, film grain, anamorphic lens, color grading, hollywood style',
  luxury: 'luxury aesthetic, premium materials, leather texture, gold accents, elegant composition, high-end',
  glassmorphism: 'glassmorphism design, frosted glass effect, translucent layers, soft gradients, modern ui, premium feel',
  'quebec-heritage': 'Quebec cultural heritage, fleur-de-lys motifs, maple leaf elements, blue and white colors, Canadian luxury',
  vibrant: 'vibrant colors, high saturation, energetic, bold composition, eye-catching, instagram-worthy',
  artistic: 'artistic interpretation, creative composition, unique perspective, stylized, expressive',
};

const ASPECT_RATIO_DIMENSIONS: Record<ImageAspectRatio, { width: number; height: number }> = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 768, height: 1024 },
  landscape: { width: 1024, height: 768 },
  '9:16': { width: 576, height: 1024 },
  '16:9': { width: 1024, height: 576 },
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.VITE_FAL_API_KEY;
    
    if (!apiKey) {
      // Return placeholder image in demo mode
      return NextResponse.json({
        success: true,
        fallback: true,
        image: {
          url: 'https://placehold.co/1024x1024/1a1a1a/f5c842?text=Zyeute+Demo+Mode',
          width: 1024,
          height: 1024,
          contentType: 'image/png',
        },
        message: 'Running in demo mode - configure VITE_FAL_API_KEY for real image generation'
      });
    }

    const body = await request.json();
    const { 
      prompt, 
      style = 'photorealistic',
      aspectRatio = 'square',
      enhancePrompt = true
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Invalid request: prompt required' },
        { status: 400 }
      );
    }

    // Configure Fal.ai
    fal.config({
      credentials: apiKey,
    });

    // Enhance prompt with style modifiers
    const enhancedPrompt = enhancePrompt
      ? `${prompt}, ${STYLE_MODIFIERS[style as ImageStyle] || STYLE_MODIFIERS.photorealistic}`
      : prompt;

    // Get dimensions
    const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio as ImageAspectRatio] || ASPECT_RATIO_DIMENSIONS.square;

    console.log('🎨 Generating image with Flux.1 Schnell...');
    console.log(`Prompt: ${enhancedPrompt.substring(0, 100)}...`);
    console.log(`Dimensions: ${dimensions.width}x${dimensions.height}`);

    // Call Fal.ai Flux.1 Schnell
    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: enhancedPrompt,
        image_size: dimensions,
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: false,
    }) as { data: any };

    const imageData = result.data;
    const imageUrl = imageData.images?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL returned from Fal.ai' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: {
        url: imageUrl,
        width: dimensions.width,
        height: dimensions.height,
        contentType: imageData.images[0]?.content_type || 'image/jpeg',
      },
      prompt: enhancedPrompt,
      style,
      aspectRatio,
    });

  } catch (error: any) {
    console.error('Flux.1 API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        message: error.message,
        fallback: true
      },
      { status: 500 }
    );
  }
}
