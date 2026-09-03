/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // The Nixpacks publish-directory deployment is static, so these values
    // must be embedded while Vite builds the browser bundle. This intentionally
    // exposes the test-environment Cloudflare Access service token.
    envPrefix: ['VITE_', 'CF_ACCESS_'],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
      },
    },
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.CORE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    test: {
      projects: [{
        extends: true,
        plugins: [
        // The plugin will run tests for the stories defined in your Storybook config
        // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
        storybookTest({
          configDir: path.join(import.meta.dirname, '.storybook')
        })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{
              browser: 'chromium'
            }]
          }
        }
      }]
    }
  }
});
