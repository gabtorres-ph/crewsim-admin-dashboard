import { defineConfig, loadEnv, type Plugin, type ProxyOptions } from 'vite';

function deploymentMiddleware(): Plugin {
  return {
    name: 'deployment-middleware',
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url === '/healthz') {
          response.statusCode = 200;
          response.setHeader('Content-Type', 'text/plain');
          response.end('ok\n');
          return;
        }

        if (request.url?.startsWith('/assets/')) {
          response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '');
  const getEnv = (name: string, fallback = '') =>
    process.env[name] || fileEnv[name] || fallback;
  const proxyHeaders: Record<string, string> = {};
  const accessClientId = getEnv('CF_ACCESS_CLIENT_ID');
  const accessClientSecret = getEnv('CF_ACCESS_CLIENT_SECRET');

  if (accessClientId) {
    proxyHeaders['CF-Access-Client-Id'] = accessClientId;
  }

  if (accessClientSecret) {
    proxyHeaders['CF-Access-Client-Secret'] = accessClientSecret;
  }

  const apiProxy: ProxyOptions = {
    target: getEnv('CORE_API_URL', 'http://localhost:8000'),
    changeOrigin: true,
    headers: proxyHeaders,
  };

  return {
    plugins: [deploymentMiddleware()],
    preview: {
      host: '0.0.0.0',
      port: Number.parseInt(getEnv('PORT', '8080'), 10),
      strictPort: true,
      allowedHosts: true,
      proxy: {
        '/api': apiProxy,
      },
    },
  };
});
