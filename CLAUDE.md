# CLAUDE.md - AI Financial Voice Assistant

## Project Overview

**Name:** AI Financial Voice Assistant
**Type:** Voice-enabled banking application
**Stack:** React 19.2, TypeScript 5.8, Vite 6.2, Google Gemini AI
**Purpose:** A conversational AI assistant for secure banking operations allowing users to check balances, transfer funds, and view transaction history using voice interactions.

---

## Architecture

### Technology Stack

- **Frontend Framework:** React 19.2 with TypeScript
- **Build Tool:** Vite 6.2
- **AI Integration:** Google Gemini AI (gemini-2.5-flash-native-audio-preview-09-2025)
- **Audio Processing:** Web Audio API with custom PCM encoding/decoding
- **State Management:** React Hooks (useState, useRef, useEffect, useCallback)
- **Styling:** Tailwind CSS (utility classes inline)

### Key Dependencies

```json
{
  "@google/genai": "^1.29.0",     // Gemini AI SDK with Live API support
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "@vitejs/plugin-react": "^5.0.0",
  "typescript": "~5.8.2"
}
```

---

## Directory Structure

```
/home/user/test-v2/
├── components/
│   ├── AssistantUI.tsx       # Main voice assistant interface
│   └── icons.tsx             # SVG icon components
├── services/
│   └── mockBankingApi.ts     # Mock banking API with CRUD operations
├── App.tsx                   # Root component with authentication
├── types.ts                  # TypeScript type definitions
├── constants.ts              # Gemini AI configuration and function declarations
├── index.tsx                 # Application entry point
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
├── metadata.json             # App metadata and permissions
└── .gitignore                # Git ignore rules
```

---

## Core Components

### 1. App.tsx (`/home/user/test-v2/App.tsx`)

**Purpose:** Root component managing authentication flow
**Responsibilities:**
- User authentication with mock banking API
- Login form rendering
- State management for user session
- Routing between login and assistant views

**Key State:**
- `user: User | null` - Currently authenticated user
- `userId: string` - Input field for user ID
- `error: string` - Authentication error messages
- `isLoading: boolean` - Loading state during authentication

**Flow:**
1. User enters User ID (default: "user123")
2. App calls `bankingApi.authenticate(userId)`
3. On success: renders `<AssistantUI>`, on failure: shows error

### 2. AssistantUI.tsx (`/home/user/test-v2/components/AssistantUI.tsx`)

**Purpose:** Main voice assistant interface
**Responsibilities:**
- Microphone input capture and audio streaming
- Gemini AI Live API integration
- Real-time audio playback of AI responses
- Function calling for banking operations
- PIN verification for sensitive operations
- Transaction history display

**Key State:**
- `status: AssistantStatus` - Current assistant state (IDLE, LISTENING, THINKING, SPEAKING, ERROR)
- `transcript: ChatMessage[]` - Conversation history
- `accounts: Account[]` - User's bank accounts
- `isPinModalOpen: boolean` - PIN modal visibility
- `pendingTransfer: PendingToolCall | null` - Transfer awaiting PIN

**Audio Processing:**
- Input: 16kHz PCM audio from microphone → Gemini AI
- Output: 24kHz PCM audio from Gemini AI → Web Audio API playback
- Uses ScriptProcessorNode for real-time audio capture
- Custom `encode()` and `decode()` functions for base64 audio conversion

**Function Calling Flow:**
1. User speaks request (e.g., "Transfer $100 from checking to savings")
2. Gemini AI processes audio and invokes appropriate function
3. App receives `toolCall` message with function name and arguments
4. For transfers: opens PIN modal; for queries: executes immediately
5. Results sent back to Gemini AI as `toolResponse`
6. AI synthesizes spoken response

### 3. mockBankingApi.ts (`/home/user/test-v2/services/mockBankingApi.ts`)

