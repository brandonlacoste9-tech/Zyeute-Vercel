# 🤖 AI Integration Guide - DeepSeek + Flux.1

**Last Updated**: 2025-12-09

This guide shows you how to integrate Zyeuté's open-source AI stack (DeepSeek V3 + Flux.1 Schnell) into your features.

---

## 🚀 Quick Start

### 1. Set Up API Keys

Add to your `.env` file:

```bash
VITE_DEEPSEEK_API_KEY=sk-your-deepseek-key
VITE_FAL_API_KEY=your-fal-api-key
```

Get keys:
- DeepSeek: [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)
- Fal.ai: [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)

### 2. Import Services

```typescript
import tiGuyService from '@/services/tiGuyService';
import imageGenService from '@/services/imageGenService';
```

---

## 📝 Example: Caption Generator Component

```typescript
import { useState } from 'react';
import { generateCaption } from '@/services/tiGuyService';

export function CaptionGenerator() {
  const [description, setDescription] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateCaption(description, 'fun');
      setCaption(result);
    } catch (error) {
      console.error('Caption generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="caption-generator">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Décris ta photo..."
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Ti-Guy réfléchit...' : 'Générer caption'}
      </button>
      {caption && <p className="caption">{caption}</p>}
    </div>
  );
}
```

---

## 🎨 Example: Image Generator Component

```typescript
import { useState } from 'react';
import { generateImage } from '@/services/imageGenService';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateImage({
        prompt,
        style: 'luxury',
        aspectRatio: 'square',
        enhancePrompt: true
      });

      if (result) {
        setImageUrl(result.url);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-generator">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Décris l'image que tu veux..."
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Flux génère...' : 'Générer image'}
      </button>
      {imageUrl && (
        <img src={imageUrl} alt="Generated" className="generated-image" />
      )}
    </div>
  );
}
```

---

## 💬 Example: Ti-Guy Chat Interface

```typescript
import { useState } from 'react';
import { chatWithTiGuy } from '@/services/tiGuyService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function TiGuyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithTiGuy(input, messages);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ti-guy-chat">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'Toi' : 'Ti-Guy'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Jase avec Ti-Guy..."
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? '...' : 'Envoyer'}
        </button>
      </div>
    </div>
  );
}
```

---

## 🎯 Example: Upload Flow with AI Enhancements

```typescript
import { useState } from 'react';
import { generateCaption, generateHashtags } from '@/services/tiGuyService';

export function EnhancedUpload() {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleAIEnhance = async () => {
    if (!description) return;

    // Generate caption and hashtags in parallel
    const [generatedCaption, generatedHashtags] = await Promise.all([
      generateCaption(description, 'fun'),
      generateHashtags(description, 5)
    ]);

    setCaption(generatedCaption);
    setHashtags(generatedHashtags);
  };

  const handlePost = async () => {
    // Upload to Supabase Storage
    // Create post with caption and hashtags
    console.log('Posting:', { image, caption, hashtags });
  };

  return (
    <div className="enhanced-upload">
      <input type="file" accept="image/*" onChange={handleImageSelect} />

      {image && (
        <>
          <img src={URL.createObjectURL(image)} alt="Preview" />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décris ta photo..."
          />
          <button onClick={handleAIEnhance}>
            ✨ Ti-Guy, aide-moi!
          </button>

          {caption && (
            <div className="ai-suggestions">
              <h3>Caption suggérée:</h3>
              <p>{caption}</p>
              <button onClick={() => setCaption('')}>Régénérer</button>
            </div>
          )}

          {hashtags.length > 0 && (
            <div className="hashtags">
              <h3>Hashtags suggérés:</h3>
              {hashtags.map((tag, i) => (
                <span key={i} className="hashtag">{tag}</span>
              ))}
            </div>
          )}

          <button onClick={handlePost} className="btn-gold">
            Publier 🔥
          </button>
        </>
      )}
    </div>
  );
}
```

---

## 🛠️ Advanced: Error Handling & Loading States

```typescript
import { useState } from 'react';
import { generateCaption } from '@/services/tiGuyService';
import { toast } from 'react-hot-toast'; // or your toast library

export function RobustCaptionGenerator() {
  const [description, setDescription] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Entre une description!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateCaption(description, 'fun');

      // Check if we got a demo response
      if (result.includes('démo') || result.includes('demo')) {
        toast.warn('Mode démo - configure ton API key DeepSeek');
      } else {
        toast.success('Caption générée!');
      }

      setCaption(result);
    } catch (error) {
      console.error('Caption generation failed:', error);
      setError('Impossible de générer la caption. Réessaie!');
      toast.error('Ti-Guy a un problème 😅');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="robust-generator">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Décris ta photo..."
        disabled={loading}
      />
      <button onClick={handleGenerate} disabled={loading || !description.trim()}>
        {loading ? (
          <>
            <span className="spinner" /> Ti-Guy réfléchit...
          </>
        ) : (
          'Générer caption'
        )}
      </button>

      {error && <p className="error">{error}</p>}
      {caption && !error && (
        <div className="caption-result">
          <p>{caption}</p>
          <button onClick={() => setCaption('')}>Régénérer</button>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Best Practices

### 1. Always Check API Key Availability

```typescript
import { isFluxAvailable } from '@/services/imageGenService';

if (!isFluxAvailable()) {
  // Show upgrade prompt or demo mode indicator
  console.warn('Flux.1 not available - using demo mode');
}
```

### 2. Show Progress/Loading States

```typescript
// Use estimated generation time
import { getEstimatedGenerationTime } from '@/services/imageGenService';

const estimatedTime = getEstimatedGenerationTime(1); // ~6 seconds
console.log(`Image will be ready in ~${estimatedTime}s`);
```

### 3. Cache Generated Content

```typescript
// Save to Supabase Storage to avoid regenerating
const { data, error } = await supabase.storage
  .from('generated-images')
  .upload(`${userId}/${timestamp}.jpg`, imageBlob);
```

### 4. Provide Fallbacks

```typescript
const caption = await generateCaption(description, 'fun').catch(() => {
  return "Wow! C'est malade! 🔥 #Quebec #MTL";
});
```

---

## 🔍 Debugging

### Check Service Status

```typescript
// In browser console or debug component
console.log('DeepSeek Key:', !!import.meta.env.VITE_DEEPSEEK_API_KEY);
console.log('Fal Key:', !!import.meta.env.VITE_FAL_API_KEY);
```

### Enable Verbose Logging

Services automatically log to console with context:

```
[TiGuyService] ✅ Caption generated: Yo! Une belle pout...
[ImageGenService] 🎨 Generating image with Flux.1 Schnell...
[ImageGenService] 📊 Progress: IN_PROGRESS
[ImageGenService] ✅ Image generated successfully!
```

---

## 📚 Further Reading

- [DeepSeek V3 Documentation](https://platform.deepseek.com/docs)
- [Fal.ai Flux Documentation](https://fal.ai/models/fal-ai/flux/schnell)
- [CLAUDE.md - AI Features Section](/CLAUDE.md#-ai-features-ti-guy---open-source-stack)

---

**Questions?** Check the main CLAUDE.md documentation or ask Ti-Guy! 🔥⚜️
