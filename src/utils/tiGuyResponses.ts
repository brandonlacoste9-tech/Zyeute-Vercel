/**
 * TI-Guy Response Generator
 * Authentic Quebec French slang responses for TI-Guy chat
 */

import { ChatMessage } from '../types/chat';

// Quebec slang responses organized by intent
const TI_GUY_RESPONSES: Record<string, string[]> = {
  greeting: [
    "Allô! Moi c'est Ti-Guy, ton petit castor préféré! 🦫",
    "Salut mon ami! Comment ça va aujourd'hui? ⚜️",
    "Heille! Content de te jaser! 🇨🇦",
    "Salut la gang, comment ça va, tu feel-tu la vibe?",
    "Yo! Quossé qui se passe de beau, mon chum?",
    "Hé ben, bienvenue! Qu'est-ce que j'peux faire pour toé, mon loup?",
  ],
  help: [
    "Je peux t'aider à naviguer l'app! Pose-moi n'importe quelle question! 💡",
    "T'as besoin d'aide? Je suis là pour toi! 🦫",
    "Qu'est-ce que tu veux savoir? J'suis là pour t'aider!",
  ],
  upload: [
    "Pour uploader une photo ou vidéo, clique sur le + en bas! 📸",
    "Veux-tu créer du contenu? Va dans la section Upload! 🎥",
    "Pour poster quelque chose, va dans Upload et choisis ta photo ou vidéo!",
  ],
  fire: [
    "Les feux 🔥 c'est comme des likes, mais en plus hot! Plus t'en reçois, plus ton contenu est malade!",
    "Donne des feux aux posts que tu trouves sick! C'est notre système de rating! 🔥",
    "Les feux, c'est notre façon de dire qu'on aime ça en esti!",
  ],
  story: [
    "Les Stories disparaissent après 24 heures! Parfait pour du contenu éphémère! ⏰",
    "Crée une Story en cliquant sur ton avatar en haut du feed! ✨",
    "Les Stories, c'est pour partager des moments qui passent vite!",
  ],
  quebec: [
    "Zyeuté, c'est fait au Québec, pour le Québec! On célèbre notre culture! 🇨🇦⚜️",
    "Utilise des hashtags québécois comme #514 #450 #quebec #montreal! 🏔️",
    "Ah, le Québec, c'est l'meilleur place au monde! T'es-tu ben installé?",
    "Le Québec, c'est pas compliqué, c'est mon terrain de jeu!",
  ],
  gifts: [
    "Tu peux envoyer des cadeaux virtuels aux créateurs que tu aimes! 🎁",
    "Les cadeaux supportent nos créateurs québécois! C'est comme un tip! 💰",
    "Envoie un cadeau à tes créateurs préférés pour les supporter!",
  ],
  premium: [
    "Deviens VIP pour débloquer Ti-Guy Artiste et Studio! 👑",
    "Les membres Or ont accès à toutes mes fonctionnalités AI! ✨",
    "Upgrade-toi VIP pour avoir accès à toutes les features premium!",
  ],
  default: [
    "Hmm, je comprends pas trop... Peux-tu reformuler? 🤔",
    "Je suis un petit castor, pas Google! Essaie une autre question! 😅",
    "Désolé, j'ai pas compris! Je suis encore en train d'apprendre! 🦫",
    "Ah ben, je n'sais pas trop quoi dire, là. Répète-moé ça, s'tu plaît.",
    "Bof, j'suis pas sûr de comprendre ton affaire. Explique-moé ça, là.",
    "Hein? J'ai pas catché ça, p'tit. T'es-tu certain d'ton affaire?",
  ],
};

/**
 * Detects the intent from user message and returns appropriate response key
 */
const detectIntent = (message: string): string => {
  const lowerText = message.toLowerCase().trim();

  if (lowerText.includes('allo') || lowerText.includes('salut') || lowerText.includes('bonjour') || lowerText.includes('hi')) {
    return 'greeting';
  }
  if (lowerText.includes('upload') || lowerText.includes('poster') || lowerText.includes('publier') || lowerText.includes('créer')) {
    return 'upload';
  }
  if (lowerText.includes('feu') || lowerText.includes('fire') || lowerText.includes('like')) {
    return 'fire';
  }
  if (lowerText.includes('story') || lowerText.includes('histoire') || lowerText.includes('stories')) {
    return 'story';
  }
  if (lowerText.includes('québec') || lowerText.includes('quebec') || lowerText.includes('montréal') || lowerText.includes('montreal')) {
    return 'quebec';
  }
  if (lowerText.includes('cadeau') || lowerText.includes('gift') || lowerText.includes('tip') || lowerText.includes('donner')) {
    return 'gifts';
  }
  if (lowerText.includes('premium') || lowerText.includes('vip') || lowerText.includes('abonnement') || lowerText.includes('upgrade')) {
    return 'premium';
  }
  if (lowerText.includes('aide') || lowerText.includes('help') || lowerText.includes('comment') || lowerText.includes('comment ça marche')) {
    return 'help';
  }

  return 'default';
};

/**
 * Generates a TI-Guy response based on user message
 * @param userMessage The message from the user
 * @returns A ChatMessage from TI-Guy with Quebec slang
 */
export const getTiGuyResponse = (userMessage: string): ChatMessage => {
  const intent = detectIntent(userMessage);
  const responses = TI_GUY_RESPONSES[intent] || TI_GUY_RESPONSES.default;
  const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

  return {
    id: Date.now().toString(),
    sender: 'tiGuy',
    text: selectedResponse,
    timestamp: new Date(),
  };
};

