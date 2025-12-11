# 🤖 AI Integration Guide - DeepSeek V3 & Flux.1 Schnell

This document provides comprehensive guidance for using Zyeuté's AI features powered by open-source models.

## Table of Contents
1. [Overview](#overview)
2. [DeepSeek V3 (Text Generation)](#deepseek-v3-text-generation)
3. [Flux.1 Schnell (Image Generation)](#flux1-schnell-image-generation)
4. [API Endpoints](#api-endpoints)
5. [Service Layer](#service-layer)
6. [Provider Abstraction](#provider-abstraction)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Zyeuté uses a **hybrid AI stack** that prioritizes open-source models while maintaining OpenAI as a fallback option:

| Feature | Primary Provider | Fallback | Cost Comparison |
|---------|-----------------|----------|-----------------|
| Text Generation | DeepSeek V3 | OpenAI GPT-4 | 95% cheaper |
| Image Generation | Flux.1 Schnell | DALL-E 3 | 90% cheaper |

### Why Open Source First?

1. **Cost Efficiency**: 10-20x cheaper than proprietary models
2. **Transparency**: Full control over model behavior
3. **Privacy**: Option to self-host (future with Colony OS)
4. **Performance**: Comparable or better quality
5. **Quebec Independence**: Less reliance on US tech giants

---

## DeepSeek V3 (Text Generation)

### What is DeepSeek V3?

DeepSeek V3 is an open-source large language model that:
- Matches GPT-4 performance on most tasks
- Costs ~$0.15 per 1M tokens (vs $15-30 for GPT-4)
- Provides OpenAI-compatible API
- Supports 128K context window
- Excels at code, reasoning, and multilingual tasks

### Setup

1. **Get API Key**
   - Visit: https://platform.deepseek.com/
   - Sign up for an account
   - Navigate to API Keys section
   - Generate a new key (starts with `sk-`)

2. **Configure Environment**
   ```bash
   # Add to .env.local
   VITE_DEEPSEEK_API_KEY=sk-your-key-here
   ```

3. **Verify Setup**
   ```bash
   # Run health check
   npm run dev
   # Visit: http://localhost:3000/playground
   # Test Ti-Guy chat
   ```

### Ti-Guy Service

Ti-Guy is Zyeuté's AI assistant powered by DeepSeek V3. He speaks authentic Joual and understands Quebec culture.

#### Usage in Code

```typescript
import { generateCaption, chatWithTiGuy, generateHashtags } from '@/services/tiGuyService';

// Generate caption
const caption = await generateCaption('Une poutine du Plateau', 'fun');
// Returns: "Yo! Une belle pout bien graisseuse! 🍟🔥 #MTL #Poutine"

// Chat with Ti-Guy
const response = await chatWithTiGuy('Comment générer du contenu viral?');
// Returns: Quebec-focused advice in Joual

// Generate hashtags
const tags = await generateHashtags('Festival d\'été', 5);
// Returns: ['#Quebec', '#MTL', '#Festival', '#Ete', '#514']
```

#### API Endpoints

**POST `/api/ai/deepseek/chat`**
```bash
curl -X POST http://localhost:3000/api/ai/deepseek/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Salut Ti-Guy!"}
    ],
    "maxTokens": 500,
    "temperature": 0.8
  }'
```

**POST `/api/ai/deepseek/caption`**
```bash
curl -X POST http://localhost:3000/api/ai/deepseek/caption \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Une poutine du Mile End",
    "tone": "fun"
  }'
```

### Joual System Prompt

Ti-Guy uses a comprehensive system prompt that defines:
- **Personality**: Friendly Quebec AI assistant
- **Language Rules**: Authentic Joual expressions
- **Cultural Context**: Quebec regions, events, slang
- **Content Guidelines**: Hashtags, emojis, tone

See `src/services/tiGuyService.ts` for the full prompt.

### Cost Estimation

| Operation | Tokens | Cost (DeepSeek) | Cost (GPT-4) |
|-----------|--------|----------------|--------------|
| Caption (200 chars) | ~100 | $0.000015 | $0.0015 |
| Chat (500 chars) | ~250 | $0.0000375 | $0.00375 |
| Hashtags | ~50 | $0.0000075 | $0.00075 |

**Monthly estimate (1000 users, 10 captions/day)**: $4.50 vs $450

---

## Flux.1 Schnell (Image Generation)

### What is Flux.1 Schnell?

Flux.1 Schnell is an open-source text-to-image model that:
- Generates images in 4-8 seconds (vs 15-30s for DALL-E)
- Produces photorealistic, high-quality results
- Costs ~$0.003 per image (vs $0.04-0.08 for DALL-E)
- Supports multiple styles and aspect ratios
- Has fewer content restrictions

### Setup

1. **Get API Key**
   - Visit: https://fal.ai/
   - Create account
   - Get API key from dashboard

2. **Configure Environment**
   ```bash
   # Add to .env.local
   VITE_FAL_API_KEY=your-fal-key-here
   ```

3. **Verify Setup**
   ```bash
   # Run playground
   npm run dev
   # Visit: http://localhost:3000/playground
   # Test image generation
   ```

### Image Generation Service

#### Usage in Code

```typescript
import { 
  generateImage, 
  generateQuebecImage,
  generateZyeuteStyledImage 
} from '@/services/imageGenService';

// Basic image generation
const image = await generateImage({
  prompt: 'A beautiful poutine',
  style: 'photorealistic',
  aspectRatio: 'square',
  enhancePrompt: true
});
// Returns: { url, width, height, contentType }

// Quebec-themed image
const quebecImage = await generateQuebecImage(
  'Montreal skyline in winter',
  'quebec-heritage',
  'landscape'
);

// Zyeuté-styled image (luxury glassmorphism)
const zyeuteImage = await generateZyeuteStyledImage(
  'Social media app screenshot'
);
```

#### API Endpoint

**POST `/api/ai/flux/generate`**
```bash
curl -X POST http://localhost:3000/api/ai/flux/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Montreal skyline with fleur-de-lys",
    "style": "quebec-heritage",
    "aspectRatio": "landscape",
    "enhancePrompt": true
  }'
```

### Styles Available

| Style | Description | Use Case |
|-------|-------------|----------|
| `photorealistic` | High detail, 8K quality | Profile pictures, realistic scenes |
| `cinematic` | Dramatic lighting, film grain | Story posts, dramatic content |
| `luxury` | Premium materials, gold accents | Brand imagery, premium content |
| `glassmorphism` | Frosted glass, gradients | UI elements, modern design |
| `quebec-heritage` | Fleur-de-lys, maple leaf | Quebec-specific content |
| `vibrant` | High saturation, bold | Social media posts, ads |
| `artistic` | Creative, stylized | Artistic content, unique posts |

### Aspect Ratios

| Ratio | Dimensions | Use Case |
|-------|-----------|----------|
| `square` | 1024x1024 | Instagram posts, profile pics |
| `portrait` | 768x1024 | Vertical content |
| `landscape` | 1024x768 | Desktop, horizontal content |
| `9:16` | 576x1024 | Instagram Stories, TikTok |
| `16:9` | 1024x576 | YouTube, desktop |

### Cost Estimation

| Operation | Cost (Flux) | Cost (DALL-E 3) | Savings |
|-----------|-------------|-----------------|---------|
| Single image | $0.003 | $0.040 | 93% |
| 1000 images | $3.00 | $40.00 | $37 |
| 100K images/mo | $300 | $4,000 | $3,700 |

---

## API Endpoints

### Authentication

API endpoints run server-side and automatically use environment variables. No additional auth headers needed when calling from the frontend.

### Rate Limiting

Current limits (can be configured):
- DeepSeek Chat: 60 requests/minute
- DeepSeek Caption: 100 requests/minute
- Flux Generate: 20 requests/minute

### Error Handling

All endpoints return consistent error format:
```json
{
  "error": "Error message",
  "message": "Detailed description",
  "fallback": true
}
```

### Demo Mode

When API keys are not configured, endpoints return:
- **DeepSeek**: Mock responses with Quebec-themed content
- **Flux**: Placeholder images from placehold.co

---

## Service Layer

### tiGuyService.ts

Core functions:
- `generateCaption(description, tone)` - Generate Joual captions
- `generateHashtags(topic, count)` - Quebec hashtags
- `chatWithTiGuy(message, history)` - Conversational AI
- `getContentSuggestions(profile)` - Content ideas

### imageGenService.ts

Core functions:
- `generateImage(options)` - Base image generation
- `generateQuebecImage(desc, style, ratio)` - Quebec-themed
- `generateZyeuteStyledImage(desc, ratio)` - Zyeuté aesthetic
- `generateAvatar(description)` - Profile pictures
- `generatePostThumbnail(desc, ratio)` - Social thumbnails

---

## Provider Abstraction

The `src/lib/ai/providers.ts` module provides unified interface:

```typescript
import { 
  getTextProvider, 
  getImageProvider,
  chatCompletion,
  getAvailableProviders 
} from '@/lib/ai/providers';

// Check which provider is active
const textProvider = getTextProvider(); // 'deepseek' or 'openai'
const imageProvider = getImageProvider(); // 'flux' or 'dalle'

// Universal chat completion
const response = await chatCompletion({
  messages: [{ role: 'user', content: 'Hello' }],
  maxTokens: 500,
  temperature: 0.8
});

// Check available providers
const { text, image } = getAvailableProviders();
// text: ['deepseek', 'openai']
// image: ['flux', 'dalle']
```

### Switching Providers

To switch from DeepSeek to OpenAI:
1. Add `VITE_OPENAI_API_KEY` to `.env.local`
2. Remove `VITE_DEEPSEEK_API_KEY`
3. Provider abstraction automatically uses OpenAI

---

## Testing

### Unit Tests

```bash
# Test Ti-Guy service
npm test -- src/services/tiGuyService.test.ts

# Test image generation service
npm test -- src/services/imageGenService.test.ts
```

### Integration Tests

```bash
# Test DeepSeek API endpoints
npm test -- src/app/api/ai/deepseek

# Test Flux API endpoints
npm test -- src/app/api/ai/flux
```

### Manual Testing

#### Ti-Guy (DeepSeek)
1. Navigate to `/playground`
2. Use "Le Concierge" chat interface
3. Test different tones and prompts
4. Verify Joual responses

#### Image Generation (Flux)
1. Navigate to `/playground`
2. Use "L'Atelier" image section
3. Try different styles and prompts
4. Verify image generation

### Smoke Test Checklist

- [ ] DeepSeek caption generation works
- [ ] Ti-Guy chat responds in Joual
- [ ] Hashtag generation includes Quebec tags
- [ ] Flux generates images in < 10 seconds
- [ ] Different styles produce varied results
- [ ] Aspect ratios are correct
- [ ] Demo mode works without API keys
- [ ] Error handling shows user-friendly messages

---

## Troubleshooting

### DeepSeek Issues

**Problem**: "API key not configured"
- **Solution**: Add `VITE_DEEPSEEK_API_KEY=sk-...` to `.env.local`

**Problem**: Rate limit errors
- **Solution**: DeepSeek has generous limits. Contact support if needed.

**Problem**: Responses not in Joual
- **Solution**: System prompt is comprehensive. May need temperature adjustment.

### Flux.1 Issues

**Problem**: "Fal.ai API key not configured"
- **Solution**: Add `VITE_FAL_API_KEY=...` to `.env.local`

**Problem**: Slow generation (> 30 seconds)
- **Solution**: Flux Schnell should be fast. Check Fal.ai status.

**Problem**: Images not loading
- **Solution**: Check CORS, verify URL is accessible

### General Issues

**Problem**: Environment variables not loading
- **Solution**: Restart dev server after changing `.env.local`

**Problem**: TypeScript errors
- **Solution**: Run `npm run type-check` and fix reported errors

**Problem**: Tests failing
- **Solution**: Ensure dependencies installed: `npm install --legacy-peer-deps`

### Getting Help

1. Check GitHub Issues
2. Review logs in browser console
3. Check Fal.ai/DeepSeek status pages
4. Contact support (see README)

---

## Best Practices

### Prompt Engineering

**Good prompts**:
- Clear and specific
- Include style guidance
- Reference Quebec culture when relevant
- Use appropriate tone (fun, chill, hype, drole)

**Bad prompts**:
- Too vague ("Generate something")
- No context
- Expecting formal French (Ti-Guy speaks Joual!)

### Cost Optimization

1. **Cache responses** when possible
2. **Adjust maxTokens** based on need (50-500)
3. **Use lower temperature** (0.5-0.7) for consistent outputs
4. **Batch operations** when generating multiple items

### Security

1. **Never expose API keys** in client code
2. **Use server-side endpoints** in production
3. **Implement rate limiting** to prevent abuse
4. **Sanitize user inputs** before sending to AI
5. **Monitor usage** to detect anomalies

---

## Roadmap

### Near Term
- [ ] Add streaming support for chat
- [ ] Implement response caching
- [ ] Add more style presets
- [ ] Quebec event-based prompts

### Long Term
- [ ] Self-host DeepSeek on Colony OS
- [ ] Self-host Flux.1 for full control
- [ ] Fine-tune models on Quebec data
- [ ] Multi-modal AI (video generation)

---

**Questions?** Open an issue on GitHub or check the main README.

*Propulsé par l'intelligence artificielle open source* 🤖🇨🇦
