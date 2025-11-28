# 🔥⚜️ Zyeuté - AI Assistant Guide ⚜️🔥

**Version**: 1.0.0

**Last Updated**: 2025-11-28

**Target**: AI assistants (Claude, GitHub Copilot, etc.)

> **Fait au Québec, pour le Québec** 🇨🇦

This document provides comprehensive guidance for AI assistants working on the Zyeuté codebase. Zyeuté is Quebec's first social media platform built specifically for Quebecers, celebrating Quebec culture, language (Joual), and community.

---

## 📋 Quick Reference

```bash
# Development
npm run dev              # Start dev server (localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build
npm run type-check       # TypeScript type checking

# Git workflow (IMPORTANT)
git checkout claude/claude-md-mijhijw21bbh26vh-01P5geG8qzMw8HEKchAKckP9
git add .
git commit -m "descriptive message"
git push -u origin claude/claude-md-mijhijw21bbh26vh-01P5geG8qzMw8HEKchAKckP9
```

**Key Documentation**:
- `README.md` - Project overview and setup
- `DESIGN_SYSTEM.md` - Complete design system
- `.github/copilot-instructions.md` - Detailed coding standards
- `SETUP_GUIDE.md` - Setup instructions

---

## 🎯 Project Overview

### What is Zyeuté?

Zyeuté is a **Quebec-first social media platform** that celebrates Quebec culture. Think Instagram + TikTok + E-commerce, but specifically for Quebecers.

**Core Identity**:
- **Language**: Uses authentic **Joual** (Quebec French dialect) throughout
- **Design**: Fur trader luxury aesthetic (leather, gold, premium)
- **Culture**: Deep integration of Quebec locations, events, and references
- **Pride**: Celebrating Quebec identity and community

### Key Features

1. **Social Media**: Posts, stories, comments, "feu" reactions (🔥), live streaming
2. **AI Tools** (Ti-Guy):
   - **Ti-Guy Artiste**: AI image generation (DALL-E 3)
   - **Ti-Guy Studio**: AI video editor with Joual captions
   - **Ti-Guy Assistant**: Conversational AI in Joual
3. **E-Commerce**: Marketplace (tickets, crafts, services, merch)
4. **Premium**: VIP subscriptions (Bronze, Silver, Gold)
5. **Gamification**: Achievements, daily challenges, leaderboards
6. **Location**: Quebec regions + Montreal neighborhood tagging

---

## 🛠️ Tech Stack

```typescript
Frontend:  React 18 + TypeScript 5.5.4 + Vite 7.2.4
Styling:   Tailwind CSS v4 (custom design system)
Routing:   React Router DOM v6
State:     React Context API
Database:  Supabase (PostgreSQL)
Auth:      Supabase Auth
Storage:   Supabase Storage
Payments:  Stripe
AI:        OpenAI (GPT-4, DALL-E 3)
Deploy:    Vercel / Netlify
```

---

## 📁 Project Structure

```
zyeute-clean/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Auth components (ProtectedAdminRoute)
│   │   ├── features/       # Feature components (TiGuy, StoryViewer, etc.)
│   │   ├── gamification/   # Achievement components
│   │   ├── moderation/     # Moderation components
│   │   ├── settings/       # Settings components
│   │   ├── BottomNav.tsx   # Bottom navigation bar
│   │   ├── Button.tsx      # Button component
│   │   ├── Avatar.tsx      # Avatar component
│   │   ├── Header.tsx      # Top header
│   │   └── ...
│   ├── pages/              # Page components (one per route)
│   │   ├── admin/          # Admin pages
│   │   ├── legal/          # Legal pages (Terms, Privacy, etc.)
│   │   ├── moderation/     # Moderation pages
│   │   ├── Feed.tsx        # Main feed
│   │   ├── Profile.tsx     # User profile
│   │   ├── Upload.tsx      # Upload content
│   │   └── ...
│   ├── services/           # Business logic & API
│   │   ├── openaiService.ts       # OpenAI integration
│   │   ├── stripeService.ts       # Stripe payments
│   │   ├── achievementService.ts  # Achievements
│   │   ├── moderationService.ts   # Content moderation
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── usePremium.ts          # Premium subscription check
│   │   └── useVideoAutoPlay.ts    # Video autoplay logic
│   ├── contexts/           # React contexts
│   │   ├── NotificationContext.tsx # Notifications
│   │   └── ThemeContext.tsx        # Theme state
│   ├── lib/                # Utilities & configs
│   │   ├── supabase.ts            # Supabase client
│   │   ├── quebecFeatures.ts      # Quebec-specific data/helpers
│   │   └── utils.ts               # General utilities
│   ├── types/              # TypeScript types
│   │   ├── database.ts     # Database types (auto-generated)
│   │   └── index.ts        # General types
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles + design system
├── public/                 # Static assets
├── supabase/               # Database
│   └── migrations/         # SQL migrations (001-007)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

---

## 🇨🇦 Quebec Culture & Joual

### Critical: ALWAYS Use Joual, Not Standard French

Zyeuté's identity is **Joual** (Quebec French dialect). This is non-negotiable.

**Example**:
- ❌ Standard French: "C'est très bon"
- ✅ Joual: "C'est tiguidou" or "C'est malade!"

### Joual Dictionary

Reference: `src/lib/quebecFeatures.ts`

```typescript
// Social Actions
like: 'Donner du feu 🔥'
comment: 'Jasette 💬'
share: 'Partager ça'

