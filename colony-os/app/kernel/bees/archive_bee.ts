/**
 * ArchiveBee - Codebase Digest Caching and Archival
 * Manages long-term storage and caching of codebase digests using Gemini
 */

import { gemini } from '../../lib/gemini-client.js';

class ArchiveBee {
  /**
   * Cache the current codebase digest for efficient querying
   * Uses Gemini's context caching to reduce costs on repeated queries
   * 
   * @param digestContent - The codebase digest content to cache
   * @returns Cache name/ID for future reference
   */
  async cache_current_codebase(digestContent: string): Promise<string> {
    if (!gemini) {
      throw new Error('Gemini client not initialized. Set GEMINI_API_KEY environment variable.');
    }

    // Create cached context using Gemini cache manager
    const cache = await gemini.cacheManager.create({
      model: "gemini-2.0-flash-exp",
      displayName: "Codebase_Digest_Live",
      contents: [{ parts: [{ text: digestContent }] }],
      ttlSeconds: 604800 // 7 days (604800 seconds)
    });

    return cache.name;
  }

  /**
   * Purge old digests that have expired
   * Cleans up cached contexts that are no longer needed
   * 
   * @returns Number of caches purged
   */
  async purge_old_digests(): Promise<number> {
    if (!gemini) {
      console.warn('Gemini client not initialized. Cannot purge caches.');
      return 0;
    }

    return await gemini.cacheManager.purgeOld();
  }

  /**
   * Get cache information for a specific digest
   * 
   * @param displayName - The display name of the cached digest
   * @returns Cache information or undefined if not found
   */
  getCacheInfo(displayName: string): { cacheId: string; createdAt: Date; ttl: number } | undefined {
    if (!gemini) {
      return undefined;
    }

    return gemini.cacheManager.getCache(displayName);
  }
}

export default ArchiveBee;

