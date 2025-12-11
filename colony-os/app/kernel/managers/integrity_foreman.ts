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
   * NOTE: Archive and Security Bee modules have been deprecated.
   * This method is retained for API compatibility but returns an empty result.
   * For security audits, use dedicated security scanning tools.
   * 
   * @param _digestContent - The codebase digest content (unused)
   * @returns Empty array of security audit findings
   */
  static async initiateSecurityAudit(_digestContent: string): Promise<SecurityAuditFinding[]> {
    console.log('⚠️  Security audit workflow is deprecated. Please use external security scanning tools.');
    return [];
  }
}