// Reactions
cool: 'Tiguidou'
nice: 'Nice en criss'
awesome: 'Malade!'
lol: 'Haha tabarnak'

// Weather (very Quebec!)
cold: 'Frette en esti'
hot: 'Chaud en tabarnak'
snow: 'Y neige!'
construction: 'Saison de construction 🚧'
```

### Quebec Cultural Elements

**Regions**: Montreal, Quebec City, Gaspésie, Laurentides, Charlevoix, etc.

**Montreal Neighborhoods**: Plateau, Mile End, Hochelaga, Verdun, etc.

**Virtual Gifts**: Poutine 🍟, Caribou 🦌, Fleur-de-lys ⚜️, Sirop d'érable 🍁

**Emojis**: ⚜️ 🇨🇦 🍁 🦫 🍟 🔥

**When Writing UI Text**:
1. Always use Joual, never standard French
2. Consult `quebecFeatures.ts` for approved phrases
3. Reference real Quebec places/events
4. Use Quebec-relevant emojis
5. Be authentic - avoid forced slang

### Ti-Guy AI Personality

Ti-Guy is the AI mascot. Personality:
- Speaks authentic Joual
- Uses expressions like "tiguidou", "en esti", "criss" (sparingly)
- Understands Quebec cultural references
- Friendly, helpful, proud of Quebec
- **Never** speaks formal/standard French

---

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ DO: Use proper types
interface ProfileProps {
  user: User;
  isOwnProfile: boolean;
  onFollow: () => void;
}

function Profile({ user, isOwnProfile, onFollow }: ProfileProps) {
  // Implementation
}

// ❌ DON'T: Use 'any' or React.FC
const Profile: React.FC<any> = (props) => { /* ... */ }
```

**Rules**:
- Always use TypeScript with proper type annotations
- Avoid `any` - use specific types or `unknown`
- Use interfaces for objects, types for unions/primitives
- Strict mode enabled
- Export types for reusability

### React Best Practices

```typescript
// ✅ DO: Functional components with hooks
function VideoCard({ video, autoplay }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (autoplay) {
      playVideo();
    }
  }, [autoplay]);

  return (/* JSX */);
}

// ❌ DON'T: Class components or React.FC
class VideoCard extends React.Component { /* ... */ }
const VideoCard: React.FC<Props> = (props) => { /* ... */ }
```

**Rules**:
- Use functional components with hooks (no class components)
- Define props: `(props: Props) => JSX.Element` or `function Component(props: Props)`
- **Avoid `React.FC`** (deprecated pattern)
- Destructure props in parameters
- Proper dependency arrays in `useEffect`, `useMemo`, `useCallback`

### File Naming

```
Components:  PascalCase.tsx  (TiGuyAssistant.tsx)
Services:    camelCase.ts    (openaiService.ts)
Utilities:   camelCase.ts    (quebecFeatures.ts)
Pages:       PascalCase.tsx  (Profile.tsx)
```

### Import Order

```typescript
// 1. React & third-party
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Services & utilities
import { supabase } from '../lib/supabase';
import { openaiService } from '../services/openaiService';

// 3. Components
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';

// 4. Types
import { User, Post } from '../types';
```

### Error Handling

