/**
 * 🐝 JoualBee - Local Joual Pattern Fallback
 * 
 * When DeepSeek is unavailable (circuit open), JoualBee provides instant
 * responses using pattern-based Quebec French (Joual) generation.
 * 
 * Zero API cost, zero latency fallback for degraded service.
 * Stays true to Quebec culture even when clouds fail.
 */

import { logger } from '@/lib/logger';

const joualLogger = logger.withContext('JoualBee');

// Quebec-specific greeting patterns
const GREETINGS = [
  "Yo! Ça va?",
  "Allô! Quoi de neuf?",
  "Hé! Comment ça roule?",
  "Yo! T'es où?",
  "Salut! Ça va bien?"
];

// Common Joual phrases for different intents
const JOUAL_PATTERNS: Record<string, string[]> = {
  greeting: [
    "Yo! Comment ça va?",
    "Allô! Ça va bien?",
    "Quoi de neuf?",
    "Yo, mon ami!"
  ],
  thanks: [
    "Pas de problème, mon ami!",
    "C'est correct, content de pouvoir aider!",
    "De rien, y'a pas de quoi!",
    "C'est mon plaisir!"
  ],
  affirmative: [
    "Oui oui, 100%!",
    "Yup, certain!",
    "Absolument, mon gars!",
    "Ben oui, voyons!",
    "C'est ça, oui!"
  ],
  negative: [
    "Non non, pas du tout.",
    "Nope, c'est pas ça.",
    "Meh, pas vraiment.",
    "Ben non, tu sais.",
    "Là, non, pas vraiment."
  ],
  poutine: [
    "Ah man, une bonne poutine du Parc La Fontaine, ça tu peux pas battre!",
    "Une poutine bien chaud avec de la sauce brune? C'est du pure gold.",
    "Les fries bien croustillantes, le fromage qui dégouline, c'est ça l'vrai vivre!",
    "Une vraie poutine québécoise, mon ami, c'est pas pareil des autres."
  ],
  hockey: [
    "Les Canadiens! Même quand ils perdent, on les aime, tu sais.",
    "Hockey sur glace, c'est le sport du Québec, man. C'est dans notre sang.",
    "Une bonne game en hiver, avec des amis, une bière frette... c'est ça la vie!",
    "Les Habs, les Habs! C'est notre histoire, notre fierté!"
  ],
  stjohn: [
    "La Saint-Jean, c'est THE party, ami! Tout le Québec dans les rues!",
    "Le 24 juin, c'est notre fête! Fleur de lys en couleur!",
    "Saint-Jean, c'est l'party, c'est la musique, c'est l'fierté québécoise!",
    "T'es pas au Québec si tu as pas été à une Saint-Jean!"
  ],
  weather: [
    "C'est fret en tabernac aujourd'hui! Vas-tu chercher ton manteau?",
    "Du beau soleil! Parfait pour une sortie dehors!",
    "Il pleut à seau! C'est un bon jour pour rester chez nous.",
    "L'hiver c'est froid mais on aime ça!"
  ],
  montreal: [
    "Montréal, c'est la plus grande ville du Québec, man!",
    "Le Plateau, Griffintown, le Vieux-Mont... Montréal c'est tellement cool!",
    "Y'a rien comme Montréal en été sur le Mont-Royal!",
    "Montréal c'est multiculturel, c'est vibrant, c'est chez nous!"
  ]
};

interface JoualBeeResponse {
  content: string;
  isLocal: boolean;
  confidence: number;
  generatedAt: Date;
}

export class JoualBee {
  /**
   * Analyzes input to find matching Joual pattern
   */
  private detectIntent(input: string): string {
    const lower = input.toLowerCase();

    if (/poutine|fries|gravy|fromage/i.test(lower)) return 'poutine';
    if (/hockey|canadiens|habs|game|score/i.test(lower)) return 'hockey';
    if (/saint-jean|24 juin|fête|québécoise/i.test(lower)) return 'stjohan';
    if (/merci|thanks|thx|merci/i.test(lower)) return 'thanks';
    if (/oui|yes|yup|ouais/i.test(lower)) return 'affirmative';
    if (/non|nope|nah|non/i.test(lower)) return 'negative';
    if (/montréal|mont-royal|plateau|vieux|griffintown/i.test(lower)) return 'montreal';
    if (/froid|neige|hiver|été|soleil|pluie|météo/i.test(lower)) return 'weather';
    if (/bonjour|salut|allo|yo|hey/i.test(lower)) return 'greeting';

    return 'greeting'; // Default to greeting if no match
  }

