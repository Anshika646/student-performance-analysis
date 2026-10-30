import express from 'express';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import readline from 'readline';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timer: ReturnType<typeof setTimeout>;
}

class PythonMLDaemon {
  private proc: ChildProcessWithoutNullStreams | null = null;
  private pending = new Map<string, PendingRequest>();
  private counter = 0;

  constructor() {
    this.ensureProcess();
  }

  private ensureProcess() {
    if (this.proc && !this.proc.killed) {
      return;
    }

    const scriptPath = path.join(__dirname, 'cli_bridge.py');
    const child = spawn('python3', [scriptPath, '--daemon'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const rl = readline.createInterface({ input: child.stdout });
    rl.on('line', (line: string) => {
      if (!line.trim()) return;
      try {
        const parsed = JSON.parse(line);
        const id = String(parsed.id ?? '');
        const req = this.pending.get(id);
        if (req) {
          clearTimeout(req.timer);
          this.pending.delete(id);
          if (parsed.ok === false) {
            req.reject(new Error(parsed.error || 'Python ML execution error'));
          } else {
            req.resolve(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to parse Python ML output:', err);
      }
    });

    child.stderr.on('data', (chunk: Buffer) => {
      console.error('[Python ML stderr]:', chunk.toString());
    });

    child.on('exit', () => {
      this.proc = null;
      for (const [id, req] of this.pending.entries()) {
        clearTimeout(req.timer);
        req.reject(new Error('Python ML worker restarted'));
        this.pending.delete(id);
      }
    });

    this.proc = child;
  }

  public call(payload: Record<string, any>, timeoutMs = 25000): Promise<any> {
    this.ensureProcess();
    const id = `req_${++this.counter}_${Date.now()}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error('Python ML request timed out'));
      }, timeoutMs);

      this.pending.set(id, { resolve, reject, timer });
      try {
        this.proc!.stdin.write(JSON.stringify({ id, payload }) + '\n');
      } catch (err) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(err);
      }
    });
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const mlDaemon = new PythonMLDaemon();

  app.use(express.json({ limit: '15mb' }));

  app.post('/api/ml/bundle', async (req, res) => {
    try {
      const result = await mlDaemon.call({
        action: 'full_bundle',
        datasetKey: req.body?.datasetKey || 'mat',
        customCsvText: req.body?.customCsvText || null,
        testSize: req.body?.testSize ?? 0.2,
        randomState: req.body?.randomState ?? 42,
        maxDepth: req.body?.maxDepth ?? 6,
        nEstimators: req.body?.nEstimators ?? 40,
        forceRetrain: Boolean(req.body?.forceRetrain),
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err?.message || 'Failed to load dataset bundle' });
    }
  });

  app.post('/api/ml/train', async (req, res) => {
    try {
      const result = await mlDaemon.call({
        action: 'train',
        datasetKey: req.body?.datasetKey || 'mat',
        customCsvText: req.body?.customCsvText || null,
        testSize: req.body?.testSize ?? 0.2,
        randomState: req.body?.randomState ?? 42,
        maxDepth: req.body?.maxDepth ?? 6,
        nEstimators: req.body?.nEstimators ?? 40,
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err?.message || 'Model training failed' });
    }
  });

  app.post('/api/ml/predict', async (req, res) => {
    try {
      const result = await mlDaemon.call({
        action: 'predict',
        datasetKey: req.body?.datasetKey || 'mat',
        customCsvText: req.body?.customCsvText || null,
        includeGrades: req.body?.includeGrades !== false,
        modelKey: req.body?.modelKey || 'random_forest',
        testSize: req.body?.testSize ?? 0.2,
        randomState: req.body?.randomState ?? 42,
        maxDepth: req.body?.maxDepth ?? 6,
        nEstimators: req.body?.nEstimators ?? 40,
        studentInput: req.body?.studentInput || {},
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err?.message || 'Student grade prediction failed' });
    }
  });

  app.get('/api/ml/python-sources', async (_req, res) => {
    try {
      const result = await mlDaemon.call({ action: 'python_sources' });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message || 'Failed to read Python source files' });
    }
  });

  app.get('/api/dataset/download/:key', (req, res) => {
    const key = req.params.key === 'por' ? 'por' : 'mat';
    const filename = key === 'por' ? 'student-por.csv' : 'student-mat.csv';
    const filePath = path.join(__dirname, 'data', filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).send('Dataset file not found');
      return;
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    fs.createReadStream(filePath).pipe(res);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPulse ML Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
