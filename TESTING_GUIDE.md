# 🧪 AI Voice Banking Assistant - Testing Guide

## ✅ Configuration Status

### Backend Configuration ✓
- **NestJS Backend**: Fully configured
- **Gemini API Key**: Set (`your_gemini_api_key_here`)
- **Environment File**: `/backend/.env` created
- **Dependencies**: Installed (952 packages)

### Frontend Configuration ✓
- **React Frontend**: Fully configured
- **API Base URL**: `http://localhost:3000/api/v1`
- **WebSocket URL**: `ws://localhost:3000`
- **Environment File**: `/frontend/.env` created

### Flutter Configuration ✓
- **Base URL**: `http://10.0.2.2:3000/api/v1` (Android Emulator)
- **WebSocket URL**: `ws://10.0.2.2:3000`
- **Permissions**: Microphone, Biometric, Internet ✓

---

## 🚀 Setup Instructions

### 1. Start PostgreSQL Database

**Option A: Using Docker (Recommended)**
```bash
docker run -d \
  --name ai-financial-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_financial_assistant \
  -p 5432:5432 \
  postgres:16-alpine
```

**Option B: Using Docker Compose**
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

**Option C: Local PostgreSQL Installation**
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE ai_financial_assistant;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE ai_financial_assistant TO postgres;
\q
```

### 2. Start NestJS Backend

```bash
cd backend

# Make sure .env file exists (already created)
cat .env

# Install dependencies (already done)
npm install

# Start in development mode
npm run start:dev

# Wait for message: "Nest application successfully started"
# Backend will be available at http://localhost:3000
```

**Expected Output:**
```
[Nest] Starting Nest application...
[Nest] AppModule dependencies initialized
[Nest] TypeOrmModule dependencies initialized
[Nest] Database connected successfully
[Nest] Seeding database...
[Nest] ✓ Created test user (demo@example.com / Password123!)
[Nest] ✓ Created accounts (checking, savings, credit)
[Nest] Nest application successfully started
[Nest] Listening on port 3000
[Nest] Swagger docs available at http://localhost:3000/api/docs
```

### 3. Start React Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will be available at http://localhost:5173
```

### 4. Start Flutter Mobile App

```bash
# In project root
flutter pub get

# Run on Android Emulator/Device
flutter run

# Or for iOS
flutter run -d ios
```

---

## 🧪 Testing the AI Voice Assistant

### Backend API Tests

#### 1. Test Health Endpoint
```bash
curl http://localhost:3000/api/v1
# Should return 404 or welcome message
```

#### 2. Test Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Password123!"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "demo@example.com",
      "name": "Demo User",
      "isActive": true
    }
  }
}
```

#### 3. Test Get Accounts (with auth)
```bash
# First login and get the access token
TOKEN="your-access-token-from-login"

curl -X GET http://localhost:3000/api/v1/accounts \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "type": "checking",
      "accountNumber": "1001234567",
      "balance": 5210.55,
      "currency": "USD",
      "isActive": true
    },
    {
      "id": "uuid",
      "type": "savings",
      "accountNumber": "2001234567",
      "balance": 15832.10,
      "currency": "USD",
      "isActive": true
    }
  ]
}
```

#### 4. Test AI Assistant Configuration
```bash
curl -X GET http://localhost:3000/api/v1/ai-assistant/config \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "systemInstruction": "You are a helpful AI financial assistant...",
    "tools": [
      {
        "name": "getAccountBalance",
        "description": "Get the balance of a specific account type"
      },
      {
        "name": "getTransactionHistory",
        "description": "Get recent transaction history"
      }
    ]
  }
}
```

---

### Frontend Testing (React)

#### 1. Open React App
```
http://localhost:5173
```

#### 2. Test Login
- Email: `demo@example.com`
- Password: `Password123!`
- Should redirect to dashboard after successful login

#### 3. Test Voice Assistant (Browser)
1. Navigate to Voice Assistant section
2. Click microphone button (browser will request microphone permission)
3. Say: "Check my balance"
4. AI should respond with account balances

**Expected Flow:**
```
User: "Check my balance"
   ↓ (Speech-to-Text)
   ↓ (Sent to backend via HTTP or WebSocket)
   ↓ (Backend processes with Gemini AI)
   ↓ (AI calls getAccountBalance function)
   ↓ (Backend returns account data)
   ↓ (Text-to-Speech in browser)
