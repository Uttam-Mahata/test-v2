# Aiven PostgreSQL Cloud Database Setup

## ⚠️ Current Status: Network Access Required

The backend has been configured to connect to Aiven PostgreSQL cloud database, but the current environment **does not have internet/network access** to reach the cloud database.

### Error Encountered
```
Error: getaddrinfo EAI_AGAIN pg-8eb1840-winners.h.aivencloud.com
```

This indicates DNS resolution failure, meaning the environment cannot reach external cloud services.

---

## ✅ What Has Been Implemented

### 1. SSL Certificate Configuration
- Created `ca-certificate.crt` with Aiven's SSL certificate
- TypeORM configured to use SSL for secure connections
- Fallback to basic SSL if certificate file is missing

### 2. Environment Variables (.env)
```bash
DB_HOST=pg-8eb1840-winners.h.aivencloud.com
DB_PORT=14690
DB_USERNAME=avnadmin
DB_PASSWORD=your_aiven_password_here
DB_DATABASE=defaultdb
DB_SSL=true
```

### 3. TypeORM Configuration Updates
- Modified `src/config/typeorm.config.ts` to handle SSL connections
- Added SSL certificate loading logic
- Support for both local and cloud databases via `DB_SSL` flag

### 4. Database Schema Auto-Initialization
TypeORM will automatically:
- Create all tables (users, accounts, transactions, loans)
- Set up foreign key relationships
- Create indexes and constraints
- Synchronize schema on startup (in development mode)

---

## 🚀 How Tables Are Initialized

### Automatic Schema Synchronization

When you connect to the Aiven database, TypeORM's `synchronize: true` (in development mode) will:

1. **Read Entity Decorators**: Analyze all entity files
2. **Generate DDL**: Create SQL CREATE TABLE statements
3. **Execute Schema Changes**: Run migrations automatically
4. **Create Relationships**: Set up foreign keys between tables

### Tables That Will Be Created

| Table | Description |
|-------|-------------|
| **users** | User accounts with authentication (email, password, PIN, OTP, voice biometrics) |
| **accounts** | Banking accounts (checking, savings, credit) with balances |
| **transactions** | Transaction history (debits, credits, transfers) |
| **loans** | Loan accounts (auto, personal, mortgage, business) |

### Seed Data

After connection is established, run:
```bash
npm run seed
```

This will populate:
- 1 demo user (demo@example.com)
- 3 accounts with balances
- 5 sample transactions
- 2 loans with payment schedules

---

## 🔧 Solutions

### Option 1: Enable Network Access (Recommended for Cloud)

**For Docker/Container Environments:**
```bash
docker run --network=host ...
```

**For Development Machines:**
- Ensure firewall allows outbound connections on port 14690
- Check if DNS resolution works: `nslookup pg-8eb1840-winners.h.aivencloud.com`
- Test connection: `telnet pg-8eb1840-winners.h.aivencloud.com 14690`

### Option 2: Switch to Local PostgreSQL

Update `.env` to use local database:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ai_financial_assistant
DB_SSL=false
```

Then restart backend:
```bash
npm run start:dev
```

### Option 3: Use PostgreSQL Connection String

Alternative connection format:
```bash
DATABASE_URL=postgresql://avnadmin:your_aiven_password_here@pg-8eb1840-winners.h.aivencloud.com:14690/defaultdb?sslmode=require
```

---

## 🧪 Testing Connection

### Method 1: Using psql CLI
```bash
psql "postgresql://avnadmin:your_aiven_password_here@pg-8eb1840-winners.h.aivencloud.com:14690/defaultdb?sslmode=require"
```

### Method 2: Using Node.js Script
```javascript
const { Client } = require('pg');

const client = new Client({
  host: 'pg-8eb1840-winners.h.aivencloud.com',
  port: 14690,
  user: 'avnadmin',
  password: 'your_aiven_password_here',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('ca-certificate.crt', 'utf8'),
  },
});

client.connect()
  .then(() => console.log('✅ Connected to Aiven PostgreSQL'))
  .catch(err => console.error('❌ Connection failed:', err));
```

### Method 3: Test Backend Connection
```bash
cd backend
npm run start:dev
```

Look for:
- ✅ Success: "Nest application successfully started"
- ❌ Failure: "Unable to connect to the database"

---

## 📋 Verification Checklist

Once network access is available:

- [ ] Backend starts without database connection errors
- [ ] TypeORM creates all 4 tables automatically
- [ ] Seed script runs successfully (`npm run seed`)
- [ ] Login API works with demo credentials
- [ ] Voice assistant can query database

---

## 🎯 Summary

**Status**: Configuration complete, waiting for network access

**What Works**:
- ✅ SSL certificate configured
- ✅ TypeORM config supports Aiven
- ✅ Environment variables set
- ✅ Schema auto-initialization ready
- ✅ Seed script ready

**What's Needed**:
- ⚠️ Network/internet access to reach Aiven cloud
- OR switch to local PostgreSQL database

**Next Step**: Provide network access or switch to local database, then backend will automatically initialize all tables.