**Purpose:** Simulates backend banking operations
**Mock Data:**
- Users: `user123` (Alex Johnson, PIN: 1234)
- Accounts: checking ($5,210.55), savings ($15,832.10), credit (-$750.25)
- Transactions: 5 sample transactions across accounts
- Loans: Auto loan ($12,543.89 remaining) + Personal loan ($1,200.50 remaining)
- Interest rates: savings, auto-loan, personal-loan, mortgage

**API Methods:**
- `authenticate(userId)` - Validates user credentials
- `getAccounts(userId)` - Returns user's accounts
- `getTransactions(userId, accountType)` - Returns transaction history
- `getFinancialProductsInfo(userId, productType)` - Returns loans/credit/rates
- `transferFunds(userId, from, to, amount, pin)` - Executes transfer with PIN

**Conventions:**
- All methods are async with artificial delays (500-1500ms)
- Returns error objects for invalid requests: `{ error: string }`
- Transfers generate confirmation numbers: `TXN{timestamp}`

---

## Type System

### Core Types (`/home/user/test-v2/types.ts`)

```typescript
User              // id, name, pin
Account           // id, userId, type, balance, limit?, currency
Transaction       // id, accountId, date, description, amount, type
Loan              // id, userId, type, principal, interestRate, remainingBalance, etc.
FinancialInfo     // loans?, creditAccounts?, interestRates?
AssistantStatus   // IDLE | LISTENING | THINKING | SPEAKING | ERROR
ChatMessage       // speaker, text, timestamp, transactions?, financialInfo?
PendingToolCall   // id, name, args
```

**Type Conventions:**
- Account types: `'checking' | 'savings' | 'credit'`
- Transaction types: `'debit' | 'credit'`
- Loan types: `'personal' | 'auto' | 'mortgage'`
- Currency: Always `'USD'` (hardcoded)

---

## Gemini AI Integration

### Configuration (`/home/user/test-v2/constants.ts`)

**System Instruction:**
```
You are a sophisticated, friendly, and secure financial voice assistant.
- Help users with banking needs using available tools
- Be concise and clear in responses
- Present information clearly when requested
- Use appropriate tools for actions
- Application handles security for sensitive operations
- Never ask for PINs or passwords
- Ask for clarification if unclear
- Always respond with audio
```

**Function Declarations:**

1. **getAccountBalance**
   - Parameters: `accountType` (string)
   - Purpose: Get balance for checking/savings/credit accounts

2. **getTransactionHistory**
   - Parameters: `accountType` (string)
   - Purpose: Retrieve transaction history for an account

3. **transferFunds**
   - Parameters: `fromAccount` (string), `toAccount` (string), `amount` (number)
   - Purpose: Transfer funds between user's accounts

4. **getFinancialProductsInfo**
   - Parameters: `productType` ('loans' | 'credit_limit' | 'interest_rates')
   - Purpose: Get loan details, credit limits, or interest rate information

### Live API Session

**Model:** `gemini-2.5-flash-native-audio-preview-09-2025`
**Response Modality:** AUDIO only
**Voice:** Zephyr (prebuilt voice)
**Features:**
- Input audio transcription enabled
- Output audio transcription enabled
- Real-time function calling
- Streaming audio responses

---

## Development Workflows

### Environment Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   Create `.env.local` with:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:3000

4. **Build for production:**
   ```bash
   npm run build
   ```

### Configuration Details

**Vite Config (`vite.config.ts:5-23`):**
- Server port: 3000
- Server host: 0.0.0.0 (accessible externally)
- Path alias: `@/*` maps to project root
- Environment variables exposed as `process.env.GEMINI_API_KEY`

**TypeScript Config (`tsconfig.json:1-29`):**
- Target: ES2022
- Module: ESNext
- JSX: react-jsx (React 19 automatic runtime)
- Module resolution: bundler
- Path mapping: `@/*` → `./*`
- Experimental decorators enabled

---

## Code Conventions

### React Patterns

1. **Functional Components:** Always use function components with hooks
   ```typescript
   const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
     // component logic
   };
   ```

