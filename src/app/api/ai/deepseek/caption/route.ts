import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * DeepSeek V3 Caption Generation API Endpoint
 * 
 * POST /api/ai/deepseek/caption
 * 
 * Body:
 * - description: string (what to generate caption for)
 * - tone?: 'fun' | 'chill' | 'hype' | 'drole' (default: 'fun')
 */

const TI_GUY_CAPTION_PROMPT = `Tu es Ti-Guy, l'assistant IA de Zyeuté qui parle joual authentique.
Génère des captions courtes (max 280 caractères) pour les posts en utilisant:
- Expressions québécoises: "Tiguidou!", "Nice en criss!", "Malade!", "En esti"
- Emojis pertinents (2-3)
- Hashtags québécois (2-3) comme #MTL, #QC, #Quebec
- Ton authentique et down-to-earth`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.VITE_DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          caption: "Yo! C'est malade ça! 🔥 Tiguidou! #Quebec #MTL",
          fallback: true 
        },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { description, tone = 'fun' } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'Invalid request: description required' },
        { status: 400 }
      );
    }

    const toneDescriptions = {
      fun: 'amusant et léger',
      chill: 'relaxe et cool',
      hype: 'énergique et excité',
      drole: 'humoristique et drôle'
    };

    // Initialize DeepSeek client
    const deepseek = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    });

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: TI_GUY_CAPTION_PROMPT },
        {
          role: 'user',
          content: `Génère une caption ${toneDescriptions[tone as keyof typeof toneDescriptions] || 'amusante'} pour: "${description}". Max 280 caractères.`
        }
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const caption = response.choices[0]?.message?.content || "Impossible de générer la caption.";

    return NextResponse.json({
      success: true,
      caption,
      tone,
      usage: response.usage,
    });

  } catch (error: any) {
    console.error('DeepSeek caption API error:', error);
    
    return NextResponse.json(
      { 
        caption: "Oups! Ti-Guy a un problème. Réessaie! 😅",
        error: error.message,
        fallback: true
      },
      { status: 200 }
    );
  }
}
