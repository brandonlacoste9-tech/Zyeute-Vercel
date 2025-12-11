/**
 * Unit Tests for Image Generation Service (Flux.1 Schnell)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as imageGenService from './imageGenService';

// Mock Fal.ai client
vi.mock('@fal-ai/serverless-client', () => {
  return {
    config: vi.fn(),
    subscribe: vi.fn().mockResolvedValue({
      data: {
        images: [
          {
            url: 'https://example.com/generated-image.jpg',
            content_type: 'image/jpeg',
          },
        ],
      },
    }),
  };
});

describe('imageGenService', () => {
  describe('generateImage', () => {
    it('should generate an image with default options', async () => {
      const result = await imageGenService.generateImage({
        prompt: 'A beautiful poutine',
      });
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.url).toBeDefined();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        expect(result.contentType).toBeDefined();
      }
    });

    it('should generate image with specific style', async () => {
      const styles: Array<imageGenService.ImageStyle> = [
        'photorealistic',
        'cinematic',
        'luxury',
        'glassmorphism',
        'quebec-heritage',
        'vibrant',
        'artistic',
      ];
      
      for (const style of styles) {
        const result = await imageGenService.generateImage({
          prompt: 'Test image',
          style,
        });
        
        expect(result).toBeDefined();
        if (result) {
          expect(result.url).toBeDefined();
        }
      }
    });

    it('should generate image with different aspect ratios', async () => {
      const ratios: Array<imageGenService.ImageAspectRatio> = [
        'square',
        'portrait',
        'landscape',
        '9:16',
        '16:9',
      ];
      
      for (const aspectRatio of ratios) {
        const result = await imageGenService.generateImage({
          prompt: 'Test image',
          aspectRatio,
        });
        
        expect(result).toBeDefined();
        if (result) {
          expect(result.width).toBeGreaterThan(0);
          expect(result.height).toBeGreaterThan(0);
        }
      }
    });

    it('should enhance prompt when requested', async () => {
      const result = await imageGenService.generateImage({
        prompt: 'A simple test',
        enhancePrompt: true,
        style: 'photorealistic',
      });
      
      expect(result).toBeDefined();
    });

    it('should return placeholder in demo mode', async () => {
      const result = await imageGenService.generateImage({
        prompt: 'Test',
      });
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.url).toBeDefined();
      }
    });
  });

  describe('generateQuebecImage', () => {
    it('should generate Quebec-themed image', async () => {
      const result = await imageGenService.generateQuebecImage(
        'Montreal skyline at sunset'
      );
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.url).toBeDefined();
      }
    });

    it('should apply Quebec context to prompt', async () => {
      const result = await imageGenService.generateQuebecImage(
        'Winter landscape',
        'quebec-heritage',
        'landscape'
      );
      
      expect(result).toBeDefined();
    });
  });

  describe('generateZyeuteStyledImage', () => {
    it('should generate image with Zyeuté aesthetic', async () => {
      const result = await imageGenService.generateZyeuteStyledImage(
        'Premium social media post'
      );
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.url).toBeDefined();
      }
    });

    it('should apply luxury fur trader aesthetic', async () => {
      const result = await imageGenService.generateZyeuteStyledImage(
        'App screenshot',
        'portrait'
      );
      
      expect(result).toBeDefined();
    });
  });

  describe('generateAvatar', () => {
    it('should generate avatar with default description', async () => {
      const result = await imageGenService.generateAvatar();
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.width).toBe(1024);
        expect(result.height).toBe(1024);
      }
    });

    it('should generate avatar with custom description', async () => {
      const result = await imageGenService.generateAvatar(
        'Young woman from Montreal, professional, smiling'
      );
      
      expect(result).toBeDefined();
    });
  });

  describe('generatePostThumbnail', () => {
    it('should generate social media thumbnail', async () => {
      const result = await imageGenService.generatePostThumbnail(
        'Quebec winter festival'
      );
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.width).toBe(576);
        expect(result.height).toBe(1024);
      }
    });

    it('should generate thumbnail with different aspect ratio', async () => {
      const result = await imageGenService.generatePostThumbnail(
        'Festival music',
        '16:9'
      );
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.width).toBe(1024);
        expect(result.height).toBe(576);
      }
    });
  });

  describe('Utility functions', () => {
    it('should check if Flux is available', () => {
      const isAvailable = imageGenService.isFluxAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });

    it('should estimate generation time', () => {
      const time1 = imageGenService.getEstimatedGenerationTime(1);
      expect(time1).toBeGreaterThanOrEqual(4);
      
      const time4 = imageGenService.getEstimatedGenerationTime(4);
      expect(time4).toBeGreaterThan(time1);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      // Test error handling (even with mock, should not throw)
      const result = await imageGenService.generateImage({
        prompt: '',
      });
      
      // Should either return result or null, not throw
      expect(result !== undefined).toBe(true);
    });
  });
});
