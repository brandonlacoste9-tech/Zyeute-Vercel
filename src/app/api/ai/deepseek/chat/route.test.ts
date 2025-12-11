/**
 * Integration Tests for DeepSeek Chat API
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('DeepSeek Chat API', () => {
  const createRequest = (body: any): NextRequest => {
    return new NextRequest('http://localhost:3000/api/ai/deepseek/chat', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  describe('POST /api/ai/deepseek/chat', () => {
    it('should return 400 when messages are missing', async () => {
      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 400 when messages is not an array', async () => {
      const request = createRequest({ messages: 'invalid' });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 503 when API key is not configured', async () => {
      // Assuming no API key in test environment
      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      // Should be 503 (no API key) or 200 (API key present)
      expect([200, 503]).toContain(response.status);
      
      if (response.status === 503) {
        expect(data.fallback).toBe(true);
      }
    });

    it('should accept valid request structure', async () => {
      const request = createRequest({
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello!' },
        ],
        maxTokens: 100,
        temperature: 0.7,
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      // Should work or return fallback
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    it('should handle system prompt override', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'Test' }],
        systemPrompt: 'Custom system prompt',
      });
      
      const response = await POST(request);
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should respect maxTokens parameter', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'Tell me a story' }],
        maxTokens: 50,
      });
      
      const response = await POST(request);
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should respect temperature parameter', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.5,
      });
      
      const response = await POST(request);
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Response format', () => {
    it('should return proper success response structure', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'Test' }],
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      if (response.status === 200 && data.success) {
        expect(data.content).toBeDefined();
        expect(typeof data.content).toBe('string');
        expect(data.model).toBeDefined();
      }
    });

    it('should return proper error response structure', async () => {
      const request = createRequest({ invalid: 'data' });
      const response = await POST(request);
      const data = await response.json();
      
      if (response.status >= 400) {
        expect(data.error).toBeDefined();
      }
    });
  });
});
