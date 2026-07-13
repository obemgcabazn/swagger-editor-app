import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      'server-only': resolve('./tests/__mocks__/server-only.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/**/not-found.tsx',
        'src/app/**/error.tsx',
        'src/app/api/**',
        'src/app/**/dev/**',
        'src/components/app-shell/app-shell.tsx',
        'src/components/app-shell/footer.tsx',
        'src/components/swagger/editor-pane.tsx',
        'src/components/swagger/editor-toolbar.tsx',
        'src/components/swagger/editor-body.tsx',
        'src/components/swagger/endpoint-list.tsx',
        'src/components/swagger/request-executor.tsx',
        'src/components/swagger/split-workspace.tsx',
        'src/components/swagger/swagger-editor.tsx',
        'src/components/swagger/swagger-section.tsx',
        'src/components/swagger/viewer-content.tsx',
        'src/components/swagger/viewer-pane.tsx',
        'src/hooks/use-copy-to-clipboard.ts',
        'src/hooks/use-restore-schema.ts',
        'src/hooks/use-save-schema.ts',
        'src/lib/swagger/resolve-url.ts',
        'src/lib/swagger/types.ts',
        'src/i18n/navigation.ts',
        'src/i18n/request.ts',
        'src/lib/supabase/database.types.ts',
        'src/lib/supabase/client.ts',
        'src/proxy.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
