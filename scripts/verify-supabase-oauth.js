/**
 * Verify Supabase OAuth Configuration via Management API
 * 
 * This script uses the Supabase Management API to check:
 * - Site URL configuration
 * - Redirect URLs
 * - OAuth provider settings
 * 
 * Requires SUPABASE_ACCESS_TOKEN environment variable
 * Get token from: https://supabase.com/dashboard/account/tokens
 */

import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_REF = 'vuanulvyqkfefmjcikfk';
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}`;

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ SUPABASE_ACCESS_TOKEN not set');
  console.error('');
  console.error('Get your access token from:');
  console.error('https://supabase.com/dashboard/account/tokens');
  console.error('');
  console.error('Then run:');
  console.error('  export SUPABASE_ACCESS_TOKEN=your_token_here');
  console.error('  node scripts/verify-supabase-oauth.js');
  process.exit(1);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `${path}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${JSON.stringify(json)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}\nResponse: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkAuthConfig() {
  console.log('🔍 Checking Supabase OAuth Configuration\n');
  console.log('='.repeat(60));
  console.log(`Project: ${PROJECT_REF}`);
  console.log('='.repeat(60));
  console.log('');

  try {
    // Check auth configuration
    console.log('📋 Fetching Auth Configuration...');
    const authConfig = await makeRequest(`/v1/projects/${PROJECT_REF}/config/auth`);
    
    console.log('\n✅ Auth Configuration:');
    console.log(JSON.stringify(authConfig, null, 2));
    
    // Check specific OAuth settings
    if (authConfig.SITE_URL) {
      console.log(`\n📍 Site URL: ${authConfig.SITE_URL}`);
      const expectedSiteUrl = 'https://zyeute.com';
      if (authConfig.SITE_URL === expectedSiteUrl) {
        console.log('✅ Site URL is correct');
      } else {
        console.log(`❌ Site URL should be: ${expectedSiteUrl}`);
      }
    }
    
    if (authConfig.URI_ALLOW_LIST && Array.isArray(authConfig.URI_ALLOW_LIST)) {
      console.log(`\n📍 Redirect URLs (${authConfig.URI_ALLOW_LIST.length}):`);
      authConfig.URI_ALLOW_LIST.forEach((url, i) => {
        console.log(`   ${i + 1}. ${url}`);
      });
      
      const requiredUrls = [
        'https://zyeute.com/auth/callback',
        'https://zyeute.com/**',
      ];
      
      console.log('\n🔍 Checking required URLs:');
      requiredUrls.forEach(url => {
        const found = authConfig.URI_ALLOW_LIST.some(u => u === url || u.includes(url));
        if (found) {
          console.log(`   ✅ ${url}`);
        } else {
          console.log(`   ❌ Missing: ${url}`);
        }
      });
    }
    
    // Check OAuth providers
    console.log('\n📋 Checking OAuth Providers...');
    const providers = await makeRequest(`/v1/projects/${PROJECT_REF}/config/auth/providers`);
    
    if (providers && Array.isArray(providers)) {
      const googleProvider = providers.find(p => p.id === 'google');
      if (googleProvider) {
        console.log('\n✅ Google OAuth Provider:');
        console.log(`   Enabled: ${googleProvider.enabled ? '✅' : '❌'}`);
        console.log(`   Client ID: ${googleProvider.client_id ? '✅ Set' : '❌ Missing'}`);
        console.log(`   Client Secret: ${googleProvider.client_secret ? '✅ Set' : '❌ Missing'}`);
        
        if (!googleProvider.enabled) {
          console.log('\n⚠️  Google OAuth is disabled! Enable it in Supabase Dashboard.');
        }
      } else {
        console.log('\n❌ Google OAuth provider not found');
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification complete!');
    
  } catch (error) {
    console.error('\n❌ Error checking configuration:');
    console.error(error.message);
    console.error('\nMake sure:');
    console.error('1. SUPABASE_ACCESS_TOKEN is valid');
    console.error('2. Token has access to project:', PROJECT_REF);
    console.error('3. Project exists and is accessible');
    process.exit(1);
  }
}

checkAuthConfig();

