import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/types/**',
        'src/**/*.d.ts',
        'src/index.ts',
        'src/deploy-commands.ts',
        'src/deploy-guilds.ts',
        'src/config/**',
        'src/database/**',
        'src/commands/**',
        'src/handlers/**',
        'src/services/**',
      ],
      // Per-file thresholds: Only utilities with tests must meet 80%+
      perFile: true,
      thresholds: {
        perFile: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
      },
    },
  },
});
