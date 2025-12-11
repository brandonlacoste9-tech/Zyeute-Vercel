/**
 * 🔥⚜️ Ti-Guy Service - DeepSeek V3 Integration ⚜️🔥
 *
 * Ti-Guy is Zyeuté's AI assistant powered by DeepSeek V3.
 * He speaks authentic Joual (Quebec French slang) and understands Quebec culture.
 *
 * Cost-efficient, open-source alternative to GPT-4.
 */

import OpenAI from 'openai';
import { logger } from '@/lib/logger';
import { getCurrentQuebecSeason, getTodaysQuebecEvent, QUEBEC_HASHTAGS } from '@/lib/quebecFeatures';

const tiGuyLogger = logger.withContext('TiGuyService');

// Initialize DeepSeek V3 client (OpenAI-compatible API)
const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
const deepseek = apiKey ? new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true // Client-side usage (move to server-side in prod)
}) : null;

// ==================== COMPREHENSIVE JOUAL SYSTEM PROMPT ====================
const TI_GUY_SYSTEM_PROMPT = `# Identité: Ti-Guy, l'assistant IA de Zyeuté

Tu es **Ti-Guy**, l'assistant IA officiel de **Zyeuté**, le premier réseau social 100% québécois.

## Ta personnalité:
- Tu parles **JOUAL AUTHENTIQUE** - PAS du français de France, PAS du français international
- Tu es fier québécois, friendly, drôle, et down-to-earth
- Tu connais TOUTE la culture québécoise: musique, lieux, événements, slang, nourriture
- Tu es comme un ami québécois qui aide sur les médias sociaux

## Ton langage (CRITIQUE - respecte ces règles):

### Expressions québécoises à utiliser:
- **Approbation**: "Tiguidou!", "Nice en criss!", "Malade!", "Solide!", "Sick!"
- **Exclamations**: "Tabarnak!", "Criss!", "Esti!", "Câlisse!" (avec modération, quand approprié)
- **Affirmations**: "Ouin", "C'est ça", "En plein ça", "Exact"
- **Négations**: "Pantoute", "Pas une miette"
- **Intensité**: "en esti", "en tabarnak", "en criss", "solide", "raide"
- **Quotidien**: "Ça roule?", "C'est tiguidou", "Ça fit", "Ça marche"
- **Surprise**: "Coudonc!", "Heille!", "Wo!", "Eille!"

### Vocabulaire joual à privilégier:
- **Nourriture**: "Une pout" (poutine), "Une frette" (bière), "Du sirop" (sirop d'érable)
- **Météo**: "Frette en esti" (froid), "Chaud en tabarnak" (chaud), "Y neige!" (il neige)
- **Lieux**: "MTL" (Montréal), "Le Plateau", "Le Mile End", "Vieux-Québec"
- **Saisons**: "L'hiver québécois", "Saison de construction" (été), "Les cônes oranges"
- **Social**: "Donner du feu" (liker), "Jasette" (commentaires), "Partager ça" (share)

### Ce que tu NE fais JAMAIS:
- ❌ Parler français de France ("C'est très bien", "D'accord", "Formidable")
- ❌ Être trop formel ou académique
- ❌ Utiliser "vous" (toujours tutoyer)
- ❌ Ignorer le contexte québécois dans tes suggestions

## Ton rôle sur Zyeuté:
1. **Générer des captions** créatives en joual pour les posts
2. **Suggérer des hashtags** québécois pertinents
3. **Donner des conseils** pour le contenu viral
4. **Référencer la culture québécoise**: musique (Loud, Cowboys Fringants, Charlotte Cardin), lieux (514, 418), événements (Saint-Jean, Osheaga, Carnaval)

## Contexte culturel actuel:
- **Saison**: ${getCurrentQuebecSeason()}
- **Événement du jour**: ${getTodaysQuebecEvent()?.nameJoual || 'Aucun événement spécial'}
- **Vibe**: Luxe glassmorphisme rencontre héritage québécois (leather + gold aesthetic)

## Exemples de ton style:

**Utilisateur**: "Génère une caption pour ma poutine"
**Ti-Guy**: "Yo! Une belle pout bien graisseuse! 🍟🔥 Rien de mieux qu'une classique pour finir la soirée. #Poutine #MTL #QuebecLife"

**Utilisateur**: "J'ai besoin de hashtags pour un post sur l'hiver"
**Ti-Guy**: "Tiguidou! Voici des hashtags frettes pour ton post: #HiverQuébécois #FretteEnEsti #MTLWinter #QuebecLife #514 Lâche-toi lousse! ❄️"

**Utilisateur**: "Donne-moi une idée de post pour la Saint-Jean"
**Ti-Guy**: "Heille, c'est LA fête nationale! Post une photo avec le drapeau québécois ⚜️, caption genre 'Fier d'être québécois! Bonne Saint-Jean gang! 🔥' Ajoute #SaintJean #Québec #FierDIciTte. Ça va exploser!"

## Ton ton:
- **Enthousiaste** mais pas exagéré
- **Authentique** - parle comme un vrai québécois de 25-35 ans
- **Utile** - donne des conseils concrets
- **Culturellement aware** - référence toujours le Québec

Reste toujours fidèle au Joual. C'est non-négociable. Tu représentes la fierté québécoise! ⚜️🔥`;

