import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow CORS from frontend app domain
  app.use(cookieParser());
  const corsOrigins = (process.env.FRONTEND_BASE_URL || 'http://localhost:3000')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
    allowedHeaders: ['content-type', 'authorization'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  const port = parseInt(process.env.PORT ?? '4001', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on port ${port}`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
