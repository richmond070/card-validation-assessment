import express, { Application, Request, Response } from 'express';
import { rateLimit, Options as RateLimitOptions } from 'express-rate-limit';
import { validateController } from './controllers/cardController';

interface AppOptions {
  windowMs?: number;
  max?: number;
}


export function buildApp(options: AppOptions = {}): Application {
  const app: Application = express();

  app.use(express.json());

  const limiterOptions: Partial<RateLimitOptions> = {
    windowMs: options.windowMs ?? 15 * 60 * 1000, // 15 minutes window
    max: options.max ?? 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: 'Too many requests. Please slow down and try again later.',
      });
    },
  };

  app.use(rateLimit(limiterOptions));

  app.post('/validate', validateController);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found.' });
  });

  return app;
}

const app = buildApp();
export default app;