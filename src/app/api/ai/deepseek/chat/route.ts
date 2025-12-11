import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * DeepSeek V3 Chat API Endpoint
 * 
 * POST /api/ai/deepseek/chat
 * 
 * Body:
 * - messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>
 * - systemPrompt?: string (optional override)
 * - maxTokens?: number (default: 500)
 * - temperature?: number (default: 0.8)
 */

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'DeepSeek API key not configured',
          fallback: true,
          message: 'Service running in demo mode'
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { 
      messages, 
      systemPrompt,
      maxTokens = 500, 
      temperature = 0.8 
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    // Initialize DeepSeek client
    const deepseek = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    });

    // Prepare messages with optional system prompt override
    const finalMessages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
      : messages;

    // Call DeepSeek V3
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: finalMessages,
      max_tokens: maxTokens,
      temperature,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content,
      usage: response.usage,
      model: response.model,
    });

  } catch (error: any) {
    console.error('DeepSeek API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        message: error.message,
        fallback: true
      },
      { status: 500 }
    );
  }
}
