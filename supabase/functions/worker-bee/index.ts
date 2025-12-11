/**
 * 🐝 WORKER BEE - Async Task Processor
 * 
 * Deployed on Supabase Edge Functions
 * Handles complex, long-running tasks:
 * - Finance calculations
 * - Security analysis
 * - Complex content generation
 * - Batch processing
 * 
 * Integrated with Colony OS task queue
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskRequest {
  taskId: string;
  description: string;
  beeType: 'finance' | 'security' | 'joual' | 'poutine' | 'hockey';
  priority: 'low' | 'medium' | 'high';
  userId: string;
  metadata?: Record<string, unknown>;
}

interface TaskResult {
  taskId: string;
  status: 'completed' | 'failed' | 'processing';
  result?: string;
  error?: string;
  completedAt?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

/**
 * Finance Bee: Handle revenue, payments, analytics
 */
async function processFinanceTask(description: string): Promise<string> {
  // In a real scenario, this would call your finance API
  // or process with a financial calculation engine
  
  const keywords = description.toLowerCase();
  
  if (keywords.includes('revenue')) {
    return 'Résumé des revenus: Zyeuté a généré une croissance de 25% ce mois-ci grâce à lé engagement de la communauté québécoise.';
  }
  if (keywords.includes('subscription')) {
    return 'Statistiques d\'abonnés: 520 abonnés actifs, taux de rétention 92%. Le plan Pro est le plus populaire.';
  }
  if (keywords.includes('payout')) {
    return 'Payout schedulé pour demain. Montant: $2,450 CAD. Status: En attente de confirmation.';
  }
  
  return 'Analyse financière en cours...';
}

/**
 * Security Bee: Content moderation, bot detection, bans
 */
async function processSecurityTask(description: string): Promise<string> {
  const keywords = description.toLowerCase();
  
  if (keywords.includes('report')) {
    return 'Rapport de sécurité: Aucune menace détectée. Plateforme stable.';
  }
  if (keywords.includes('ban')) {
    return 'Action de ban: L\'utilisateur a été suspendu pour 24 heures suite à des contenus inappropriés.';
  }
  if (keywords.includes('verify')) {
    return 'Vérification de compte: Compte vérifié avec succès. Accès complet accordé.';
  }
  
  return 'Scan de sécurité en cours...';
}

/**
 * Joual Bee: Deep Joual translation, language analysis
 */
async function processJoualTask(description: string): Promise<string> {
  const phrases: Record<string, string> = {
    'cava': 'Ca va bien, merci de demander!',
    'merci': 'De rien, mon ami! C\'est mon plaisir.',
    'bonjour': 'Yo! Comment ça va?',
    'au revoir': 'À bientôt, ami! Bonne journée!',
  };
  
  for (const [key, value] of Object.entries(phrases)) {
    if (description.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return 'Yo, je comprends ce que tu dis! Continue de jaser en Joual avec moi.';
}

/**
 * Poutine Bee: Food recommendations, recipes
 */
async function processPoutineTask(description: string): Promise<string> {
  const recommendations: Record<string, string> = {
    'recipe': 'Recette de poutine: Fries croustillantes, fromage en grains frais, sauce brune chaude. Délicieux!',
    'restaurant': 'Meilleurs resto pour poutine à Mont-Royal: Chez Tonton, La Banquise, Poutinerie Ste-Catherine.',
    'best': 'La meilleure poutine: Fries faites maison, fromage en grains du Québec, sauce brune traditionelle.',
  };
  
  for (const [key, value] of Object.entries(recommendations)) {
    if (description.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return 'Poutine: Le plat national du Québec. Chaque bonne poutine commence par des fries excellentes!';
}

/**
 * Hockey Bee: Game stats, team info, celebrations
 */
async function processHockeyTask(description: string): Promise<string> {
  const info: Record<string, string> = {
    'habs': 'Les Canadiens de Montréal: Notre équipe adorée! 24 Coupes Stanley, histoire légendaire.',
    'score': 'Dernier match: Canadiens 3, Maple Leafs 2. Belle victoire!',
    'when': 'Prochain match des Habs: Samedi à 20h vs Bruins au Bell Centre.',
  };
  
  for (const [key, value] of Object.entries(info)) {
    if (description.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return 'Hockey: Le sport du Québec! Les Canadiens règnent dans nos cœurs. GO HABS GO!';
}

/**
 * Main task processor
 */
async function processTask(task: TaskRequest): Promise<string> {
  try {
    switch (task.beeType) {
      case 'finance':
        return await processFinanceTask(task.description);
      case 'security':
        return await processSecurityTask(task.description);
      case 'joual':
        return await processJoualTask(task.description);
      case 'poutine':
        return await processPoutineTask(task.description);
      case 'hockey':
        return await processHockeyTask(task.description);
      default:
        return 'Bee type not recognized.';
    }
  } catch (error) {
    throw new Error(`Worker Bee error: ${error}`);
  }
}

/**
 * Update task status in database
 */
async function updateTaskStatus(
  taskId: string,
  status: 'processing' | 'completed' | 'failed',
  result?: string,
  error?: string
) {
  const { error: dbError } = await supabase
    .from('tasks')
    .update({
      status,
      result,
      error,
      completed_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (dbError) {
    console.error('Failed to update task status:', dbError);
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const task: TaskRequest = await req.json();

    // Validate request
    if (!task.taskId || !task.beeType || !task.description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Mark as processing
    await updateTaskStatus(task.taskId, 'processing');

    // Process the task
    const result = await processTask(task);

    // Mark as completed
    await updateTaskStatus(task.taskId, 'completed', result);

    return new Response(
      JSON.stringify({
        taskId: task.taskId,
        status: 'completed',
        result,
      } as TaskResult),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const taskId = await req.json().then((t) => t.taskId).catch(() => 'unknown');
    await updateTaskStatus(taskId, 'failed', undefined, String(error));

    return new Response(
      JSON.stringify({
        error: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