2. **Hook Usage:**
   - `useState` for reactive state
   - `useRef` for non-reactive values (audio contexts, sessions)
   - `useEffect` for side effects (fetching accounts on mount)
   - `useCallback` for memoized callbacks (prevent re-renders)

3. **State Management:**
   - Local component state (no global state library)
   - Lift state up when sharing between components
   - Use refs for values that shouldn't trigger re-renders

### TypeScript Conventions

1. **Explicit Typing:**
   - Always type function parameters and return values
   - Use interface definitions from `types.ts`
   - Avoid `any` except in edge cases (e.g., mock API `any` returns)

2. **Type Assertions:**
   - Use `as` for type assertions (e.g., `process.env.API_KEY as string`)
   - Prefer type guards over assertions when possible

3. **Null Safety:**
   - Use optional chaining: `user?.name`
   - Use nullish coalescing: `value ?? defaultValue`
   - Check for null/undefined before operations

### Styling Conventions

1. **Tailwind CSS:** All styles via utility classes
2. **Color Scheme:**
   - Background: stone-950, stone-900
   - Text: stone-100, stone-300, stone-400
   - Primary: cyan-600, cyan-500, cyan-400
   - Error: red-400
3. **Responsive:** Mobile-first design with `min-h-screen` layouts

### File Organization

1. **Imports Order:**
   - React imports first
   - Third-party libraries
   - Local type imports
   - Local component/service imports
   - Constants/config imports

2. **Component Structure:**
   - Helper functions at top (encode, decode, createBlob)
   - Component definition
   - Hooks (useState, useRef, useEffect)
   - Event handlers
   - Render logic

---

## Common Development Tasks

### Adding a New Banking Feature

1. **Define types** in `types.ts`
2. **Add mock data** to `services/mockBankingApi.ts`
3. **Create API method** in `bankingApi` object
4. **Add function declaration** in `constants.ts`
5. **Handle function call** in `AssistantUI.tsx` message listener
6. **Update UI** to display results

Example: Adding bill payment feature
```typescript
// 1. types.ts
export interface Bill {
  id: string;
  payee: string;
  amount: number;
  dueDate: string;
}

// 2. mockBankingApi.ts
bills: [
  { id: 'bill_001', payee: 'Electric Company', amount: 120.50, dueDate: '2024-08-01' }
],

payBill: async (userId, billId, pin) => {
  // implementation
}

// 3. constants.ts
export const payBillDeclaration: FunctionDeclaration = {
  name: 'payBill',
  description: 'Pay a bill from checking account',
  parameters: { /* ... */ }
};

// 4. AssistantUI.tsx - add to tools array and handle in message listener
```

### Modifying Voice Assistant Behavior

**Edit system instruction** in `constants.ts:4-12`:
- Keep instructions concise
- Focus on tool usage guidance
- Include security reminders
- Maintain conversational tone

**Change voice:**
Edit `AssistantUI.tsx:148`:
```typescript
speechConfig: {
  voiceConfig: {
    prebuiltVoiceConfig: {
      voiceName: 'Puck' // or 'Charon', 'Kore', 'Fenrir', 'Aoede'
    }
  }
}
```

### Debugging Audio Issues

1. **Check microphone permissions:** Browser must have microphone access
2. **Verify API key:** Check `.env.local` has valid `GEMINI_API_KEY`
3. **Inspect console logs:**
   - "Audio is starting to play" - playback initiated
   - "Audio source ended" - playback completed
   - "Conversation stopped" - cleanup successful
4. **Test sample rates:**
   - Input: 16kHz (AudioContext sample rate)
   - Output: 24kHz (Gemini returns 24kHz audio)

### Working with Mock Data

**Location:** `services/mockBankingApi.ts:5-37`

**Modifying user:**
```typescript
users: [
  { id: 'user123', name: 'Your Name', pin: '1234' },
  { id: 'user456', name: 'Test User', pin: '5678' } // add new user
],
```

