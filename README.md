# AI Financial Voice Assistant

A production-grade AI-powered financial voice assistant that enables users to perform secure banking operations through natural conversational interaction.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Backend](https://img.shields.io/badge/Backend-NestJS-red)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)
![AI](https://img.shields.io/badge/AI-Google_Gemini-orange)

## 🌟 Features

### Core Banking Operations
- ✅ **Account Management** - Check balances, view account details
- 💸 **Fund Transfers** - Secure transfers between accounts with PIN verification
- 📊 **Transaction History** - View and analyze transaction records
- 💳 **Payment Processing** - Make external payments securely
- 🏦 **Loan Information** - Access loan details, payment schedules, and interest rates

### Security & Authentication
- 🔐 **JWT Authentication** - Secure token-based authentication
- 📱 **OTP Verification** - Time-based one-time password support
- 🔢 **PIN Authorization** - Transaction-level PIN verification
- 🎤 **Voice Biometrics** - Mock voice-based authentication (production-ready architecture)
- 🛡️ **Role-Based Access Control** - Granular permission management

### AI & Voice Capabilities
- 🗣️ **Natural Language Processing** - Powered by Google Gemini 2.5
- 🎙️ **Real-time Voice Recognition** - Native audio processing
- 🔊 **Voice Synthesis** - Natural-sounding voice responses
- 🤖 **Context-Aware Conversations** - Intelligent dialogue management
- 🔧 **Function Calling** - Automated banking operations via AI

### Production-Ready Features
- 📝 **Comprehensive Logging** - Winston-based logging system
- 🐳 **Docker Support** - Full containerization with Docker Compose
- 📚 **API Documentation** - Auto-generated Swagger/OpenAPI docs
- ⚡ **Rate Limiting** - DDoS protection and abuse prevention
- 🔒 **Security Headers** - Helmet.js integration
- 🧪 **Testing Ready** - Jest configuration for unit and e2e tests

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Voice UI   │  │ Auth Module  │  │  Account Views   │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/WebSocket
┌────────────────────────┴────────────────────────────────────┐
│                    Backend (NestJS)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Auth     │  │   Accounts   │  │  AI Assistant    │  │
│  │   Module    │  │   Module     │  │     Gateway      │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │Transactions │  │   Payments   │  │      Loans       │  │
│  │   Module    │  │   Module     │  │     Module       │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ TypeORM
┌────────────────────────┴────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Users    │  │   Accounts   │  │  Transactions    │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **PostgreSQL** 16.x or higher
- **Docker** (optional, recommended)
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))

### Option 1: Docker Compose (Recommended)

1. **Clone and setup environment:**

```bash
git clone <repository-url>
cd test-v2

# Create environment files
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local

# Add your Gemini API key to backend/.env.local
echo "GEMINI_API_KEY=your-api-key-here" >> backend/.env.local
```

2. **Start all services:**

```bash
docker-compose up --build
```

3. **Seed the database:**

```bash
docker-compose exec backend npm run typeorm migration:run
docker-compose exec backend npm run seed
```

4. **Access the application:**

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api/v1
- API Documentation: http://localhost:3000/api/docs

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup database
createdb ai_financial_assistant

# Configure environment
cp .env.example .env.local
# Edit .env.local with your database credentials and API keys

# Run migrations
npm run migration:run

# Seed database
npm run build
node dist/database/seed.js

# Start development server
npm run start:dev
```

Backend will run on http://localhost:3000

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URLs

# Start development server
npm run dev
```

Frontend will run on http://localhost:5173

## 🔑 Test Credentials

After seeding the database, use these credentials:

- **Email:** demo@example.com
- **Password:** Password123!
- **PIN:** 1234

## 📚 API Documentation

Once the backend is running, visit http://localhost:3000/api/docs for the complete Swagger documentation.

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/otp/verify` - Verify OTP
- `POST /api/v1/auth/pin/verify` - Verify PIN

#### Accounts
- `GET /api/v1/accounts` - List all accounts
- `GET /api/v1/accounts/:id/balance` - Get account balance

#### Payments
- `POST /api/v1/payments/transfer` - Transfer between accounts
- `POST /api/v1/payments/external` - Make external payment

#### Transactions
- `GET /api/v1/transactions` - Get transaction history

#### Loans
- `GET /api/v1/loans` - Get all loans
- `GET /api/v1/loans/interest-rates` - Get interest rates

## 🏗️ Project Structure

```
.
├── backend/                    # NestJS backend
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── accounts/          # Account operations
│   │   ├── transactions/      # Transaction history
│   │   ├── payments/          # Payment processing
│   │   ├── loans/             # Loan information
│   │   ├── ai-assistant/      # AI voice assistant
│   │   ├── common/            # Shared utilities
│   │   ├── config/            # Configuration
│   │   └── database/          # Database entities & migrations
│   ├── test/                  # Test files
│   └── package.json
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript types
│   │   ├── hooks/             # Custom hooks
│   │   ├── contexts/          # React contexts
│   │   ├── utils/             # Utility functions
│   │   ├── config/            # Configuration
│   │   └── styles/            # CSS styles
│   ├── public/                # Static assets
│   └── package.json
│
├── docker-compose.yml         # Docker orchestration
├── Dockerfile.backend         # Backend container
├── Dockerfile.frontend        # Frontend container
└── README.md
```

## 🔒 Security Features

1. **Authentication**
   - JWT with refresh tokens
   - Bcrypt password hashing
   - OTP (Time-based One-Time Password)
   - PIN verification for transactions

2. **Authorization**
   - Role-based access control
   - Resource ownership validation
   - JWT guards on sensitive endpoints

3. **Data Protection**
   - SQL injection prevention (TypeORM)
   - XSS protection
   - CSRF protection
   - Rate limiting
   - Helmet.js security headers

4. **Voice Biometrics** (Mock Implementation)
   - Enrollment system
   - Verification process
   - Production-ready architecture

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm run test

# Coverage
npm run test:cov
```

## 📦 Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist/ folder with nginx or your preferred web server
```

### Docker Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ Development

### Code Quality

```bash
# Lint backend
cd backend && npm run lint

# Lint frontend
cd frontend && npm run lint

# Format code
npm run format
```

### Database Management

```bash
# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 🌐 Environment Variables

### Backend (.env.local)

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ai_financial_assistant
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## 📧 Support

For support, email support@example.com or open an issue in the repository.

## 🙏 Acknowledgments

- Google Gemini AI for NLP capabilities
- NestJS framework
- React ecosystem
- PostgreSQL database
- Docker for containerization

---

Built with ❤️ for secure, intelligent financial interactions
