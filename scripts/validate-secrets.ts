#!/usr/bin/env npx tsx

/**
 * GitHub Secrets Validator
 * 
 * Validates all required secrets for APOLO CI/CD pipeline
 * 
 * Usage:
 *   npx tsx scripts/validate-secrets.ts
 */

interface SecretValidator {
  name: string;
  required: boolean;
  description: string;
  validate: (value: string) => boolean;
}

const validators: SecretValidator[] = [
  // VPS Access (Required)
  {
    name: 'VPS_HOST',
    required: true,
    description: 'VPS IP address (e.g., 31.97.103.184)',
    validate: (value) => {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      return ipRegex.test(value);
    }
  },
  {
    name: 'VPS_USER',
    required: true,
    description: 'SSH user on VPS (e.g., root)',
    validate: (value) => value.length > 0 && value.length < 32
  },
  {
    name: 'VPS_SSH_KEY',
    required: true,
    description: 'Private SSH key (ed25519)',
    validate: (value) => {
      return value.includes('-----BEGIN OPENSSH PRIVATE KEY-----') &&
             value.includes('-----END OPENSSH PRIVATE KEY-----');
    }
  },
  // Discord (Required)
  {
    name: 'DISCORD_TOKEN',
    required: true,
    description: 'Discord bot token',
    validate: (value) => {
      return value.length > 50 && value.includes('.');
    }
  },
  {
    name: 'DISCORD_CLIENT_ID',
    required: true,
    description: 'Discord application ID',
    validate: (value) => {
      return /^\d{18,}$/.test(value);
    }
  },
  // Database (Required)
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL connection string',
    validate: (value) => {
      return value.startsWith('postgresql://') &&
             value.includes('@') &&
             value.includes('/apolo_dota2');
    }
  },
  // Redis (Required)
  {
    name: 'REDIS_URL',
    required: true,
    description: 'Redis connection URL',
    validate: (value) => {
      return value.startsWith('redis://') &&
             value.includes('@') &&
             value.includes('6379');
    }
  },
  // Dota 2 APIs (Required primary, optional fallbacks)
  {
    name: 'STRATZ_API_TOKEN_1',
    required: true,
    description: 'Primary Stratz API token',
    validate: (value) => value.length > 32
  },
  // AI APIs (Required primary, optional fallbacks)
  {
    name: 'GEMINI_API_KEY_1',
    required: true,
    description: 'Primary Google Gemini API key',
    validate: (value) => value.length > 32
  },
  // Optional fallbacks
  {
    name: 'STRATZ_API_TOKEN_2',
    required: false,
    description: 'Secondary Stratz API token (optional)',
    validate: (value) => value.length === 0 || value.length > 32
  },
  {
    name: 'STRATZ_API_TOKEN_3',
    required: false,
    description: 'Tertiary Stratz API token (optional)',
    validate: (value) => value.length === 0 || value.length > 32
  },
  {
    name: 'GEMINI_API_KEY_2',
    required: false,
    description: 'Secondary Gemini API key (optional)',
    validate: (value) => value.length === 0 || value.length > 32
  },
  {
    name: 'GEMINI_API_KEY_3',
    required: false,
    description: 'Tertiary Gemini API key (optional)',
    validate: (value) => value.length === 0 || value.length > 32
  },
  {
    name: 'STEAM_API_KEY',
    required: false,
    description: 'Steam Web API key (optional)',
    validate: (value) => value.length === 0 || value.length === 32
  },
];

function colorize(text: string, color: 'green' | 'red' | 'yellow' | 'cyan'): string {
  const colors: Record<string, string> = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
  };
  return `${colors[color]}${text}${colors.reset}`;
}

interface ValidationResult {
  name: string;
  present: boolean;
  valid: boolean;
  required: boolean;
  message: string;
}

function validateSecrets(): ValidationResult[] {
  const results: ValidationResult[] = [];

  console.log(colorize('\n🔐 APOLO GitHub Secrets Validator\n', 'cyan'));
  console.log('Checking required secrets configuration...\n');

  for (const validator of validators) {
    const value = process.env[validator.name] || '';
    const present = value.length > 0;
    let valid = true;

    if (present) {
      try {
        valid = validator.validate(value);
      } catch {
        valid = false;
      }
    }

    const result: ValidationResult = {
      name: validator.name,
      present,
      valid,
      required: validator.required,
      message: ''
    };

    // Generate message
    if (!present && validator.required) {
      result.message = colorize('❌ MISSING (REQUIRED)', 'red');
    } else if (!present && !validator.required) {
      result.message = colorize('⏭️  SKIPPED (optional)', 'yellow');
    } else if (present && !valid) {
      result.message = colorize('❌ INVALID', 'red');
    } else if (present && valid) {
      result.message = colorize('✅ OK', 'green');
    }

    console.log(`${result.message} ${validator.name}`);
    console.log(`   ${validator.description}`);
    console.log('');

    results.push(result);
  }

  return results;
}

function printSummary(results: ValidationResult[]): void {
  const required = results.filter(r => r.required);
  const optional = results.filter(r => !r.required);
  
  const requiredOk = required.filter(r => r.valid).length;
  const optionalOk = optional.filter(r => r.valid).length;

  console.log(colorize('\n📊 Summary\n', 'cyan'));
  console.log(`Required secrets: ${colorize(`${requiredOk}/${required.length}`, requiredOk === required.length ? 'green' : 'red')}`);
  console.log(`Optional secrets: ${colorize(`${optionalOk}/${optional.length}`, 'yellow')}`);
  console.log('');

  const allValid = required.every(r => r.valid);
  
  if (allValid) {
    console.log(colorize('✅ All required secrets are configured correctly!', 'green'));
    console.log(colorize('🚀 Ready for deployment\n', 'green'));
    return;
  }

  const missing = required.filter(r => !r.present);
  const invalid = required.filter(r => r.present && !r.valid);

  if (missing.length > 0) {
    console.log(colorize(`❌ Missing ${missing.length} required secret(s):\n`, 'red'));
    for (const secret of missing) {
      console.log(`   - ${secret.name}`);
    }
    console.log('');
  }

  if (invalid.length > 0) {
    console.log(colorize(`❌ Invalid ${invalid.length} secret(s):\n`, 'red'));
    for (const secret of invalid) {
      console.log(`   - ${secret.name} (format validation failed)`);
    }
    console.log('');
  }

  console.log(colorize('⚠️  Configuration incomplete\n', 'yellow'));
}

// Main execution
try {
  const results = validateSecrets();
  printSummary(results);

  // Exit with error if any required secret is missing/invalid
  const allValid = results
    .filter(r => r.required)
    .every(r => r.present && r.valid);

  process.exit(allValid ? 0 : 1);
} catch (error) {
  console.error(colorize(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}\n`, 'red'));
  process.exit(1);
}