  /**
   * Get random item from array
   */
  private getRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Expand a pattern with Joual flavor
   */
  private expandPattern(pattern: string): string {
    const expansions: Record<string, string[]> = {
      '{exclamation}': ['Yo', 'Hé', 'Allô', 'Mon ami', 'Tu sais'],
      '{emphasis}': ['tu sais', 'mon gars', 'mon ami', 'vraiment', 'pour vrai'],
      '{interjection}': ['tbh', 'franchement', 'sérieusement', 'c\'est vrai', 'moé']
    };

    let result = pattern;
    Object.entries(expansions).forEach(([key, values]) => {
      result = result.replace(key, this.getRandom(values));
    });

    return result;
  }

  /**
   * Generate a Joual response from patterns
   */
  generateResponse(input: string): JoualBeeResponse {
    try {
      const intent = this.detectIntent(input);
      const patterns = JOUAL_PATTERNS[intent] || JOUAL_PATTERNS.greeting;
      const response = this.getRandom(patterns);

      joualLogger.info(`Generated local response for intent: ${intent}`);

      return {
        content: response,
        isLocal: true,
        confidence: 0.75, // Lower confidence than API calls
        generatedAt: new Date()
      };
    } catch (error) {
      joualLogger.error(`Error generating response: ${error}`);
      return {
        content: "Yo, désolé! Mes circuits sont un peu gelés là. Réessaie tantôt!",
        isLocal: true,
        confidence: 0.5,
        generatedAt: new Date()
      };
    }
  }

  /**
   * Generate captions in Joual (for posts)
   */
  generateCaption(topic: string, tone: 'fun' | 'chill' | 'hype' | 'drole' = 'fun'): string {
    const captions: Record<string, Record<string, string[]>> = {
      fun: {
        general: [
          "Yo! Regarde ça! 🔥",
          "Haha, trop cool! 😎",
          "Yo man, check ça out! 🤷‍♂️",
          "C'est fou! T'aimes tu ça? 💯"
        ],
        food: [
          "Une poutine pour les champions! 🍟",
          "Ça c'est du manger! 🤤",
          "Yo! La bouffe du Québec c'est ça! 🍽️",
          "Un bon repas, y'a rien de mieux! 👨‍🍳"
        ]
      },
      chill: {
        general: [
          "Juste un beau moment, tu sais?",
          "Ça, c'est la vie qu'on aime.",
          "Cool et relax, exactement comme on l'aime.",
          "Un jour parfait pour checker ça."
        ],
        food: [
          "Une bonne bouffe tranquille.",
          "Manger bien, c'est comme méditer.",
          "Y'a pas plus zen que ça.",
          "Juste profiter de l'moment."
        ]
      },
      hype: {
        general: [
          "YOOOOO! C'EST FOU! 🔥🔥🔥",
          "OMG! CHECK ÇA! 🚀",
          "TROP MALADE! 🎉",
          "C'EST THE BEST! 💪"
        ],
        food: [
          "LA MEILLEURE POUTINE EVER! 🍟🔥",
          "BOUFFE DE DIEU! 🙏",
          "C'EST INSANE! 🤯",
          "GOÛTE ÇA! T'VAS DEVENIR FOU! 😻"
        ]
      },
      drole: {
        general: [
          "Haha check ça, tu vas rire! 😂",
          "C'est tellement drôle, tu sais?",
          "J'ai pas pu me retenir de rire! 😹",
          "Ça va te plaire, c'est le fun! 🤣"
        ],
        food: [
          "La poutine qui gronde mon estomac! 😂",
          "Du manger tellement bon que tu vas virer fou! 🤪",
          "Oublie ta diète, c'est l'moment! 😆",
          "Ça fait rire mon ventre tellement c'est bon! 😋"
        ]
      }
    };

    const isFood = /poutine|manger|bouffe|food|resto|restaurant/i.test(topic);
    const category = isFood ? 'food' : 'general';
    const options = captions[tone]?.[category] || captions.fun.general;

    return this.getRandom(options);
  }

  /**
   * Generate Quebec-themed hashtags
   */
  generateHashtags(topic: string, count: number = 5): string[] {
    const allTags = [
      '#YoQuébec', '#Joual', '#TiGuy',
      '#Montréal', '#Québec', '#QuebeAtHome',
      '#Poutine', '#SaintJean', '#CanadieNS',
      '#Montreal', '#QcLife', '#ViveLabeauProvinceQuébécoise',
      '#Zyeuté', '#LaMtl', '#TrueQuébécois'
    ];

    // Filter by topic if applicable
    if (/poutine/i.test(topic)) allTags.push('#PoutineLife', '#FriesForLife');
    if (/hockey/i.test(topic)) allTags.push('#GoHabs', '#HockeyLife');
    if (/mont-royal|montréal/i.test(topic)) allTags.push('#MontRoyalVibes', '#TheMtl');

    // Shuffle and take `count` items
    return allTags.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}

// Singleton instance
export const joualBee = new JoualBee();