AI: "You have 3 accounts. Your checking account has $5,210.55..."
```

---

### Flutter App Testing (Mobile)

#### 1. Launch App
```bash
flutter run
```

#### 2. Login Screen
- Email: `demo@example.com`
- Password: `Password123!`
- PIN: `1234`

#### 3. Dashboard Features
- ✅ View account cards with balances
- ✅ Navigate to Accounts screen
- ✅ Navigate to Transactions screen
- ✅ Navigate to Transfer screen
- ✅ Open Voice Assistant

#### 4. Voice Assistant Testing

**Test 1: Check Balance**
1. Tap Voice Assistant FAB (floating blue button)
2. Press and hold microphone button
3. Say: "Check my balance"
4. Release button
5. App should:
   - Show transcription in blue text
   - Send request to backend
   - Display AI response
   - Speak response (if TTS enabled)

**Test 2: View Transactions**
1. Say: "Show my recent transactions"
2. AI should list recent transactions

**Test 3: Transfer Money**
1. Say: "Transfer $100 to account 2001234567"
2. AI should guide you to transfer screen
3. PIN verification dialog should appear
4. Enter PIN: `1234`
5. Transfer should be processed

---

## 🔍 Verification Checklist

### Backend ✓
- [ ] PostgreSQL running on port 5432
- [ ] NestJS backend running on port 3000
- [ ] Database seeded with demo user
- [ ] Swagger docs accessible at `/api/docs`
- [ ] Gemini API key configured
- [ ] Login endpoint working
- [ ] Accounts endpoint working
- [ ] AI Assistant config endpoint working

### Frontend (React) ✓
- [ ] React app running on port 5173
- [ ] Can login with demo credentials
- [ ] Dashboard loads properly
- [ ] API calls to backend working
- [ ] WebSocket connection established (if using voice)

### Mobile (Flutter) ✓
- [ ] Flutter app builds successfully
- [ ] Can login with demo credentials
- [ ] Dashboard shows account cards
- [ ] All navigation working
- [ ] Voice Assistant FAB visible
- [ ] Microphone permission granted
- [ ] Voice commands being sent to backend

---

## 🎯 Voice Commands to Test

### Account Queries
```
"Check my balance"
"What's my account balance?"
"Show me my checking account"
"How much is in my savings?"
"What's my total balance?"
```

### Transaction Queries
```
"Show my recent transactions"
"What did I spend last week?"
"Show me all transactions"
"Display transaction history"
```

### Transfer Commands
```
"Transfer money"
"Send $50 to my savings"
"I want to make a transfer"
"Transfer $100"
```

### Loan Queries
```
"Show my loans"
"What's my loan balance?"
"Loan information"
```

---

## 🐛 Troubleshooting

### Backend Issues

**Issue: "Unable to connect to database"**
```
Solution: Start PostgreSQL
docker run -d --name ai-financial-db -p 5432:5432 postgres:16-alpine
```

**Issue: "GEMINI_API_KEY is not defined"**
```
Solution: Check backend/.env file
cat backend/.env | grep GEMINI
```

**Issue: "Port 3000 already in use"**
```
Solution: Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Frontend Issues

**Issue: "Failed to fetch"**
```
Solution: Ensure backend is running
curl http://localhost:3000/api/v1/accounts
```

**Issue: "WebSocket connection failed"**
```
Solution: Check WebSocket URL in frontend/.env
VITE_WS_URL=ws://localhost:3000
```

### Flutter Issues

**Issue: "Connection refused 10.0.2.2:3000"**
```
Solution: Ensure backend is running on host machine
For Android Emulator, 10.0.2.2 maps to localhost
```

**Issue: "Microphone permission denied"**
```
Solution: Grant microphone permission in device settings
Settings > Apps > Aarth Saarathi > Permissions > Microphone
```

**Issue: "Voice not recognized"**
```
Solution:
1. Check microphone is working
2. Speak clearly and loudly
3. Reduce background noise
4. Check if speech_to_text service is active
```

---

## 📊 API Endpoints Reference

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/pin/verify` - Verify PIN
- `POST /auth/otp/generate` - Generate OTP
- `POST /auth/otp/verify` - Verify OTP

### Accounts
- `GET /accounts` - Get all user accounts
- `GET /accounts/:id` - Get account details
- `GET /accounts/:id/balance` - Get account balance

### Transactions
- `GET /transactions` - Get all transactions
- `GET /transactions/account/:id` - Get transactions by account
- `GET /transactions/:id` - Get transaction details

### Payments
- `POST /payments/transfer` - Transfer funds
- `POST /payments/external` - External payment

### Loans
- `GET /loans` - Get all loans
- `GET /loans/active` - Get active loans
- `GET /loans/:id` - Get loan details

### AI Assistant
- `GET /ai-assistant/config` - Get AI configuration
- `WebSocket /ai-assistant` - Real-time AI communication

---

## 🎓 Demo Credentials

**User Account:**
- Email: `demo@example.com`
- Password: `Password123!`
- PIN: `1234`

**Test Accounts:**
- Checking: Account #1001234567, Balance: $5,210.55
- Savings: Account #2001234567, Balance: $15,832.10
- Credit Card: Account #3001234567, Balance: -$750.25 (Limit: $10,000)

**OTP Secret:** Auto-generated for demo user

---

## ✅ Success Criteria

The AI Voice Banking Assistant is working correctly when:

1. ✓ Backend starts without errors
2. ✓ Database connection successful
3. ✓ User can login successfully
4. ✓ API endpoints return proper data
5. ✓ Gemini AI responds to queries
6. ✓ Voice commands are transcribed
7. ✓ AI processes banking operations
8. ✓ WebSocket communication works
9. ✓ Frontend/Mobile app connects to backend
10. ✓ End-to-end voice banking flow completes

---

## 📝 Notes

- **Gemini API Key**: Already configured in `.env` file
- **Database**: Requires PostgreSQL 12+ (Docker recommended)
- **Node.js**: Requires v18+ for backend
- **Flutter**: Requires Flutter 3.10+
- **React**: Requires Node 18+ for frontend

---

## 🚀 Quick Start Command

```bash
# Terminal 1: Start Database
docker run -d --name ai-financial-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_financial_assistant \
  -p 5432:5432 postgres:16-alpine

# Terminal 2: Start Backend
cd backend && npm run start:dev

# Terminal 3: Start Frontend (Optional)
cd frontend && npm run dev

# Terminal 4: Start Flutter App
flutter run

# Now test voice commands in the app!
```

---

**Documentation created:** November 13, 2025
**Backend Status:** ✅ Configured with Gemini API
**Frontend Status:** ✅ Configured
**Flutter Status:** ✅ Configured
**Database Status:** ⚠️ Requires PostgreSQL (Docker/Local)

For more details, see:
- `VOICE_ASSISTANT_GUIDE.md` - User guide for voice features
- `FLUTTER_README.md` - Flutter technical documentation
- `IMPLEMENTATION_SUMMARY.md` - Complete architecture overview
