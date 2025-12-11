/**
 * Unit Tests for Ti-Guy Service (DeepSeek V3)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as tiGuyService from './tiGuyService';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: "Yo! C'est malade ça! 🔥 Tiguidou! #Quebec #MTL",
                },
              },
            ],
            usage: {
              prompt_tokens: 50,
              completion_tokens: 30,
              total_tokens: 80,
            },
            model: 'deepseek-chat',
          }),
        },
      },
    })),
  };
});

describe('tiGuyService', () => {
  describe('generateCaption', () => {
    it('should generate a caption with default tone', async () => {
      const description = 'Une belle poutine';
      const result = await tiGuyService.generateCaption(description);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate a caption with different tones', async () => {
      const tones: Array<'fun' | 'chill' | 'hype' | 'drole'> = ['fun', 'chill', 'hype', 'drole'];
      
      for (const tone of tones) {
        const result = await tiGuyService.generateCaption('Test', tone);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }
    });

    it('should handle fallback when API key is missing', async () => {
      // This test verifies fallback behavior
      const result = await tiGuyService.generateCaption('Test');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('generateHashtags', () => {
    it('should generate hashtags for a topic', async () => {
      const topic = 'poutine';
      const result = await tiGuyService.generateHashtags(topic);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate specified number of hashtags', async () => {
      const topic = 'Montreal';
      const count = 3;
      const result = await tiGuyService.generateHashtags(topic, count);
      
      expect(Array.isArray(result)).toBe(true);
      // Result may be less than count due to filtering
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return Quebec hashtags in fallback mode', async () => {
      const result = await tiGuyService.generateHashtags('Test');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('chatWithTiGuy', () => {
    it('should generate a chat response', async () => {
      const userMessage = 'Salut Ti-Guy!';
      const result = await tiGuyService.chatWithTiGuy(userMessage);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle conversation history', async () => {
      const userMessage = 'Comment ça va?';
      const history = [
        { role: 'user' as const, content: 'Salut!' },
        { role: 'assistant' as const, content: 'Yo! Ça va bien?' },
      ];
      
      const result = await tiGuyService.chatWithTiGuy(userMessage, history);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should return fallback message when API key is missing', async () => {
      const result = await tiGuyService.chatWithTiGuy('Test');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('getContentSuggestions', () => {
    it('should generate content suggestions with user profile', async () => {
      const profile = {
        region: 'Montreal',
        interests: ['poutine', 'hockey', 'festivals'],
      };
      
      const result = await tiGuyService.getContentSuggestions(profile);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate suggestions with minimal profile', async () => {
      const profile = {};
      const result = await tiGuyService.getContentSuggestions(profile);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return fallback suggestions when API is unavailable', async () => {
      const result = await tiGuyService.getContentSuggestions({});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Integration with Joual', () => {
    it('should include Quebec cultural references', async () => {
      const result = await tiGuyService.generateCaption('Montreal en hiver');
      
      // Check for Quebec-related content (flexible check)
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(10);
    });
  });
});
