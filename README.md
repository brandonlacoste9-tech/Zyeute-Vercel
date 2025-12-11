# 🔥⚜️ Zyeuté - Quebec's Premier Social Platform ⚜️🔥

**Fait au Québec, pour le Québec** 🇨🇦

Zyeuté is Quebec's first AI-powered social media platform built specifically for Quebecers, by Quebecers. Powered by cutting-edge open-source AI technology and designed with Quebec's unique culture and Joual language at its core.

## 🚀 Tech Stack

### Core Platform
- **Frontend**: Next.js 16, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe
- **Styling**: Tailwind CSS v4 (custom "Fur Trader meets Louis Vuitton" design system)

### AI Stack (Open Source First)
- **Text Generation**: **DeepSeek V3** - Cost-efficient, open-source alternative to GPT-4
- **Image Generation**: **Flux.1 Schnell** via Fal.ai - Fast, open-source image generation (4-8 seconds)
- **Fallback**: OpenAI (GPT-4, DALL-E 3) for hybrid deployments

## 🤖 AI Features

### Ti-Guy - Your Joual-Speaking AI Assistant
Powered by **DeepSeek V3**, Ti-Guy is Zyeuté's AI assistant who:
- Speaks authentic **Joual** (Quebec French dialect)
- Generates captions with Quebec cultural references
- Suggests hashtags for the Quebec audience
- Provides content recommendations
- Understands Quebec slang, expressions, and culture

### AI Image Generation
Powered by **Flux.1 Schnell**, the platform offers:
- 4-8 second image generation (vs 15-30s with DALL-E)
- Quebec-themed presets (fleur-de-lys, Montreal, cultural elements)
- Style options: photorealistic, luxury, glassmorphism, Quebec heritage
- Multiple aspect ratios (square, portrait, landscape, 9:16, 16:9)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/brandonlacoste9-tech/Zyeute-Vercel.git
cd Zyeute-Vercel

# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env.local

# Configure your API keys (see Configuration section)

# Run development server
npm run dev
```

## ⚙️ Configuration

### Required Environment Variables

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services (Optional - runs in demo mode without)
VITE_DEEPSEEK_API_KEY=sk-...        # For Ti-Guy AI assistant
VITE_FAL_API_KEY=...                # For Flux.1 Schnell image generation
VITE_OPENAI_API_KEY=sk-...          # Fallback for OpenAI services

# Stripe (Optional - runs in demo mode without)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### AI API Keys Setup

#### DeepSeek V3 (Text Generation)
1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Create an account and generate an API key
3. Add to `.env.local`: `DEEPSEEK_API_KEY=sk-...` (server-side only)
4. Cost: ~$0.15 per 1M tokens (95% cheaper than GPT-4)

#### Flux.1 Schnell (Image Generation)
1. Visit [Fal.ai](https://fal.ai/)
2. Create an account and get your API key
3. Add to `.env.local`: `FAL_API_KEY=...` (server-side only)
4. Cost: ~$0.003 per image (fast generation)

### Demo Mode
Without API keys, the platform runs in **demo mode**:
- Ti-Guy returns mock responses
- Image generation shows placeholder images
- All features remain functional for testing

## 🛠️ Development

```bash
# Run dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Testing
npm test                 # Unit tests
npm run test:e2e        # E2E tests with Playwright
npm run test:coverage   # Coverage report
```

## 🧪 Testing

### Unit Tests
```bash
npm test -- src/services/tiGuyService.test.ts
npm test -- src/services/imageGenService.test.ts
```

### Integration Tests
```bash
npm test -- src/app/api/ai/deepseek
npm test -- src/app/api/ai/flux
```

### E2E Tests
```bash
npm run test:e2e
```

## 📡 API Endpoints

### DeepSeek V3 (Text Generation)

#### POST `/api/ai/deepseek/chat`
General chat with Ti-Guy
```json
{
  "messages": [
    { "role": "user", "content": "Salut Ti-Guy!" }
  ],
  "maxTokens": 500,
  "temperature": 0.8
}
```

#### POST `/api/ai/deepseek/caption`
Generate captions for posts
```json
{
  "description": "Une belle poutine du Plateau",
  "tone": "fun"
}
```

### Flux.1 Schnell (Image Generation)

#### POST `/api/ai/flux/generate`
Generate images
```json
{
  "prompt": "Montreal skyline with fleur-de-lys",
  "style": "quebec-heritage",
  "aspectRatio": "landscape",
  "enhancePrompt": true
}
```

## 🎨 Design System

Zyeuté uses a unique "Fur Trader meets Louis Vuitton" aesthetic:
- **Colors**: Dark leather browns, gold accents, rich blacks
- **Materials**: Leather textures, gold stitching, glassmorphism
- **Typography**: Embossed text, bold Quebec pride
- **Inspiration**: Quebec's fur trading heritage + modern luxury

See `DESIGN_SYSTEM.md` for complete documentation.

## 🔐 Security

- Row Level Security (RLS) enabled on all Supabase tables
- Content moderation with AI-powered filtering
- Secure API key management (never commit real keys)
- Rate limiting on AI endpoints
- CORS protection

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

See `CONTRIBUTING.md` for contribution guidelines.

## 📞 Support

- Issues: [GitHub Issues](https://github.com/brandonlacoste9-tech/Zyeute-Vercel/issues)
- Docs: See `/docs` directory
- Community: Coming soon!

---

**Made with ❤️ in Quebec** 🇨🇦
*Propulsé par l'intelligence artificielle open source*