Always wrap async operations:

```typescript
try {
  const result = await openai.generateImage(prompt);
  return result;
} catch (error) {
  console.error('Image generation failed:', error);
  toast.error('Impossible de générer l\'image. Réessaie!');
  return null;
}
```

**Rules**:
- Try-catch for all async operations
- Toast notifications for user-facing errors
- Console logs for debugging
- Provide fallbacks/demo modes when services unavailable

---

## 🎨 Design System

### Theme: Fur Trader × Louis Vuitton × Roots

**Aesthetic**: Premium Canadian heritage meets luxury fashion

**Elements**:
- Leather textures
- Gold accents
- Warm colors (browns, golds)
- Embossed text
- Stitched borders

Full documentation: `DESIGN_SYSTEM.md`

### Color Palette

```css
/* Gold (Accent & Premium) */
--gold-500: #F5C842    /* Primary gold */
--gold-600: #E0B32A    /* Darker accent */

/* Leather Brown (Base) */
--leather-700: #4A3728  /* Primary leather */
--leather-800: #3A2B1F  /* Dark leather */

/* Rich Black */
--black-rich: #0A0806
```

### CSS Classes (Quick Reference)

```css
/* Backgrounds */
.leather-card          /* Premium leather card */
.glass-premium         /* Frosted glass effect */
.nav-leather          /* Navigation bar */

/* Buttons */
.btn-gold             /* Primary action */
.btn-leather          /* Secondary action */

/* Inputs */
.input-premium        /* Form fields */

/* Effects */
.glow-gold            /* Gold glow */
.embossed             /* Embossed text */
.stitched             /* Stitched border */

/* Animations */
.animate-pulse-gold   /* Pulsing glow */
.animate-shimmer      /* Shimmer effect */
```

### Usage Example

```tsx
<div className="leather-card rounded-2xl p-6">
  <h2 className="text-gold-500 embossed">Zyeuté VIP</h2>
  <p className="text-white">Accès illimité à tout le contenu!</p>
  <button className="btn-gold w-full mt-4">
    S'abonner
  </button>
</div>
```

---

## 🤖 AI Features (Ti-Guy)

### OpenAI Integration

**Environment Variable**: `VITE_OPENAI_API_KEY`

#### 1. Ti-Guy Artiste (Image Generation)

```typescript
import { generateImage } from '../services/openaiService';

const imageUrl = await generateImage(
  'Une poutine géante dans le Vieux-Montréal',
  'realistic'
);
```

- **Model**: DALL-E 3
- **Demo Mode**: Returns placeholder if no API key

#### 2. Ti-Guy Studio (Video Captions)

```typescript
import { generateCaptions } from '../services/videoService';

const captions = await generateCaptions(videoUrl);
```

- **Model**: GPT-4
- **Output**: Captions in Joual

#### 3. Ti-Guy Assistant (Chat)

```typescript
import { generateCaption, generateHashtags } from '../services/openaiService';

const caption = await generateCaption(imageDescription);
const hashtags = await generateHashtags(caption);
```

- **Model**: GPT-4
- **System Prompt**: See `TI_GUY_PROMPTS` in `quebecFeatures.ts`

### Best Practices

1. **Always check API key exists** before calls
2. **Provide demo/fallback modes** when unavailable
3. **Include Joual context** in system prompts
4. **Handle rate limits gracefully**
5. **Log API usage** (console.log in dev)

---

## 💳 Payments (Stripe)

**Environment Variable**: `VITE_STRIPE_PUBLIC_KEY`

### Service: `src/services/stripeService.ts`

```typescript
import { subscribeToPremium, purchaseMarketplaceItem } from '../services/stripeService';

// Subscribe to VIP tier
await subscribeToPremium('gold');

// Purchase item
await purchaseMarketplaceItem(productId, 49.99);
```

### Subscription Tiers

```typescript
bronze: { price: 4.99, features: [...] }
silver: { price: 9.99, features: [...] }
gold:   { price: 19.99, features: [...] }
```

### Demo Mode

When no Stripe key:
- Shows toast notifications simulating success
- Updates database locally (no real payment)
- Useful for development

**Best Practices**:
1. Check if Stripe initialized before operations
2. Clear demo mode indicators to users
3. Handle payment errors gracefully
4. Never expose secret keys (client-side only uses publishable keys)

---

