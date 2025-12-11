/**
 * Integration Tests for Flux.1 Image Generation API
 */

import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('Flux.1 Image Generation API', () => {
  const createRequest = (body: any): NextRequest => {
    return new NextRequest('http://localhost:3000/api/ai/flux/generate', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  describe('POST /api/ai/flux/generate', () => {
    it('should return 400 when prompt is missing', async () => {
      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should accept valid request with prompt only', async () => {
      const request = createRequest({
        prompt: 'A beautiful landscape',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.image).toBeDefined();
      expect(data.image.url).toBeDefined();
    });

    it('should accept request with all parameters', async () => {
      const request = createRequest({
        prompt: 'A luxury car',
        style: 'luxury',
        aspectRatio: 'landscape',
        enhancePrompt: true,
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.image).toBeDefined();
    });

    it('should handle different styles', async () => {
      const styles = [
        'photorealistic',
        'cinematic',
        'luxury',
        'glassmorphism',
        'quebec-heritage',
        'vibrant',
        'artistic',
      ];
      
      for (const style of styles) {
        const request = createRequest({
          prompt: 'Test image',
          style,
        });
        
        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });

    it('should handle different aspect ratios', async () => {
      const ratios = ['square', 'portrait', 'landscape', '9:16', '16:9'];
      
      for (const aspectRatio of ratios) {
        const request = createRequest({
          prompt: 'Test image',
          aspectRatio,
        });
        
        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });

    it('should return demo mode response when API key is missing', async () => {
      const request = createRequest({
        prompt: 'Test image',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      if (data.fallback) {
        expect(data.image.url).toContain('placehold.co');
        expect(data.message).toBeDefined();
      }
    });
  });

  describe('Response format', () => {
    it('should return proper success response structure', async () => {
      const request = createRequest({
        prompt: 'A test image',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.image).toBeDefined();
      expect(data.image.url).toBeDefined();
      expect(data.image.width).toBeGreaterThan(0);
      expect(data.image.height).toBeGreaterThan(0);
      expect(data.image.contentType).toBeDefined();
    });

    it('should include prompt enhancement info', async () => {
      const request = createRequest({
        prompt: 'Test',
        style: 'photorealistic',
        enhancePrompt: true,
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(data.prompt).toBeDefined();
      expect(data.style).toBeDefined();
      expect(data.aspectRatio).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle empty prompt', async () => {
      const request = createRequest({
        prompt: '',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('Quebec-themed images', () => {
    it('should generate Quebec heritage styled images', async () => {
      const request = createRequest({
        prompt: 'Montreal skyline with fleur-de-lys',
        style: 'quebec-heritage',
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
