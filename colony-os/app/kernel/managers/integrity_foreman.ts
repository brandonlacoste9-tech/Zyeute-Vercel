/**
 * IntegrityForeman - Security Audit Report Processor
 * Processes security audit findings and coordinates remediation
 */

import { SecurityAuditFinding } from '../../../../src/schemas/SecurityAuditSchema.js';

export class IntegrityForeman {
  private static auditReports: SecurityAuditFinding[] = [];
  private static criticalFindings: SecurityAuditFinding[] = [];

  /**
   * Process an audit report containing security findings
   * @param report - Array of security audit findings or single finding
   */
  static processAuditReport(report: SecurityAuditFinding | SecurityAuditFinding[]): void {
    const findings = Array.isArray(report) ? report : [report];
    
    // Store all findings
    this.auditReports.push(...findings);
    
    // Separate critical findings
    const critical = findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');
    this.criticalFindings.push(...critical);
    
    // Log findings
    console.log(`🔍 Processed ${findings.length} security findings`);
    if (critical.length > 0) {
      console.warn(`⚠️  Found ${critical.length} CRITICAL/HIGH severity issues`);
      critical.forEach(finding => {
        console.warn(`   [${finding.severity}] ${finding.issueId}: ${finding.summary}`);
      });
    }
    
    // Trigger remediation workflow for critical findings
    if (critical.length > 0) {
      this.triggerRemediation(critical);
    }
  }

  /**
   * Trigger remediation workflow for critical findings
   * @param findings - Critical security findings to remediate
   */
  private static triggerRemediation(findings: SecurityAuditFinding[]): void {
    console.log(`🚨 Initiating remediation for ${findings.length} critical findings...`);
    
    findings.forEach(finding => {
      if (finding.remediation) {
        console.log(`   Remediation for ${finding.issueId}: ${finding.remediation}`);
        // In production, this would:
        // 1. Create a task/ticket for the finding
        // 2. Assign to appropriate team
        // 3. Track remediation progress
        // 4. Verify fix after implementation
      }
    });
  }

  /**
   * Get all audit reports
   */
  static getAuditReports(): SecurityAuditFinding[] {
    return [...this.auditReports];
  }

  /**
   * Get critical findings only
   */
  static getCriticalFindings(): SecurityAuditFinding[] {
    return [...this.criticalFindings];
  }

  /**
   * Get findings by severity
   */
  static getFindingsBySeverity(severity: SecurityAuditFinding['severity']): SecurityAuditFinding[] {
    return this.auditReports.filter(f => f.severity === severity);
  }

  /**
   * Get findings by module
   */
  static getFindingsByModule(module: string): SecurityAuditFinding[] {
    return this.auditReports.filter(f => f.module === module);
  }

  /**
   * Clear all audit reports (useful for testing)
   */
  static clearReports(): void {
    this.auditReports = [];
    this.criticalFindings = [];
  }

  /**
   * Generate summary report
   */
  static generateSummary(): {
    total: number;
    bySeverity: Record<string, number>;
    criticalCount: number;
    modulesAffected: string[];
  } {
    const bySeverity: Record<string, number> = {};
    const modulesAffected = new Set<string>();

    this.auditReports.forEach(finding => {
      bySeverity[finding.severity] = (bySeverity[finding.severity] || 0) + 1;
      modulesAffected.add(finding.module);
    });

    return {
      total: this.auditReports.length,
      bySeverity,
      criticalCount: this.criticalFindings.length,
      modulesAffected: Array.from(modulesAffected)
    };
  }

  /**
   * Initiate complete security audit workflow
   * Orchestrates: ArchiveBee caching -> SecurityBee audit -> Processing
   * 
   * @param digestContent - The codebase digest content from digest_codebase.py
   * @returns Array of security audit findings
   */
  static async initiateSecurityAudit(digestContent: string): Promise<SecurityAuditFinding[]> {
    console.log('🛡️ Initiating BEE SWARM Security Audit...\n');

    // Dynamic imports to avoid circular dependencies
    const ArchiveBee = (await import('../bees/archive_bee.js')).default;
    const SecurityBee = (await import('../bees/security_bee.js')).default;

    try {
      // Step 1: Cache the codebase digest
      console.log('📦 Step 1: Caching codebase digest...');
      const archiveBee = new ArchiveBee();
      const cacheName = await archiveBee.cache_current_codebase(digestContent);
      console.log(`✅ Digest cached: ${cacheName}\n`);

      // Step 2: Run deep security audit
      console.log('🔍 Step 2: Running deep security audit...');
      const securityBee = new SecurityBee();
      const findings = await securityBee.runDeepAudit(cacheName);
      console.log(`✅ Audit complete: ${findings.length} findings\n`);

      // Step 3: Generate summary
      const summary = this.generateSummary();
      console.log('📊 Audit Summary:');
      console.log(`   Total Findings: ${summary.total}`);
      console.log(`   Critical/High: ${summary.criticalCount}`);
      console.log(`   Modules Affected: ${summary.modulesAffected.length}`);
      console.log(`   Severity Breakdown:`, summary.bySeverity);
      console.log('');

      return findings;
    } catch (error) {
      console.error('❌ Security audit failed:', error);
      throw error;
    }
  }
}