## 🗄️ Database (Supabase)

**Environment Variables**:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Core Tables

```sql
users           # User profiles (username, avatar, bio, region)
posts           # User posts (caption, media_url, fire_count)
comments        # Post comments
stories         # 24h ephemeral content
```

### Feature Tables

See migrations in `supabase/migrations/`:
- `001_moderation_system.sql` - Content reports/reviews
- `002_achievements.sql` - Gamification
- `003_creator_subscriptions.sql` - Creator revenue
- `004_live_streaming.sql` - Live streams
- `005_daily_challenges.sql` - Daily quests
- `006_marketplace.sql` - E-commerce
- `007_email_system.sql` - Email campaigns

### Supabase Client Usage

```typescript
import { supabase } from '../lib/supabase';

// Query with join
const { data, error } = await supabase
  .from('posts')
  .select('*, users(*)')
  .order('created_at', { ascending: false })
  .limit(20);

// Insert
const { error } = await supabase
  .from('posts')
  .insert({ user_id, caption, media_url });

// Update
const { error } = await supabase
  .from('posts')
  .update({ fire_count: newCount })
  .eq('id', postId);

// Delete
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId);
```

**Best Practices**:
1. Use TypeScript types from `src/types/database.ts`
2. Always handle errors from operations
3. Use RLS (Row Level Security) for data protection
4. Optimize queries with indexes and selective `select()`
5. Batch operations when possible

---

## 🔄 Development Workflow

### Before Starting

1. **Read existing code** - understand patterns before adding features
2. **Check documentation** - README, DESIGN_SYSTEM, this file
3. **Review Quebec features** - consult `quebecFeatures.ts` for Joual

### Making Changes

```bash
# 1. Start dev server
npm run dev

# 2. Make changes (TypeScript, React, etc.)

# 3. Type check (should pass)
npm run type-check

# 4. Test in browser
# - No console errors
# - UI looks correct (desktop + mobile)
# - Feature works as expected
# - Error states handled

# 5. Build (should succeed)
npm run build
```

### Git Workflow

**IMPORTANT**: Always work on the designated branch:

```bash
# Current branch
claude/claude-md-mijhijw21bbh26vh-01P5geG8qzMw8HEKchAKckP9

# Before committing
git status                    # Check changes
git add .                     # Stage changes

# Commit with descriptive message
git commit -m "feat: add Ti-Guy voice settings"
git commit -m "fix: resolve video autoplay issue"
git commit -m "refactor: centralize BottomNav component"

# Push to designated branch
git push -u origin claude/claude-md-mijhijw21bbh26vh-01P5geG8qzMw8HEKchAKckP9
```

**Commit Message Format**:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `style:` - Design/CSS changes
- `chore:` - Maintenance

**Retry Logic for Network Issues**:
If push/fetch fails due to network errors, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s).

### Creating Pull Requests

When ready for PR:

```bash
# Ensure all changes committed and pushed
git status

# Create PR to main branch
# Include:
# - Clear title describing changes
# - Summary of what changed and why
# - Test plan (how to verify changes)
# - Screenshots if UI changes
```

---

## ✅ Best Practices Checklist

### General

- [ ] Read existing code before adding features
- [ ] Keep changes minimal - don't refactor unrelated code
- [ ] Test locally before committing
- [ ] Use TypeScript - avoid `any`
- [ ] Handle errors with try-catch
- [ ] Provide fallbacks for external services

### Quebec Culture

- [ ] Use authentic Joual (check `quebecFeatures.ts`)
- [ ] Respect Quebec culture - no stereotypes
- [ ] Reference real Quebec places/events
- [ ] Use Quebec-relevant emojis (⚜️🇨🇦🍁🦫)
- [ ] Consult Joual dictionary for UI text

### Performance

- [ ] Optimize images before upload
- [ ] Lazy load routes with `React.lazy()`
- [ ] Memoize expensive operations (`useMemo`, `useCallback`)
- [ ] Limit database queries - fetch only needed data
- [ ] Use pagination for lists

### Security

- [ ] Never expose secrets (use env variables)
- [ ] Validate user input
- [ ] Use Supabase RLS policies
- [ ] Check authentication before operations
- [ ] Rate limit API calls

### Accessibility

- [ ] Use semantic HTML
- [ ] Alt text for images
- [ ] Keyboard navigation support
- [ ] Color contrast WCAG AA (4.5:1)
- [ ] ARIA labels for screen readers

