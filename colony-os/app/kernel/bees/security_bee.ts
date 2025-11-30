/**
 * SecurityBee - Deep Security Audit Worker
 * Performs comprehensive security audits using Gemini AI with context caching
 */

import { gemini } from '../../lib/gemini-client.js';
import { SecurityAuditSchema, SecurityAuditFinding } from '../../../../src/schemas/SecurityAuditSchema.js';
import { IntegrityForeman } from '../managers/integrity_foreman.js';

class SecurityBee {
  /**
   * Run a deep security audit on the codebase using cached context
   * 
   * @param contextCacheId - The context cache ID from ArchiveBee.cache_current_codebase()
   * @returns Array of security audit findings
   */
  async runDeepAudit(contextCacheId: string): Promise<SecurityAuditFinding[]> {
    if (!gemini) {
      throw new Error('Gemini client not initialized. Set GEMINI_API_KEY environment variable.');
    }

    const systemInstruction = `You are SecurityBee. Your mission is to find RLS (Row Level Security), authentication, and secret exposure vulnerabilities in the codebase provided via the context cache. 

Focus on:
- Missing or weak RLS policies
- Authentication bypass vulnerabilities
- Exposed API keys, secrets, or credentials
- SQL injection risks
- Authorization flaws
- Insecure direct object references

Output findings strictly as JSON array matching the SecurityAuditSchema.`;

    try {
      const response = await gemini.generateContent({
        model: "gemini-2.0-flash-exp",
        contextCache: contextCacheId,
        systemInstruction,
        contents: "Analyze the codebase for security vulnerabilities. Focus on RLS policies, authentication mechanisms, and secret exposure.",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: SecurityAuditSchema,
          temperature: 0.1 // Low temperature for consistent, focused analysis
        }
      });

      // Parse the JSON response
      const report = JSON.parse(response.text);
      
      // Ensure it's an array
      const findings: SecurityAuditFinding[] = Array.isArray(report) ? report : [report];
      
      // Process findings through IntegrityForeman
      IntegrityForeman.processAuditReport(findings);

      return findings;
    } catch (error) {
      console.error('Security audit failed:', error);
      throw new Error(`Security audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Run audit on specific module/file
   * 
   * @param modulePath - Path to the specific module to audit
   * @param contextCacheId - Optional context cache ID
   */
  async auditModule(modulePath: string, contextCacheId?: string): Promise<SecurityAuditFinding[]> {
    if (!gemini) {
      throw new Error('Gemini client not initialized.');
    }

    const systemInstruction = `You are SecurityBee. Analyze the specific module "${modulePath}" for security vulnerabilities. Focus on RLS, authentication, and secret exposure.`;

    const response = await gemini.generateContent({
      model: "models/gemini-1.5-pro",
      contextCache: contextCacheId,
      systemInstruction,
      contents: `Perform security audit on module: ${modulePath}`,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: SecurityAuditSchema,
        temperature: 0.1
      }
    });

    const findings: SecurityAuditFinding[] = Array.isArray(JSON.parse(response.text)) 
      ? JSON.parse(response.text) 
      : [JSON.parse(response.text)];
    
    IntegrityForeman.processAuditReport(findings);
    
    return findings;
  }

  /**
   * Get audit summary from IntegrityForeman
   */
  getAuditSummary() {
    return IntegrityForeman.generateSummary();
  }
}

export default SecurityBee;

