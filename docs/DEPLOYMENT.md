# Deployment and Configuration Guide

This document provides comprehensive instructions for deploying the AI Capstone Generator application to various platforms and environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Platforms](#deployment-platforms)
- [Production Configuration](#production-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn/pnpm)
- **OpenRouter API Key**: Valid API key from [OpenRouter](https://openrouter.ai/)

### Development Dependencies

```bash
# Install dependencies
npm install

# Verify installation
npm run build
npm run lint
```

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd capstone-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env.local
   ```

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_SITE_URL=https://your-domain.com
OPENROUTER_APP_TITLE=AI Capstone Generator
OPENROUTER_MODEL=alibaba/tongyi-deepresearch-30b-a3b:free

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your_google_analytics_id
SENTRY_DSN=your_sentry_dsn
```

### Environment Variable Descriptions

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for AI access | `sk-or-v1-...` |
| `OPENROUTER_SITE_URL` | No | Your application URL for OpenRouter tracking | `https://capstone-generator.com` |
| `OPENROUTER_APP_TITLE` | No | Application title for OpenRouter | `AI Capstone Generator` |
| `OPENROUTER_MODEL` | No | AI model to use | `alibaba/tongyi-deepresearch-30b-a3b:free` |
| `NODE_ENV` | Yes | Environment mode | `production` |
| `NEXT_PUBLIC_APP_URL` | No | Public application URL | `https://capstone-generator.com` |

### Getting OpenRouter API Key

1. **Visit OpenRouter**: Go to [https://openrouter.ai/](https://openrouter.ai/)
2. **Sign up**: Create an account or sign in
3. **Generate API Key**: Navigate to API Keys section
4. **Copy Key**: Copy the generated API key
5. **Add Credits**: Ensure you have sufficient credits for usage

## Deployment Platforms

### 1. Vercel (Recommended)

Vercel is the recommended platform for Next.js applications due to its seamless integration.

#### Automatic Deployment

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Select the repository and branch

2. **Configure Environment Variables**:
   - In project settings, go to "Environment Variables"
   - Add all required environment variables
   - Set environment scope (Production, Preview, Development)

3. **Deploy**:
   - Vercel will automatically deploy on push to main branch
   - Custom domains can be configured in project settings

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Vercel Configuration

Create `vercel.json` in the root directory:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/generate/route.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 2. Netlify

Netlify provides excellent support for Next.js applications with serverless functions.

#### Configuration

1. **Build Settings**:
   ```bash
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**:
   - Add all required environment variables in Netlify dashboard
   - Go to Site Settings > Environment Variables

3. **Netlify Configuration**:

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  directory = "netlify/functions"
```

#### Deploy Commands

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### 3. Railway

Railway provides simple deployment with automatic builds.

#### Configuration

1. **Connect Repository**:
   - Go to [Railway](https://railway.app/)
   - Connect your GitHub repository
   - Railway will auto-detect Next.js

2. **Environment Variables**:
   - Add environment variables in Railway dashboard
   - Go to Variables tab

3. **Railway Configuration**:

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 4. Docker Deployment

For containerized deployment on any platform.

#### Dockerfile

Create `Dockerfile`:

```dockerfile
# Use the official Node.js 18 image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  capstone-generator:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OPENROUTER_SITE_URL=${OPENROUTER_SITE_URL}
      - OPENROUTER_APP_TITLE=${OPENROUTER_APP_TITLE}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Build and Deploy

```bash
# Build Docker image
docker build -t capstone-generator .

# Run container
docker run -p 3000:3000 \
  -e OPENROUTER_API_KEY=your_key \
  -e OPENROUTER_SITE_URL=https://your-domain.com \
  capstone-generator

# Using Docker Compose
docker-compose up -d
```

### 5. AWS Deployment

#### AWS Amplify

1. **Connect Repository**:
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New App" > "Host web app"
   - Connect your Git repository

2. **Build Settings**:

Create `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

3. **Environment Variables**:
   - Add environment variables in Amplify console
   - Go to App Settings > Environment Variables

#### AWS Lambda (Serverless)

1. **Install Serverless Framework**:
   ```bash
   npm install -g serverless
   npm install serverless-nextjs-plugin
   ```

2. **Serverless Configuration**:

Create `serverless.yml`:

```yaml
service: capstone-generator

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    OPENROUTER_API_KEY: ${env:OPENROUTER_API_KEY}
    OPENROUTER_SITE_URL: ${env:OPENROUTER_SITE_URL}

plugins:
  - serverless-nextjs-plugin

custom:
  nextjs:
    nextConfigDir: ./
    nextConfigFile: next.config.js
```

3. **Deploy**:
   ```bash
   serverless deploy
   ```

### 6. Google Cloud Platform

#### Cloud Run

1. **Build and Deploy**:
   ```bash
   # Build container
   docker build -t gcr.io/PROJECT_ID/capstone-generator .

   # Push to registry
   docker push gcr.io/PROJECT_ID/capstone-generator

   # Deploy to Cloud Run
   gcloud run deploy capstone-generator \
     --image gcr.io/PROJECT_ID/capstone-generator \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars OPENROUTER_API_KEY=your_key
   ```

2. **Cloud Build Configuration**:

Create `cloudbuild.yaml`:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/capstone-generator', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/capstone-generator']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: [
      'run', 'deploy', 'capstone-generator',
      '--image', 'gcr.io/$PROJECT_ID/capstone-generator',
      '--region', 'us-central1',
      '--platform', 'managed',
      '--allow-unauthenticated'
    ]
```

## Production Configuration

### Next.js Configuration

Update `next.config.js` for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Optimize images
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Compression
  compress: true,
  
  // Power by header
  poweredByHeader: false,
  
  // React strict mode
  reactStrictMode: true,
  
  // SWC minification
  swcMinify: true,
};

module.exports = nextConfig;
```

### Performance Optimization

#### Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Analyze bundle
ANALYZE=true npm run build
```

#### Caching Strategy

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const requiredEnvVars = ['OPENROUTER_API_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: `Missing environment variables: ${missingVars.join(', ')}` 
        },
        { status: 500 }
      );
    }
    
    // Check OpenRouter API connectivity
    const apiKey = process.env.OPENROUTER_API_KEY;
    const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (!testResponse.ok) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'OpenRouter API connection failed' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

## Monitoring and Logging

### Application Monitoring

#### Vercel Analytics

```bash
# Install Vercel Analytics
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Sentry Integration

```bash
# Install Sentry
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

```javascript
// sentry.server.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Logging Configuration

```typescript
// lib/logger.ts
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

class Logger {
  private static instance: Logger;
  private logLevel: string;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  error(message: string, error?: Error, context?: any): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error, context);
      
      // Send to monitoring service in production
      if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
        // Sentry.captureException(error, { extra: context });
      }
    }
  }

  warn(message: string, context?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  info(message: string, context?: any): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  debug(message: string, context?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }
}

export const logger = Logger.getInstance();
```

### Performance Monitoring

```typescript
// lib/performance.ts
class PerformanceMonitor {
  static measureAPIResponse<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    return fn().finally(() => {
      const duration = performance.now() - start;
      
      // Log performance metrics
      console.log(`[PERF] ${operation} took ${duration.toFixed(2)}ms`);
      
      // Send to monitoring service
      if (process.env.NODE_ENV === 'production') {
        // analytics.track('api_performance', { operation, duration });
      }
    });
  }

  static measureComponentRender(
    componentName: string,
    renderFn: () => void
  ): void {
    const start = performance.now();
    renderFn();
    const duration = performance.now() - start;
    
    if (duration > 16) { // More than one frame
      console.warn(`[PERF] ${componentName} render took ${duration.toFixed(2)}ms`);
    }
  }
}
```

## Security Considerations

### Environment Security

```bash
# Never commit sensitive data
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
echo "*.key" >> .gitignore
```

### API Security

```typescript
// lib/security.ts
class SecurityHelper {
  static validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000',
    ].filter(Boolean);
    
    return allowedOrigins.includes(origin || '');
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  static rateLimitCheck(ip: string): boolean {
    // Implement rate limiting logic
    // This is a simplified example
    return true;
  }
}
```

### Content Security Policy

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://openrouter.ai",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

## Troubleshooting

### Common Deployment Issues

#### 1. Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

#### 2. Environment Variable Issues

```bash
# Verify environment variables are set
echo $OPENROUTER_API_KEY

# Check in application
curl https://your-domain.com/api/health
```

#### 3. API Connection Issues

```typescript
// Test OpenRouter API connection
async function testOpenRouterConnection() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });
    
    if (response.ok) {
      console.log('OpenRouter API connection successful');
    } else {
      console.error('OpenRouter API connection failed:', response.status);
    }
  } catch (error) {
    console.error('OpenRouter API connection error:', error);
  }
}
```

#### 4. Streaming Issues

```typescript
// Debug streaming problems
class StreamDebugger {
  static logStreamData(chunk: string, tokens: string[]): void {
    console.group('Stream Debug');
    console.log('Chunk length:', chunk.length);
    console.log('Tokens received:', tokens.length);
    console.log('Sample tokens:', tokens.slice(0, 3));
    console.groupEnd();
  }
}
```

### Performance Issues

#### 1. Bundle Size Optimization

```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Add to package.json
"analyze": "ANALYZE=true npm run build"
```

#### 2. Memory Usage

```typescript
// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
  });
}, 30000);
```

### Debugging Commands

```bash
# Local development with debug logging
DEBUG=* npm run dev

# Production build with source maps
npm run build
npm start

# Check application health
curl http://localhost:3000/api/health

# Test API endpoint
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test prompt"}'
```

This deployment guide provides comprehensive instructions for deploying the AI Capstone Generator application to various platforms, along with production configuration, monitoring, and troubleshooting guidance.
