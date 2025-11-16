# Setup Guide - AI Financial Voice Assistant

Complete setup guide for development and production environments.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Production Setup](#production-setup)
3. [Database Configuration](#database-configuration)
4. [API Key Configuration](#api-key-configuration)
5. [Troubleshooting](#troubleshooting)

## Development Setup

### 1. System Requirements

- **Node.js**: v20.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL**: v16.x or higher ([Download](https://www.postgresql.org/download/))
- **Git**: Latest version ([Download](https://git-scm.com/downloads))
- **Docker** (Optional): Latest version ([Download](https://www.docker.com/get-started))

### 2. Clone Repository

```bash
git clone <repository-url>
cd test-v2
```

### 3. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ai_financial_assistant

# JWT
JWT_SECRET=generate-a-secure-random-string-here
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=generate-another-secure-random-string
JWT_REFRESH_EXPIRATION=30d

# Google GenAI
GEMINI_API_KEY=your-gemini-api-key-from-ai-google-dev

# OTP
OTP_SECRET=generate-secure-otp-secret

# Security
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs
```

#### Generate Secure Keys

Use Node.js to generate secure random strings:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Setup Database

**Option A: Using PostgreSQL locally**

```bash
# Create database
createdb ai_financial_assistant

# Or using psql
psql -U postgres
CREATE DATABASE ai_financial_assistant;
\q
```

**Option B: Using Docker**

```bash
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_financial_assistant \
  -p 5432:5432 \
  -d postgres:16-alpine
```

#### Run Migrations

```bash
npm run migration:run
```

#### Seed Database

```bash
npm run build
node dist/database/seed.js
```

This creates a test user:
- Email: demo@example.com
- Password: Password123!
- PIN: 1234

#### Start Backend

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Backend will be available at:
- API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/docs

### 4. Frontend Setup

#### Install Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000

# Google GenAI (optional for client-side)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

#### Start Frontend

```bash
npm run dev
```

Frontend will be available at http://localhost:5173

### 5. Verify Installation

1. Open http://localhost:5173 in your browser
2. Login with credentials:
   - Email: demo@example.com
   - Password: Password123!
3. Try voice commands or check account balances

## Production Setup

### Using Docker Compose (Recommended)

#### 1. Prepare Environment

```bash
# Create production environment files
cp backend/.env.example backend/.env.production
cp frontend/.env.example frontend/.env.production

# Edit with production values
nano backend/.env.production
nano frontend/.env.production
```

#### 2. Configure Docker Compose

Edit `docker-compose.yml` with production settings.

#### 3. Build and Deploy

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### 4. Initialize Database

```bash
# Run migrations
docker-compose exec backend npm run migration:run

# Seed database (optional for production)
docker-compose exec backend node dist/database/seed.js
```

#### 5. Setup SSL/TLS

For production, setup SSL certificates using Let's Encrypt:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Update nginx configuration to use SSL.

### Manual Production Setup

#### 1. Backend

```bash
cd backend

# Install dependencies
npm ci --only=production

# Build
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start dist/main.js --name ai-financial-backend

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

#### 2. Frontend

```bash
cd frontend

# Build production bundle
npm run build

# Serve with nginx
sudo cp -r dist/* /var/www/html/

# Configure nginx (example)
sudo nano /etc/nginx/sites-available/ai-financial
```

Nginx configuration example:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Configuration

### PostgreSQL Tuning for Production

Edit `/etc/postgresql/16/main/postgresql.conf`:

```conf
# Memory
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 4MB

# Connections
max_connections = 100

# Logging
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
```

### Backup Strategy

```bash
# Automated daily backups
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * pg_dump ai_financial_assistant > /backups/ai_financial_$(date +\%Y\%m\%d).sql
```

## API Key Configuration

### Google Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Add to `.env.local`:
   ```env
   GEMINI_API_KEY=AIza...your-key-here
   ```

### Security Best Practices

- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate keys regularly
- Use different keys for development and production
- Monitor API usage and set up alerts

## Troubleshooting

### Backend Issues

#### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -h localhost
```

#### Migration Errors

```bash
# Reset migrations (development only)
npm run typeorm schema:drop
npm run migration:run
```

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Frontend Issues

#### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors

```bash
# Type check
npm run type-check

# Clear build cache
rm -rf dist .vite
```

### Docker Issues

#### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Restart services
docker-compose restart

# Rebuild if needed
docker-compose down
docker-compose up --build
```

#### Database Connection in Docker

Ensure backend uses `postgres` as hostname (service name in docker-compose.yml):

```env
DB_HOST=postgres
```

### Voice/Audio Issues

#### Microphone Access Denied

1. Check browser permissions
2. Use HTTPS or localhost
3. Grant microphone access when prompted

#### Audio Not Playing

1. Check browser audio settings
2. Verify AudioContext is supported
3. Check console for errors

### Common Errors

#### "JWT malformed"

- Check JWT_SECRET is set correctly
- Ensure token is being sent in Authorization header
- Verify token hasn't expired

#### "CORS Error"

- Check CORS_ORIGIN in backend .env
- Ensure frontend URL matches exactly
- Include protocol (http:// or https://)

#### "Invalid API Key"

- Verify Gemini API key is correct
- Check API quota hasn't been exceeded
- Ensure API key is enabled for Gemini API

## Performance Optimization

### Backend

```typescript
// Enable compression in main.ts
import compression from 'compression';
app.use(compression());

// Add caching
import { CacheModule } from '@nestjs/cache-manager';
```

### Frontend

```bash
# Optimize build
npm run build -- --mode production

# Analyze bundle size
npm install -g vite-bundle-analyzer
npx vite-bundle-analyzer
```

### Database

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

## Monitoring and Logging

### Backend Logging

Logs are stored in `backend/logs/` directory:
- `error.log` - Error logs
- `combined.log` - All logs

### Application Monitoring

Consider integrating:
- **Sentry** for error tracking
- **Datadog** or **New Relic** for APM
- **Prometheus** + **Grafana** for metrics

## Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs` or `backend/logs/`
2. Review this guide
3. Check GitHub issues
4. Contact support team

---

For additional help, visit the [GitHub repository](https://github.com/your-repo) or contact support@example.com
