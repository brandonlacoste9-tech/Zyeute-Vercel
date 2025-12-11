/**
 * BEE SWARM Security Audit Execution Script
 * Reads codebase digest and initiates security audit via IntegrityForeman
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { IntegrityForeman } from '../colony-os/app/kernel/managers/integrity_foreman.js';

// Load environment variables
const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
if (existsSync(envPath)) {
  config({ path: envPath });
  console.log('✅ Loaded environment variables from .env.local');
} else {
  console.warn('⚠️  No .env.local file found. Using system environment variables.');
}

// Check for Gemini API key
if (!process.env.GEMINI_API_KEY && !process.env.VITE_GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY or VITE_GEMINI_API_KEY not found!');
  console.error('   Please set it in .env.local or as an environment variable.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function runSecurityAudit() {
  try {
    console.log('🛡️ BEE SWARM Security Audit Initiation\n');
    console.log('='.repeat(50));
    
    // Step 1: Read the codebase digest
    console.log('\n📖 Step 1: Reading codebase digest...');
    const digestPath = join(projectRoot, '_codebase_digest.txt');
    const digestContent = readFileSync(digestPath, 'utf-8');
    console.log(`✅ Digest loaded: ${(digestContent.length / 1024 / 1024).toFixed(2)} MB\n`);

    // Step 2: Initiate security audit
    console.log('🚀 Step 2: Initiating security audit workflow...\n');
    const findings = await IntegrityForeman.initiateSecurityAudit(digestContent);

    // Step 3: Display results
    console.log('\n' + '='.repeat(50));
    console.log('✅ SECURITY AUDIT COMPLETE\n');
    console.log(`📊 Total Findings: ${findings.length}`);
    
    const summary = IntegrityForeman.generateSummary();
    console.log(`\n📈 Summary:`);
    console.log(`   Total: ${summary.total}`);
    console.log(`   Critical/High: ${summary.criticalCount}`);
    console.log(`   Modules Affected: ${summary.modulesAffected.join(', ')}`);
    console.log(`\n   Severity Breakdown:`);
    Object.entries(summary.bySeverity).forEach(([severity, count]) => {
      console.log(`     ${severity}: ${count}`);
    });

    if (summary.criticalCount > 0) {
      console.log(`\n⚠️  CRITICAL FINDINGS DETECTED!`);
      const critical = IntegrityForeman.getCriticalFindings();
      critical.forEach(finding => {
        console.log(`\n   [${finding.severity}] ${finding.issueId}`);
        console.log(`   Module: ${finding.module}`);
        console.log(`   Summary: ${finding.summary}`);
        if (finding.remediation) {
          console.log(`   Remediation: ${finding.remediation}`);
        }
      });
    }

    console.log('\n' + '='.repeat(50));
    
    return findings;
  } catch (error) {
    console.error('\n❌ Security audit failed:', error);
    process.exit(1);
  }
}

// Execute
runSecurityAudit()
  .then(() => {
    console.log('\n✨ Audit workflow completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