**Adding accounts:**
```typescript
accounts: [
  { id: 'acc_inv_001', userId: 'user123', type: 'investment', balance: 50000, currency: 'USD' }
  // Remember to add 'investment' to Account type union
],
```

**Adding transactions:**
```typescript
transactions: [
  {
    id: 'txn_006',
    accountId: 'acc_chk_001',
    date: '2024-07-21',
    description: 'Coffee Shop',
    amount: 5.50,
    type: 'debit'
  }
],
```

---

## Security Considerations

### Current Security Model

1. **PIN Verification:**
   - Transfers require 4-digit PIN
   - PIN stored in mock data (NOT production-safe)
   - Verification happens in `transferFunds` API method

2. **Authentication:**
   - Simple user ID lookup (demo only)
   - No password required (NOT production-safe)
   - Session stored in React state (client-side only)

3. **API Key Protection:**
   - Gemini API key in `.env.local`
   - **WARNING:** Current setup exposes API key in client bundle
   - Vite `define` makes it accessible in browser (security risk)

### Production Recommendations

**DO NOT use this security model in production. Required changes:**

1. **Backend API:** Move banking operations to secure server
2. **JWT Authentication:** Implement proper token-based auth
3. **API Key Protection:** Call Gemini from backend, not client
4. **HTTPS:** Require SSL/TLS for all communications
5. **Rate Limiting:** Prevent abuse of AI endpoints
6. **Input Validation:** Sanitize all user inputs
7. **Audit Logging:** Track all financial operations

---

## Testing Strategy

### Manual Testing Checklist

**Authentication:**
- [ ] Login with valid user ID (user123)
- [ ] Login with invalid user ID
- [ ] Verify user name displays correctly

**Voice Interaction:**
- [ ] Microphone permission requested
- [ ] Status changes: IDLE → LISTENING → THINKING → SPEAKING
- [ ] Audio plays from assistant
- [ ] Transcript updates in real-time

**Banking Operations:**
- [ ] "What's my checking balance?" returns correct amount
- [ ] "Show me my savings transactions" displays transaction list
- [ ] "Transfer $100 from checking to savings" opens PIN modal
- [ ] Correct PIN (1234) completes transfer
- [ ] Incorrect PIN shows error
- [ ] "What loans do I have?" returns loan information

**UI/UX:**
- [ ] Account cards display correct balances
- [ ] Positive/negative balances styled appropriately
- [ ] PIN modal appears/closes correctly
- [ ] Logout clears session
- [ ] Conversation can be stopped mid-stream

### Debugging Commands

```bash
# Check for TypeScript errors
npx tsc --noEmit

# View Vite dev server logs
npm run dev

# Build and check for errors
npm run build

# Preview production build
npm run preview
```

---

## AI Assistant Guidelines

### When Working on This Codebase

1. **Always preserve the audio processing logic** - It's complex and working correctly
2. **Test function declarations carefully** - Gemini AI requires exact parameter schemas
3. **Maintain type safety** - This prevents runtime errors in production
4. **Keep system instructions concise** - Verbose instructions degrade AI performance
5. **Handle async operations properly** - Banking API uses delays to simulate network
6. **Clean up audio resources** - Prevent memory leaks by stopping audio contexts
7. **Update mock data consistently** - Ensure IDs, userIds, and accountIds match

### Code Modification Priorities

**High Priority:**
- User-facing features
- Banking operation accuracy
- Audio quality and reliability
- Type safety

**Medium Priority:**
- UI/UX improvements
- Error handling
- Loading states
- Accessibility

**Low Priority:**
- Code comments
- Console logs
- Performance optimizations (unless critical)

### Common Pitfalls to Avoid

1. **Don't break the Live API connection** - Session management is delicate
2. **Don't modify audio encoding without testing** - PCM conversion must be exact
3. **Don't add new dependencies without reason** - Keep bundle size small
4. **Don't skip PIN verification** - Even in demo, maintain security flow
5. **Don't remove error handling** - Voice input is unpredictable