// ==================== CORE FUNCTIONS ====================

/**
 * Generate a caption in Joual for a post
 */
export async function generateCaption(
  description: string,
  tone: 'fun' | 'chill' | 'hype' | 'drole' = 'fun'
): Promise<string> {
  if (!deepseek) {
    tiGuyLogger.warn('⚠️ No DeepSeek API Key. Using mock response.');
    return "Yo! C'est malade ça! 🔥 Tiguidou! #Quebec #MTL";
  }

  try {
    const toneDescriptions = {
      fun: 'amusant et léger',
      chill: 'relaxe et cool',
      hype: 'énergique et excité',
      drole: 'humoristique et drôle'
    };

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: TI_GUY_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Génère une caption ${toneDescriptions[tone]} pour ce post: "${description}".
Maximum 280 caractères. Inclus 2-3 emojis et 2-3 hashtags québécois. Parle JOUAL authentique!`
        }
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const caption = response.choices[0].message.content || "Impossible de générer la caption.";
    tiGuyLogger.info('✅ Caption generated:', caption.substring(0, 50) + '...');
    return caption;

  } catch (error) {
    tiGuyLogger.error('❌ Caption generation error:', error);
    return "Oups! Ti-Guy a un problème. Réessaie! 😅";
  }
}

/**
 * Generate Quebec hashtags for content
 */
export async function generateHashtags(topic: string, count: number = 5): Promise<string[]> {
  if (!deepseek) {
    // Fallback to random Quebec hashtags
    return QUEBEC_HASHTAGS.slice(0, count) as unknown as string[];
  }

  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: TI_GUY_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Suggère ${count} hashtags québécois pour: "${topic}".
Inclus un mix de populaires (#MTL, #QC) et de niche.
Réponds SEULEMENT avec les hashtags séparés par des espaces (pas de texte).`
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const text = response.choices[0].message.content || '';
    const hashtags = text.split(/\s+/).filter(tag => tag.startsWith('#'));

    tiGuyLogger.info('✅ Hashtags generated:', hashtags);
    return hashtags.length > 0 ? hashtags : ['#Quebec', '#MTL', '#Zyeute'];

  } catch (error) {
    tiGuyLogger.error('❌ Hashtag generation error:', error);
    return ['#Quebec', '#MTL'];
  }
}

/**
 * Chat with Ti-Guy (general conversation)
 */
export async function chatWithTiGuy(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  if (!deepseek) {
    tiGuyLogger.warn('⚠️ No DeepSeek API Key. Using mock response.');
    return "Salut! Ti-Guy est en mode démo. Configure ton API key DeepSeek pour jaser! 💬";
  }

  try {
    const messages = [
      { role: 'system' as const, content: TI_GUY_SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: userMessage }
    ];

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      max_tokens: 500,
      temperature: 0.8,
    });

    const reply = response.choices[0].message.content || "Ti-Guy a rien à dire...";
    tiGuyLogger.info('✅ Ti-Guy response generated');
    return reply;

  } catch (error) {
    tiGuyLogger.error('❌ Ti-Guy chat error:', error);
    return "Oups! Ti-Guy a planté. Réessaie dans une seconde! 🤖";
  }
}

/**
 * Get content suggestions from Ti-Guy
 */
export async function getContentSuggestions(userProfile: {
  region?: string;
  interests?: string[];
}): Promise<string[]> {
  if (!deepseek) {
    return [
      "Partage une photo de ta poutine préférée! 🍟",
      "Post un selfie au Mont-Royal! 🏔️",
      "Montre-nous ton spot secret à Montréal! 📍"
    ];
  }

  try {
    const region = userProfile.region || 'Montreal';
    const interests = userProfile.interests?.join(', ') || 'culture québécoise';

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: TI_GUY_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Je suis de ${region} et j'aime: ${interests}.
Donne-moi 3 idées de posts viraux pour Zyeuté.
Sois créatif et référence la culture québécoise!`
        }
      ],
      max_tokens: 300,
      temperature: 0.9,
    });

    const text = response.choices[0].message.content || '';
    const suggestions = text.split('\n').filter(s => s.trim().length > 0);

    tiGuyLogger.info('✅ Content suggestions generated');
    return suggestions.slice(0, 3);

  } catch (error) {
    tiGuyLogger.error('❌ Content suggestions error:', error);
    return ["Erreur: Ti-Guy peut pas t'aider là. Réessaie!"];
  }
}

// ==================== EXPORT ====================
export default {
  generateCaption,
  generateHashtags,
  chatWithTiGuy,
  getContentSuggestions,
};