---

## 🚨 Common Pitfalls

### 1. Using Standard French Instead of Joual

❌ **Wrong**:
```typescript
<button>Suivre cet utilisateur</button>
```

✅ **Correct**:
```typescript
<button>Suivre</button>
```

### 2. Using React.FC (Deprecated)

❌ **Wrong**:
```typescript
const Profile: React.FC<ProfileProps> = ({ user }) => {
  // ...
}
```

✅ **Correct**:
```typescript
function Profile({ user }: ProfileProps) {
  // ...
}
```

### 3. Forgetting Error Handling

❌ **Wrong**:
```typescript
const data = await supabase.from('posts').select();
```

✅ **Correct**:
```typescript
try {
  const { data, error } = await supabase.from('posts').select();
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Failed to fetch posts:', error);
  toast.error('Erreur en chargeant les posts');
  return [];
}
```

### 4. Not Checking API Keys

❌ **Wrong**:
```typescript
const result = await openai.generateImage(prompt);
```

✅ **Correct**:
```typescript
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.warn('OpenAI API key missing, using demo mode');
  return getDemoImage();
}
const result = await openai.generateImage(prompt);
```

### 5. Over-Engineering

❌ **Wrong**: Creating abstractions for one-time use
```typescript
// Don't create helpers for one-time operations
const createUserHelper = (data) => { /* complex abstraction */ }
```

✅ **Correct**: Keep it simple
```typescript
// Just do it directly if it's one-time
const { data, error } = await supabase.from('users').insert(userData);
```

---

## 📚 Additional Resources

### Project Documentation

- `README.md` - Project overview, features, quick start
- `SETUP_GUIDE.md` - Detailed setup instructions
- `DESIGN_SYSTEM.md` - Complete design system guide
- `.github/copilot-instructions.md` - Comprehensive coding standards

### Key Files to Reference

- `src/lib/quebecFeatures.ts` - Joual dictionary, Quebec data
- `src/services/openaiService.ts` - AI integration examples
- `src/services/stripeService.ts` - Payment integration examples
- `src/types/database.ts` - Database type definitions
- `src/index.css` - Design system CSS classes

### External Documentation

- [React 18](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Vite](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)
- [OpenAI](https://platform.openai.com/docs)

---

## 🎯 Quick Start for AI Assistants

### When You First Start

1. **Read this file** (CLAUDE.md) - understand project context
2. **Review `quebecFeatures.ts`** - learn Joual and Quebec data
3. **Scan `DESIGN_SYSTEM.md`** - understand design language
4. **Check recent commits** - see coding patterns
5. **Read relevant code** - before making changes

### When Making Changes

1. **Understand the feature** - what are you building/fixing?
2. **Find similar code** - how is it done elsewhere?
3. **Use Joual** - check dictionary for UI text
4. **Follow patterns** - match existing code style
5. **Test thoroughly** - type-check, build, manual testing
6. **Commit & push** - clear messages, designated branch

### When Stuck

1. **Check documentation** - README, DESIGN_SYSTEM, copilot-instructions
2. **Review similar features** - find patterns in codebase
3. **Verify environment** - are API keys set?
4. **Check console** - what errors appear?
5. **Ask user** - if unclear about Quebec culture or requirements

---

## 🔥 Final Notes

### Project Philosophy

Zyeuté is **Quebec-first** in everything:
- Language (Joual, not standard French)
- Culture (real Quebec references)
- Design (luxury meets heritage)
- Community (built for Quebecers)

### Development Principles

1. **Keep it simple** - avoid over-engineering
2. **Be authentic** - genuine Joual, real Quebec culture
3. **Focus on UX** - premium feel, smooth interactions
4. **Handle errors** - graceful fallbacks, clear messages
5. **Test thoroughly** - type-check, build, manual QA

### Success Criteria

✅ **Good Code**:
- Uses TypeScript properly (no `any`)
- Follows React best practices (functional components, hooks)
- Handles errors gracefully
- Uses authentic Joual
- Matches design system
- Tests pass (type-check, build)

---

**Bienvenue à Zyeuté! Let's build something tiguidou together!** 🔥⚜️

*Made with ❤️ in Quebec* 🇨🇦

*Propulsé par Nano Banana* 🍌