### Suggested Improvements

**Short-term:**
- Add loading spinners during API calls
- Improve error messages for failed transfers
- Add keyboard shortcuts for common actions
- Implement conversation history persistence

**Medium-term:**
- Add unit tests for banking API
- Implement proper session management
- Add analytics for voice command success rates
- Support multiple languages

**Long-term:**
- Backend API integration
- Real authentication system
- Multi-factor authentication
- Budget planning features
- Investment portfolio tracking

---

## Git Workflow

### Branch Strategy

**Main Branch:** `main` (production-ready code)
**Development Branch:** `claude/claude-md-mhylutcrg2cjim0p-01YUByQJJA1vcBxU9YnhBbss`

### Commit Conventions

```
feat: Add new feature
fix: Fix bug
refactor: Code refactoring
docs: Documentation changes
style: Code style changes
test: Test additions
chore: Build process or auxiliary tool changes
```

**Example:**
```bash
git add .
git commit -m "feat: Add bill payment functionality"
git push -u origin claude/claude-md-mhylutcrg2cjim0p-01YUByQJJA1vcBxU9YnhBbss
```

### Git Operations Best Practices

**Pushing:**
```bash
# Always use -u flag for new branches
git push -u origin <branch-name>

# Branch names MUST start with 'claude/' and end with session ID
# Otherwise: 403 error
```

**Pulling:**
```bash
# Prefer specific branches
git fetch origin <branch-name>
git pull origin <branch-name>
```

**Network Issues:**
- Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
- Apply to both push and fetch/pull operations

---

## Quick Reference

### File Locations

- **Main app entry:** `index.tsx:1-15`
- **Root component:** `App.tsx:8-75`
- **Voice assistant:** `components/AssistantUI.tsx:67-end`
- **Types:** `types.ts:1-63`
- **Gemini config:** `constants.ts:1-82`
- **Banking API:** `services/mockBankingApi.ts:41-105`
- **Icons:** `components/icons.tsx`

### Environment Variables

```bash
GEMINI_API_KEY=your_key_here  # Required for AI functionality
```

### NPM Scripts

```json
{
  "dev": "vite",           // Development server (localhost:3000)
  "build": "vite build",   // Production build
  "preview": "vite preview" // Preview production build
}
```

### Default Login Credentials

**User ID:** `user123`
**PIN:** `1234`
**User Name:** Alex Johnson

### Account Balances (as of mock data)

- Checking: $5,210.55
- Savings: $15,832.10
- Credit: -$750.25 (limit: $10,000)

---

## Support and Resources

### Official Documentation

- **React 19:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Vite:** https://vite.dev/
- **Gemini API:** https://ai.google.dev/gemini-api/docs
- **Web Audio API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

### AI Studio Link

**View in AI Studio:** https://ai.studio/apps/drive/1wYrCHmXH-K087A9BuZbU0f4rmv5VTMii

### Troubleshooting

**Issue:** Microphone not working
**Solution:** Check browser permissions, ensure HTTPS or localhost

**Issue:** API key error
**Solution:** Verify `.env.local` exists with valid `GEMINI_API_KEY`

**Issue:** Audio not playing
**Solution:** Check browser audio permissions, verify speaker output

**Issue:** Function calls failing
**Solution:** Check function declaration schema matches call arguments

**Issue:** Build failing
**Solution:** Run `npm install`, check for TypeScript errors

---

## Version History

**v0.0.0** - Initial setup (2024-07-20)
- React + TypeScript + Vite project scaffolding
- Gemini AI Live API integration
- Mock banking API implementation
- Voice assistant UI with real-time transcription
- PIN-protected fund transfers
- Account balance and transaction history features

---

**Last Updated:** 2025-11-14
**Maintained By:** AI Assistant
**License:** Private (as per package.json)
