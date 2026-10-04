// Testes de ponta a ponta. Rodam contra o build de produção (dist/),
// o mesmo conteúdo que vai para o deploy.
// Com BASE_URL, rodam contra um endereço publicado, sem servidor local:
//   BASE_URL=https://ong-ponte-digital.vercel.app npm test
import { defineConfig, devices } from '@playwright/test';

const remoto = process.env.BASE_URL;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: remoto || 'http://localhost:4173',
    locale: 'pt-BR'
  },
  webServer: remoto ? undefined : {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } }
  ]
});
