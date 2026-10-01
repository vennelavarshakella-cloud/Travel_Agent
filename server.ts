import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_N8N_URL = 'https://vennela0811.app.n8n.cloud/form/046dba14-f279-420e-9400-f6c479219664';
const DEFAULT_N8N_CHAT_URL = 'https://vennela0811.app.n8n.cloud/webhook/76c515fa-5e07-4c05-bf40-92cb512b41d8/chat';
const N8N_INSTANCE_ID = 'ac00ef61bd98b719c7ad08708f676f42e79ae4381380b7280f583c432bc46ab6';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check and config endpoint
  app.get('/api/config', (_req, res) => {
    res.json({
      status: 'ok',
      defaultN8nUrl: DEFAULT_N8N_URL,
      defaultN8nChatUrl: DEFAULT_N8N_CHAT_URL,
      formTitle: 'travel agent',
      formDescription: 'Enter your journey details to get transport options, travel dates, and an estimated total trip cost.',
      timestamp: new Date().toISOString(),
    });
  });

  // Proxy chat messages directly to n8n AI Chat webhook
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ ok: false, error: 'Message is required' });
      }

      const activeSessionId = sessionId && typeof sessionId === 'string' && sessionId.trim()
        ? sessionId.trim()
        : `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const n8nChatRes = await fetch(DEFAULT_N8N_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Instance-Id': N8N_INSTANCE_ID,
        },
        body: JSON.stringify({
          action: 'sendMessage',
          chatInput: message.trim(),
          sessionId: activeSessionId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!n8nChatRes.ok) {
        const text = await n8nChatRes.text();
        return res.status(n8nChatRes.status).json({
          ok: false,
          error: `n8n Chat responded with HTTP ${n8nChatRes.status}`,
          details: text,
        });
      }

      const data = await n8nChatRes.json();
      return res.json({
        ok: true,
        output: data.output || (typeof data === 'string' ? data : JSON.stringify(data)),
        sessionId: activeSessionId,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      return res.status(500).json({
        ok: false,
        error: err.name === 'AbortError' ? 'Chat request timed out after 25 seconds' : (err.message || 'Chat error'),
      });
    }
  });

  // Test connection to the n8n endpoint
  app.get('/api/test-n8n', async (req, res) => {
    const targetUrl = typeof req.query.url === 'string' && req.query.url.trim() ? req.query.url.trim() : DEFAULT_N8N_URL;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const html = await response.text();
      const hasForm = html.includes('n8n-form') || html.includes('travel agent') || response.status === 200;

      res.json({
        ok: response.status === 200,
        status: response.status,
        targetUrl,
        verified: hasForm,
        message: response.status === 200 ? 'Successfully connected to n8n Travel Agent endpoint' : `Received HTTP ${response.status}`,
      });
    } catch (err: any) {
      console.error('Error testing n8n endpoint:', err);
      res.status(500).json({
        ok: false,
        targetUrl,
        error: err.message || 'Failed to connect to n8n endpoint',
      });
    }
  });

  // Proxy submission to n8n form endpoint
  app.post('/api/submit-trip', async (req, res) => {
    try {
      const {
        travel_name,
        email,
        phone_number,
        number_of_travelers,
        From_Location,
        To_Location,
        Travel_date,
        return_date,
        budget,
        customN8nUrl,
      } = req.body;

      // Validation
      if (!travel_name || !phone_number || !number_of_travelers || !From_Location || !To_Location || !Travel_date || budget === undefined) {
        return res.status(400).json({
          ok: false,
          error: 'Missing required trip parameters (travel_name, phone_number, number_of_travelers, From_Location, To_Location, Travel_date, budget).',
        });
      }

      const targetUrl = customN8nUrl && typeof customN8nUrl === 'string' && customN8nUrl.startsWith('http')
        ? customN8nUrl.trim()
        : DEFAULT_N8N_URL;

      // Build standard FormData exactly as n8n Form trigger expects
      // In the parsed n8n HTML:
      // field-0: travel_name
      // field-1: email
      // field-2: phone_number
      // field-3: number_of_travelers
      // field-4: From_Location
      // field-5: To_Location
      // field-6: Travel_date
      // field-7: return_date
      // field-8: budget
      const formData = new FormData();
      formData.append('field-0', String(travel_name).trim());
      formData.append('field-1', email ? String(email).trim() : '');
      formData.append('field-2', String(phone_number).trim());
      formData.append('field-3', String(number_of_travelers).trim());
      formData.append('field-4', String(From_Location).trim());
      formData.append('field-5', String(To_Location).trim());
      formData.append('field-6', String(Travel_date).trim());
      formData.append('field-7', return_date ? String(return_date).trim() : '');
      formData.append('field-8', String(budget).trim());

      // Also append named keys for workflows that query $json.From_Location or $json.travel_name
      formData.append('travel_name', String(travel_name).trim());
      formData.append('email', email ? String(email).trim() : '');
      formData.append('phone_number', String(phone_number).trim());
      formData.append('number_of_travelers', String(number_of_travelers).trim());
      formData.append('From_Location', String(From_Location).trim());
      formData.append('To_Location', String(To_Location).trim());
      formData.append('Travel_date', String(Travel_date).trim());
      formData.append('return_date', return_date ? String(return_date).trim() : '');
      formData.append('budget', String(budget).trim());

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const n8nResponse = await fetch(targetUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = n8nResponse.headers.get('content-type') || '';
      let responseBody: any = null;

      if (contentType.includes('application/json')) {
        try {
          responseBody = await n8nResponse.json();
        } catch {
          responseBody = null;
        }
      } else {
        const text = await n8nResponse.text();
        try {
          responseBody = JSON.parse(text);
        } catch {
          responseBody = { rawText: text };
        }
      }

      if (n8nResponse.ok) {
        return res.json({
          ok: true,
          status: n8nResponse.status,
          targetUrl,
          data: responseBody,
          bookingReference: 'TRV-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          submittedAt: new Date().toISOString(),
          details: {
            travel_name,
            email,
            phone_number,
            number_of_travelers,
            From_Location,
            To_Location,
            Travel_date,
            return_date,
            budget,
          },
        });
      } else {
        return res.status(n8nResponse.status).json({
          ok: false,
          status: n8nResponse.status,
          targetUrl,
          error: responseBody?.message || `n8n returned status ${n8nResponse.status}`,
          data: responseBody,
        });
      }
    } catch (err: any) {
      console.error('Trip submission error:', err);
      return res.status(500).json({
        ok: false,
        error: err.name === 'AbortError' ? 'Submission to n8n timed out after 15 seconds' : err.message,
      });
    }
  });

  // Frontend integration: Vite middleware in development, static in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Travel Agent Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
