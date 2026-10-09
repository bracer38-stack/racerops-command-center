import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom Vite middleware to act as a live webhook receiver for n8n, OpenClaw, and Stripe
function webhookReceiverPlugin() {
  return {
    name: 'racerops-webhook-receiver',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/api/webhook/')) {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              console.log(`[RacerOps Webhook Received] ${req.url}:`, data);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, message: 'RacerOps ingested payload successfully', receivedAt: new Date().toISOString() }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
          });
          return;
        }

        if (req.url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ status: 'healthy', server: 'RacerOps Local Node', timestamp: Date.now() }));
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    webhookReceiverPlugin()
  ],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    cors: true
  }
})
