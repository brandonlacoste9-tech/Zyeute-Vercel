/**
 * Netlify Function: Stripe Webhook Handler
 * Handles Stripe webhook events for subscription management
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async (event, context) => {
  const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];

  if (!signature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing signature' }),
    };
  }

  try {
    const event = stripe.webhooks.constructEvent(event.body, signature, webhookSecret);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier;
      const subscriptionId = session.subscription;

      if (!userId || !tier || !subscriptionId) {
        console.error('Missing required metadata:', { userId, tier, subscriptionId });
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing metadata' }),
        };
      }

      // Get subscription period from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      // Update user profile with subscription info
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          subscription_tier: tier,
          is_premium: true,
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating user_profiles:', profileError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Error updating profile' }),
        };
      }

      // Also try to create subscription record in subscriptions table (for tracking)
      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          subscriber_id: userId,
          creator_id: userId, // Self-subscription for premium tiers
          status: 'active',
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
        }, {
          onConflict: 'stripe_subscription_id',
        });

      if (subError) {
        console.warn('Note: Could not create subscription record:', subError);
        // This is OK - the main update is to user_profiles which succeeded
      }

      console.log(`Subscription activated for user ${userId}: ${tier}`);
    }

    // Handle subscription updates
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      const tier = subscription.metadata?.tier;

      if (userId && tier) {
        const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'canceled',
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
          })
          .eq('stripe_subscription_id', subscription.id);
      }
    }

    // Handle subscription cancellations
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        await supabaseAdmin
          .from('user_profiles')
          .update({
            subscription_tier: null,
            is_premium: false,
          })
          .eq('id', userId);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${error.message}` }),
    };
  }
};

