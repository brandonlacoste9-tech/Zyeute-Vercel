# 🧪 Smoke Test Guide - AI Integration

This guide provides step-by-step instructions for manually testing the DeepSeek V3 and Flux.1 Schnell integrations.

## Prerequisites

- Development server running (`npm run dev`)
- Browser with developer tools open
- Optional: API keys configured in `.env.local`

## Test Modes

### Mode 1: Demo Mode (No API Keys)
Test without configuring API keys to verify fallback behavior.

### Mode 2: Full Mode (With API Keys)
Test with actual API keys to verify real AI functionality.

---

## 🔥 DeepSeek V3 Tests

### Test 1: Caption Generation (Service Layer)

**Location**: Browser Console

```javascript
// Import the service
const { generateCaption } = await import('/src/services/tiGuyService.ts');

// Test caption generation
const caption = await generateCaption('Une poutine du Plateau', 'fun');
console.log('Caption:', caption);
```

**Expected Results**:
- ✅ Demo Mode: Returns mock caption with Quebec flavor
- ✅ Full Mode: Returns Joual caption with emojis and hashtags
- ✅ No errors in console
- ✅ Response time < 3 seconds (full mode)

### Test 2: Ti-Guy Chat (Playground UI)

**Location**: `http://localhost:3000/playground`

1. Navigate to playground
2. Find "Le Concierge" (Ti-Guy chat) section
3. Enter message: "Salut Ti-Guy! Comment générer du contenu viral?"
4. Click send button
5. Wait for response

**Expected Results**:
- ✅ UI shows loading state
- ✅ Demo Mode: Returns friendly fallback message
- ✅ Full Mode: Returns response in authentic Joual
- ✅ Response appears in chat history
- ✅ No console errors

### Test 3: Caption API Endpoint

**Location**: Terminal

```bash
curl -X POST http://localhost:3000/api/ai/deepseek/caption \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Festival d'\''été de Québec",
    "tone": "hype"
  }'
```

**Expected Results**:
```json
{
  "success": true,
  "caption": "...",
  "tone": "hype",
  "usage": { ... }
}
```

- ✅ Returns 200 status code
- ✅ Caption contains Quebec references
- ✅ Includes emojis and hashtags
- ✅ Demo mode returns fallback caption

### Test 4: Chat API Endpoint

**Location**: Terminal

```bash
curl -X POST http://localhost:3000/api/ai/deepseek/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Donne-moi des idées de posts pour la Saint-Jean"}
    ],
    "maxTokens": 300
  }'
```

**Expected Results**:
- ✅ Returns 200 (with key) or 503 (no key)
- ✅ Content includes Quebec cultural references
- ✅ Response is in Joual (not formal French)

### Test 5: Hashtag Generation

**Location**: Browser Console

```javascript
const { generateHashtags } = await import('/src/services/tiGuyService.ts');
const tags = await generateHashtags('Poutine week', 5);
console.log('Hashtags:', tags);
```

