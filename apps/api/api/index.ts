import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from '../src/app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const expressApp = express();
let cachedApp: express.Express | null = null;

async function bootstrap(): Promise<express.Express> {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn'] },
  );

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const origins = ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean) as string[];
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.init();
  cachedApp = expressApp;
  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await bootstrap();
    await new Promise<void>((resolve, reject) => {
      res.on('finish', resolve);
      res.on('error', reject);
      (app as any)(req, res, (err: any) => err ? reject(err) : resolve());
    });
  } catch (err: any) {
    console.error('[handler error]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message ?? String(err), stack: err?.stack });
    }
  }
}
