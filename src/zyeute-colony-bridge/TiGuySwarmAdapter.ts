import OpenAI from 'openai';
import { colonyClient } from './ColonyClient';
import { BeeType, SwarmResponse } from './types';

// System prompt defining Ti-Guy's persona and Joual dialect
const TI_GUY_SYSTEM_PROMPT = `
You are Ti-Guy, a helpful AI assistant for the Zyeuté social platform.
You speak primarily in 'Joual' (Quebec French slang), but you are polite and helpful.
You are the Orchestrator of the 'Colony OS' swarm.
If a user asks for something complex (finance, security, translation), you can handle it yourself OR delegate it to a specialized Bee.
Current context: User is on Zyeuté.
`;

export class TiGuySwarmAdapter {
  private deepseek: OpenAI;

  constructor() {
    // Initialize DeepSeek V3 client (OpenAI compatible)
    this.deepseek = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
      dangerouslyAllowBrowser: true // For client-side demo; use proxy in prod
    });
  }

  /**
   * Analyzes prompt to determine if specialized bees are needed.
   */
  private analyzeIntent(prompt: string): BeeType | null {
    const p = prompt.toLowerCase();
    
    // Explicit triggers for specialized bees
    if (p.includes('revenue') || p.includes('stripe') || p.includes('facture')) return 'finance';
    if (p.includes('security') || p.includes('hack') || p.includes('ban')) return 'security';
    if (p.includes('joual') || p.includes('traduction') || p.includes('expression')) return 'joual';
    if (p.includes('poutine') || p.includes('recette') || p.includes('restaurant')) return 'poutine';
    if (p.includes('hockey') || p.includes('canadiens') || p.includes('score')) return 'hockey';
    
    return null; // No special bee needed, Ti-Guy handles it
  }

  /**
   * Main entry point for the Chat UI
   */
  async handleMessage(
    prompt: string, 
    history: { role: 'user' | 'assistant', content: string }[] = [],
    onProgress?: (msg: string) => void
  ): Promise<SwarmResponse> {
    
    const targetBee = this.analyzeIntent(prompt);

    // 1. SWARM MODE: If a specialized bee is needed
    if (targetBee) {
      if (onProgress) onProgress(`🐝 Ti-Guy appelle l'agent ${targetBee.toUpperCase()}...`);
      
      // Submit to Colony OS
      const taskId = await colonyClient.submitTask({
        description: prompt,
        beeType: targetBee,
        priority: 'high'
      });

      if (taskId) {
        return new Promise((resolve) => {
          const subscription = colonyClient.subscribeToTask(taskId, (status, result) => {
            if (status === 'running' && onProgress) {
              onProgress(`🐝 L'agent ${targetBee} travaille là-dessus...`);
            }
            
            if (status === 'done') {
              subscription.unsubscribe();
              resolve({
                bee: {
                  id: `bee-${targetBee}-${Date.now()}`,
                  type: targetBee,
                  name: `${targetBee.charAt(0).toUpperCase() + targetBee.slice(1)}Bee`,
                  status: 'idle',
                  specialty: targetBee
                },
                content: result || "Tâche complétée.",
                confidence: 1.0
              });
            }
          });
        });
      }
      // If task submission fails, fall back to Standard Ti-Guy
    }

    // 2. STANDARD MODE: Ti-Guy (DeepSeek V3) handles it
    const response = await this.callDeepSeek(prompt, history);
    
    return {
      bee: {
        id: 'ti-guy-main',
        type: 'joual',
        name: 'Ti-Guy',
        status: 'working',
        specialty: 'General Assistant'
      },
      content: response,
      confidence: 0.95
    };
  }

  /**
   * Calls DeepSeek V3 API
   */
  private async callDeepSeek(
    prompt: string, 
    history: { role: 'user' | 'assistant', content: string }[]
  ): Promise<string> {
    try {
      const messages = [
        { role: 'system', content: TI_GUY_SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: prompt }
      ] as any;

      const completion = await this.deepseek.chat.completions.create({
        messages: messages,
        model: 'deepseek-chat', // DeepSeek V3
        temperature: 1.3, // Higher for creative Joual flair
        max_tokens: 1024
      });

      return completion.choices[0].message.content || "Désolé, j'ai perdu le fil.";
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      return "Oups, mes circuits sont gelés. Réessaie plus tard!";
    }
  }
}

export const tiGuySwarm = new TiGuySwarmAdapter();