**Expected Results**:
- ✅ Returns array of hashtags
- ✅ Includes Quebec-specific tags (#MTL, #QC, etc.)
- ✅ All items start with '#'
- ✅ Returns 3-5 hashtags

---

## 🎨 Flux.1 Schnell Tests

### Test 6: Image Generation (Service Layer)

**Location**: Browser Console

```javascript
const { generateImage } = await import('/src/services/imageGenService.ts');

const result = await generateImage({
  prompt: 'Une poutine classique avec beaucoup de fromage',
  style: 'photorealistic',
  aspectRatio: 'square'
});

console.log('Image URL:', result?.url);
console.log('Dimensions:', result?.width, 'x', result?.height);
```

**Expected Results**:
- ✅ Demo Mode: Returns placeholder URL (placehold.co)
- ✅ Full Mode: Returns actual image URL
- ✅ Correct dimensions based on aspect ratio
- ✅ No errors in console
- ✅ Generation time < 10 seconds (full mode)

### Test 7: Image Generation (Playground UI)

**Location**: `http://localhost:3000/playground`

1. Navigate to playground
2. Find "L'Atelier" (image generation) section
3. Modify prompt if desired
4. Click "Générer l'image" button
5. Wait for image generation

**Expected Results**:
- ✅ Loading indicator shows
- ✅ Demo Mode: Shows placeholder image
- ✅ Full Mode: Displays generated image
- ✅ Image loads properly in browser
- ✅ No broken image icons
- ✅ Generation completes in < 10 seconds

### Test 8: Quebec-Themed Image

**Location**: Browser Console

```javascript
const { generateQuebecImage } = await import('/src/services/imageGenService.ts');

const result = await generateQuebecImage(
  'Montreal skyline at sunset',
  'quebec-heritage',
  'landscape'
);

console.log('Quebec Image:', result?.url);
```

**Expected Results**:
- ✅ Returns valid image URL
- ✅ Aspect ratio is landscape (1024x768)
- ✅ Demo mode returns placeholder

### Test 9: Flux API Endpoint

**Location**: Terminal

```bash
curl -X POST http://localhost:3000/api/ai/flux/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Luxury fur coat with gold stitching, Quebec heritage style",
    "style": "luxury",
    "aspectRatio": "portrait",
    "enhancePrompt": true
  }'
```

**Expected Results**:
```json
{
  "success": true,
  "image": {
    "url": "https://...",
    "width": 768,
    "height": 1024,
    "contentType": "image/jpeg"
  },
  "style": "luxury",
  "aspectRatio": "portrait"
}
```

- ✅ Returns 200 status code
- ✅ Image object has all required fields
- ✅ Dimensions match aspect ratio
- ✅ Demo mode returns fallback property

### Test 10: Different Styles

**Location**: Browser Console

```javascript
const { generateImage } = await import('/src/services/imageGenService.ts');

const styles = ['photorealistic', 'cinematic', 'luxury', 'glassmorphism', 'quebec-heritage', 'vibrant', 'artistic'];

for (const style of styles) {
  console.log(`Testing style: ${style}`);
  const result = await generateImage({
    prompt: 'Test image',
    style: style,
  });
  console.log(`✓ ${style}:`, result?.url);
}
```

**Expected Results**:
- ✅ All styles generate without errors
- ✅ Each returns a valid URL
- ✅ No style causes a crash

---

## 🔄 Provider Abstraction Tests

### Test 11: Check Available Providers

**Location**: Browser Console

```javascript
const { getAvailableProviders, getProviderInfo } = await import('/src/lib/ai/providers.ts');

const providers = getAvailableProviders();
console.log('Available providers:', providers);

console.log('DeepSeek info:', getProviderInfo('deepseek'));
console.log('Flux info:', getProviderInfo('flux'));
```

**Expected Results**:
- ✅ Returns object with text and image arrays
- ✅ Includes configured providers
- ✅ Provider info shows correct details

### Test 12: Provider Auto-Selection

**Location**: Browser Console

```javascript
const { getTextProvider, getImageProvider } = await import('/src/lib/ai/providers.ts');

console.log('Text provider:', getTextProvider());
console.log('Image provider:', getImageProvider());
```

**Expected Results**:
- ✅ Returns 'deepseek' or 'openai' based on config
- ✅ Returns 'flux' or 'dalle' based on config
- ✅ Defaults correctly when no keys present

---

## 🧪 Unit Test Execution

### Test 13: Run Service Unit Tests

**Location**: Terminal

```bash
# Test Ti-Guy service
npm test -- src/services/tiGuyService.test.ts --run

# Test Image Gen service
npm test -- src/services/imageGenService.test.ts --run
```

**Expected Results**:
- ✅ All tests pass
- ✅ No timeout errors
- ✅ Mocks work correctly
- ✅ Coverage > 80%

### Test 14: Run API Integration Tests

**Location**: Terminal

```bash
# Test DeepSeek API
npm test -- src/app/api/ai/deepseek --run

# Test Flux API
npm test -- src/app/api/ai/flux --run
```

**Expected Results**:
- ✅ All tests pass
- ✅ Request validation works
- ✅ Error handling tested
- ✅ Response formats validated

---

## 🏗️ Build & Type Checking

### Test 15: TypeScript Compilation

**Location**: Terminal

```bash
npm run type-check
```

**Expected Results**:
- ✅ No type errors
- ✅ All imports resolve correctly
- ✅ API route types are correct

### Test 16: Production Build

**Location**: Terminal

```bash
npm run build
```

**Expected Results**:
- ✅ Build completes successfully
- ✅ No webpack errors
- ✅ All routes compile
- ✅ Bundle size is reasonable

---

## 📝 Checklist Summary

Use this checklist to track your smoke test progress:

### DeepSeek V3 (Ti-Guy)
- [ ] Caption generation works (service)
- [ ] Ti-Guy chat works (playground UI)
- [ ] Caption API endpoint works
- [ ] Chat API endpoint works
- [ ] Hashtag generation works
- [ ] Joual responses are authentic
- [ ] Demo mode provides fallbacks

### Flux.1 Schnell
- [ ] Image generation works (service)
- [ ] Image generation works (playground UI)
- [ ] Quebec-themed images generate
- [ ] Flux API endpoint works
- [ ] All styles work correctly
- [ ] Aspect ratios are correct
- [ ] Demo mode provides placeholders

### Provider Abstraction
- [ ] Available providers detected
- [ ] Provider info is accurate
- [ ] Auto-selection works
- [ ] Fallback providers work

### Testing & Build
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Type checking passes
- [ ] Production build succeeds

---

## 🐛 Common Issues & Solutions

### Issue: "API key not configured"
**Solution**: Check `.env.local` file has correct key names and values

### Issue: Slow image generation
**Solution**: Normal for first request. Subsequent should be 4-8 seconds.

### Issue: Tests fail with "Cannot find module"
**Solution**: Run `npm install --legacy-peer-deps` to ensure all deps installed

### Issue: CORS errors in browser
**Solution**: Ensure dev server is running and URLs are correct

### Issue: ESLint errors on commit
**Solution**: Pre-commit hook may need to be skipped with `--no-verify`

---

## 📊 Performance Benchmarks

### Expected Timings

| Operation | Demo Mode | Full Mode (DeepSeek/Flux) | Full Mode (OpenAI) |
|-----------|-----------|---------------------------|-------------------|
| Caption Gen | < 0.1s | 1-3s | 2-5s |
| Ti-Guy Chat | < 0.1s | 2-4s | 3-6s |
| Image Gen | < 0.1s | 4-8s | 15-30s |
| Hashtags | < 0.1s | 1-2s | 2-4s |

### Memory Usage
- Initial page load: ~50-80 MB
- After AI operations: ~80-120 MB
- Image generation spike: +20-40 MB (temporary)

---

## ✅ Sign-Off

After completing all smoke tests, verify:

1. **Functionality**: All features work as expected
2. **Performance**: Response times are acceptable
3. **Error Handling**: Errors display user-friendly messages
4. **Documentation**: README and AI_INTEGRATION.md are accurate
5. **Tests**: All automated tests pass
6. **Build**: Production build succeeds

**Tester Name**: ________________
**Date**: ________________
**API Keys Used**: [ ] Demo Mode [ ] Full Mode
**All Tests Passed**: [ ] Yes [ ] No

**Notes**:
_________________________________________
_________________________________________
_________________________________________

---

**🔥⚜️ Ready for Production!** 🇨🇦
