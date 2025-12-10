/**
 * 🔌 CIRCUIT BREAKER - Fault Tolerance for Swarm Operations
 * 
 * Protects against cascading failures:
 * - DeepSeek API timeouts → fallback to local JoualBee
 * - Flux.1 image failures → use cached/placeholder images
 * - Colony OS task queue overload → queue locally
 * 
 * States: CLOSED (healthy) → OPEN (failing) → HALF_OPEN (testing)
 */

import { logger } from '@/lib/logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close after HALF_OPEN
  timeout: number; // Milliseconds before timeout
  resetTimeout: number; // Milliseconds before attempting HALF_OPEN
}

interface CircuitBreakerMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastError: Error | null;
  lastErrorTime: Date | null;
  openedAt: Date | null;
  stateChanges: { state: CircuitState; timestamp: Date }[];
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private metrics: CircuitBreakerMetrics = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    lastError: null,
    lastErrorTime: null,
    openedAt: null,
    stateChanges: []
  };
  private config: CircuitBreakerConfig;
  private halfOpenAttempts = 0;
  private lastResetAttempt: number = 0;

  constructor(
    private name: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      successThreshold: config.successThreshold ?? 2,
      timeout: config.timeout ?? 5000,
      resetTimeout: config.resetTimeout ?? 30000
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T> | T
  ): Promise<T> {
    // Check if we should attempt reset from OPEN → HALF_OPEN
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastResetAttempt >= this.config.resetTimeout) {
        logger.info(`[CircuitBreaker:${this.name}] Attempting reset to HALF_OPEN`);
        this.transition('HALF_OPEN');
      } else if (fallback) {
        // Still open, use fallback
        logger.warn(`[CircuitBreaker:${this.name}] Circuit OPEN, using fallback`);
        try {
          return await Promise.resolve(fallback());
        } catch (err) {
          throw new Error(`Fallback also failed: ${err}`);
        }
      } else {
        throw new Error(`[CircuitBreaker:${this.name}] Circuit is OPEN`);
      }
    }

    // Execute with timeout
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Circuit breaker timeout')), this.config.timeout)
        )
      ]);

      // Success
      this.recordSuccess();
      return result;
    } catch (error) {
      // Failure
      this.recordFailure(error as Error);

      // If in HALF_OPEN, go back to OPEN
      if (this.state === 'HALF_OPEN') {
        this.transition('OPEN');
      }

      // Try fallback if available
      if (fallback) {
        logger.warn(`[CircuitBreaker:${this.name}] Call failed, using fallback`);
        try {
          return await Promise.resolve(fallback());
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      }

      throw error;
    }
  }

  private recordSuccess(): void {
    this.metrics.totalCalls++;
    this.metrics.successfulCalls++;

    if (this.state === 'HALF_OPEN') {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts >= this.config.successThreshold) {
        logger.info(`[CircuitBreaker:${this.name}] HALF_OPEN → CLOSED`);
        this.transition('CLOSED');
        this.halfOpenAttempts = 0;
      }
    }
  }

  private recordFailure(error: Error): void {
    this.metrics.totalCalls++;
    this.metrics.failedCalls++;
    this.metrics.lastError = error;
    this.metrics.lastErrorTime = new Date();

    if (this.state === 'CLOSED' && this.metrics.failedCalls >= this.config.failureThreshold) {
      logger.warn(
        `[CircuitBreaker:${this.name}] Failure threshold reached (${this.metrics.failedCalls}/${this.config.failureThreshold})`
      );
      this.transition('OPEN');
    }
  }

  private transition(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.lastResetAttempt = Date.now();

    if (newState === 'OPEN') {
      this.metrics.openedAt = new Date();
      this.metrics.failedCalls = 0; // Reset counter for next cycle
    }

    this.metrics.stateChanges.push({ state: newState, timestamp: new Date() });

    logger.info(`[CircuitBreaker:${this.name}] ${oldState} → ${newState}`);
  }

  // ===== Getters =====
  getState(): CircuitState {
    return this.state;
  }

  isHealthy(): boolean {
    return this.state === 'CLOSED';
  }

  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    logger.info(`[CircuitBreaker:${this.name}] Manual reset`);
    this.transition('CLOSED');
    this.metrics.failedCalls = 0;
    this.halfOpenAttempts = 0;
  }

  toString(): string {
    return `CircuitBreaker[${this.name}:${this.state}] Calls:${this.metrics.totalCalls} Success:${this.metrics.successfulCalls} Failed:${this.metrics.failedCalls}`;
  }
}

// Pre-configured circuit breakers for each swarm service
export const circuitBreakers = {
  deepseek: new CircuitBreaker('DeepSeek', { failureThreshold: 3, timeout: 8000 }),
  flux: new CircuitBreaker('Flux.1', { failureThreshold: 5, timeout: 12000 }),
  colony: new CircuitBreaker('ColonyOS', { failureThreshold: 4, timeout: 6000 })
};
