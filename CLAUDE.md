# CLAUDE.md - AI Financial Voice Assistant

> **Last Updated**: 2025-11-14
> **Version**: 0.0.0
> **Project Type**: React + TypeScript + Vite + Google Gemini AI

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Key Technologies](#key-technologies)
5. [Development Workflow](#development-workflow)
6. [Component Architecture](#component-architecture)
7. [API Integration](#api-integration)
8. [Type System](#type-system)
9. [Coding Conventions](#coding-conventions)
10. [Testing & Debugging](#testing--debugging)
11. [Common Tasks](#common-tasks)
12. [Security Considerations](#security-considerations)

---

## Project Overview

**AI Financial Voice Assistant** is a voice-enabled conversational banking application that allows users to:
- Check account balances (checking, savings, credit)
- View transaction history
- Transfer funds between accounts with PIN authentication
- Query financial product information (loans, interest rates, credit limits)

The application uses **Google Gemini's Live API** for real-time voice interaction, processing audio input and generating spoken responses with function calling capabilities for banking operations.

**AI Studio Link**: https://ai.studio/apps/drive/1wYrCHmXH-K087A9BuZbU0f4rmv5VTMii

---

## Architecture

### High-Level Architecture
```
┌─────────────────┐
│   User Voice    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  React Frontend (AssistantUI)           │
│  • Audio capture & playback             │
│  • Gemini Live API integration          │
│  • Real-time transcription display      │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Google Gemini Live API                 │
│  • Voice recognition                    │
│  • Natural language understanding       │
│  • Function calling                     │
│  • Text-to-speech (Zephyr voice)        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Mock Banking API (services/)           │
│  • User authentication                  │
│  • Account management                   │
│  • Transaction processing               │
│  • Financial data retrieval             │
└─────────────────────────────────────────┘
```

### Data Flow
1. **Audio Input**: User speaks → Browser captures audio → Converted to PCM format
2. **Processing**: Sent to Gemini Live API → Transcribed and processed
3. **Function Calls**: Gemini determines needed banking operations → Calls declared functions
4. **Execution**: Frontend executes function → Returns results to Gemini
5. **Response**: Gemini generates voice response → Played back to user

---

## Directory Structure

```
/
├── App.tsx                    # Main application component (login screen)
├── index.tsx                  # Application entry point
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── metadata.json              # App metadata for AI Studio
├── README.md                  # Basic setup instructions
├── .gitignore                 # Git ignore rules
│
├── components/
│   ├── AssistantUI.tsx        # Main voice assistant UI component
│   └── icons.tsx              # SVG icon components (Logo, Mic, Power, etc.)
│
├── services/
│   └── mockBankingApi.ts      # Mock banking backend API
│
├── constants.ts               # System instructions & function declarations
└── types.ts                   # TypeScript type definitions
```

---

## Key Technologies

### Frontend Stack
- **React 19.2.0**: Latest React with hooks and strict mode
- **TypeScript 5.8.2**: Strongly typed JavaScript
- **Vite 6.2.0**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS (loaded via CDN)

### AI & Audio
- **@google/genai 1.29.0**: Google Gemini AI SDK
  - Model: `gemini-2.5-flash-native-audio-preview-09-2025`
  - Voice: `Zephyr` (prebuilt voice)
  - Modalities: Audio input/output with transcription
- **Web Audio API**: Browser audio capture (16kHz) and playback (24kHz)
- **PCM Audio Encoding**: Int16 PCM format for audio transmission

### Development Tools
- **Node.js**: Required for package management
- **Vite Dev Server**: Runs on port 3000 (host: 0.0.0.0)
- **Path Aliases**: `@/*` maps to project root

---

## Development Workflow

### Initial Setup
```bash
# Install dependencies
npm install

# Create environment file
# Add GEMINI_API_KEY=your_api_key_here to .env.local

# Start development server
npm run dev
# Server runs on http://localhost:3000
```

### Available Scripts
```json
{
  "dev": "vite",           // Start dev server
  "build": "vite build",   // Build for production
  "preview": "vite preview" // Preview production build
}
```

### Environment Variables
- **GEMINI_API_KEY**: Required for Gemini API access
  - Set in `.env.local` file (gitignored)
  - Accessed as `process.env.API_KEY` in code (see vite.config.ts)

### Build Configuration
- **Vite Config** (`vite.config.ts`):
  - Defines environment variable mapping
  - Configures path aliases (`@` → project root)
  - Sets dev server port (3000) and host (0.0.0.0)
  - Uses React plugin for JSX/TSX support

---

## Component Architecture

### 1. App.tsx
**Purpose**: Root component managing authentication state

**Key Features**:
- User authentication (demo user: `user123`)
- Login form with loading states
- Conditional rendering: login screen → AssistantUI

**State Management**:
```typescript
const [user, setUser] = useState<User | null>(null)
const [userId, setUserId] = useState<string>('user123')
const [error, setError] = useState<string>('')
const [isLoading, setIsLoading] = useState<boolean>(false)
```

### 2. AssistantUI.tsx
**Purpose**: Main voice assistant interface

**Key Features**:
- Real-time voice conversation with Gemini
- Audio streaming (input: 16kHz, output: 24kHz)
- Function calling for banking operations
- PIN modal for secure transfers
- Transaction and financial info display

**State Management**:
```typescript
const [status, setStatus] = useState<AssistantStatus>(AssistantStatus.IDLE)
const [transcript, setTranscript] = useState<ChatMessage[]>([])
const [accounts, setAccounts] = useState<Account[]>([])
const [isPinModalOpen, setPinModalOpen] = useState(false)
const [pin, setPin] = useState('')
const [pendingTransfer, setPendingTransfer] = useState<PendingToolCall | null>(null)
```

**Audio Processing Flow**:
1. **Input**: MediaStream → AudioContext (16kHz) → ScriptProcessorNode → Float32Array
2. **Encoding**: Float32 → Int16 PCM → Base64 → Gemini API
3. **Output**: Base64 response → Uint8Array → AudioBuffer → playback (24kHz)

**Critical Implementation Details**:
- Uses `sessionPromiseRef` to avoid stale closures in audio callbacks
- Implements `createBlob()` helper for efficient PCM encoding
- Manages audio source queue to prevent overlapping playback
- Cleans up all audio resources on stop/unmount

### 3. icons.tsx
**Purpose**: Reusable SVG icon components

**Available Icons**:
- LogoIcon, MicIcon, PowerIcon, UserIcon
- BackspaceIcon, ArrowUpCircleIcon, ArrowDownCircleIcon
- BanknotesIcon, CreditCardIcon, ReceiptPercentIcon

**Usage Pattern**:
```tsx
<LogoIcon className="w-8 h-8 text-cyan-400" />
```

---

## API Integration

### Mock Banking API (`services/mockBankingApi.ts`)

#### Mock Data Structure
```typescript
MOCK_DATA = {
  users: [{ id: 'user123', name: 'Alex Johnson', pin: '1234' }],
  accounts: [
    { type: 'checking', balance: 5210.55 },
    { type: 'savings', balance: 15832.10 },
    { type: 'credit', balance: -750.25, limit: 10000 }
  ],
  transactions: [...], // Transaction history
  loans: [...],        // Loan details
  interestRates: {...} // Current rates
}
```

#### API Methods
All methods return Promises with artificial delays to simulate network latency.

1. **authenticate(userId: string)**: Validates user ID
2. **getAccounts(userId: string)**: Retrieves user accounts
3. **getTransactions(userId: string, accountType: string)**: Gets transaction history
4. **getFinancialProductsInfo(userId: string, productType)**: Returns loans/credit/rates
5. **transferFunds(userId, fromAccount, toAccount, amount, pin)**: Processes transfer with PIN validation

### Gemini Function Declarations (`constants.ts`)

#### Declared Functions for AI
1. **getAccountBalance**
   - Parameters: `accountType` (checking/savings/credit)
   - Returns: `{ balance: number, currency: string }`

2. **getTransactionHistory**
   - Parameters: `accountType`
   - Returns: `Transaction[]` or error

3. **transferFunds** (requires PIN)
   - Parameters: `fromAccount`, `toAccount`, `amount`
   - Triggers PIN modal → Returns success/failure message

4. **getFinancialProductsInfo**
   - Parameters: `productType` (loans/credit_limit/interest_rates)
   - Returns: Loan[], Account[], or rate object

#### System Instruction
```typescript
SYSTEM_INSTRUCTION = `You are a sophisticated, friendly, and secure financial voice assistant.
- Your primary goal is to help users with their banking needs by using the available tools.
- Be concise and clear in your responses.
- When a user asks for information, present it clearly.
- When a user wants to perform an action, use the appropriate tool.
- For sensitive operations like transfers, the application will handle security.
- Do not ask for sensitive information like PINs or passwords.
- If you don't understand a request, ask for clarification.
- You must always respond with audio.`
```

---

## Type System

### Core Types (`types.ts`)

```typescript
// User authentication
interface User {
  id: string
  name: string
  pin: string  // Used for transfer authentication
}

// Banking entities
interface Account {
  id: string
  userId: string
  type: 'checking' | 'savings' | 'credit'
  balance: number
  limit?: number
  currency: 'USD'
}

interface Transaction {
  id: string
  accountId: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
}

interface Loan {
  id: string
  userId: string
  type: 'personal' | 'auto' | 'mortgage'
  principal: number
  interestRate: number
  remainingBalance: number
  nextPaymentDate: string
  nextPaymentAmount: number
}

// UI state
enum AssistantStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  ERROR = 'ERROR'
}

interface ChatMessage {
  speaker: 'user' | 'assistant'
  text: string
  timestamp: string
  transactions?: Transaction[]
  financialInfo?: FinancialInfo
}

interface PendingToolCall {
  id: string
  name: string
  args: any
}
```

---

## Coding Conventions

### TypeScript
- **Strict Mode**: Use TypeScript's strict type checking
- **Explicit Types**: Always define function return types
- **Interface Naming**: PascalCase for interfaces (e.g., `User`, `Account`)
- **Enum Naming**: PascalCase for enums and their values

### React
- **Functional Components**: Use `React.FC` for typed components
- **Hooks**: Follow React hooks rules (useCallback, useEffect, useState)
- **Props**: Destructure props in component signatures
- **Event Handlers**: Prefix with `handle` (e.g., `handleLogin`, `handlePinSubmit`)

### Naming Conventions
- **Components**: PascalCase (e.g., `AssistantUI.tsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Variables**: camelCase (e.g., `sessionPromiseRef`, `audioContext`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SYSTEM_INSTRUCTION`)
- **Refs**: Suffix with `Ref` (e.g., `mediaStreamRef`, `sessionPromiseRef`)

### Styling
- **Tailwind Classes**: Use utility classes inline
- **Color Scheme**:
  - Primary: Cyan (cyan-400, cyan-500, cyan-600)
  - Background: Stone (stone-950, stone-900, stone-800)
  - Text: Stone shades (stone-100 to stone-500)
  - Accent: Purple (purple-400 for speaking state)
  - Error: Red (red-400, red-500)

### Code Organization
- **Imports**: Group by external → local → types
- **Component Structure**:
  1. Helper functions (outside component)
  2. Component definition
  3. State declarations
  4. Refs
  5. Effects
  6. Event handlers
  7. Render logic
- **Comments**: Use FIX: prefix for important implementation notes

---

## Testing & Debugging

### Console Logging
The application includes strategic console logs:
- `"Session opened."` - Gemini session connected
- `"Session closed."` - Session ended
- `"Conversation stopped and resources cleaned up."` - Full cleanup
- `"Session error:"` - Connection/API errors

### Common Issues & Solutions

#### 1. Audio Not Working
- **Check**: Microphone permissions granted
- **Check**: HTTPS or localhost (required for getUserMedia)
- **Debug**: Inspect `mediaStreamRef.current` and `audioContextRef.current`

#### 2. API Key Errors
- **Check**: `.env.local` file exists with `GEMINI_API_KEY`
- **Check**: Environment variable loaded in `vite.config.ts`
- **Debug**: Console should show API key is defined (don't log the key!)

#### 3. Function Calls Not Working
- **Check**: Function declarations match constants.ts
- **Check**: `sessionPromiseRef.current` is not null before sending responses
- **Debug**: Log `message.toolCall?.functionCalls` in handleServerMessage

#### 4. Audio Playback Issues
- **Issue**: Overlapping or choppy audio
- **Solution**: Uses `nextStartTimeRef` to queue audio buffers sequentially
- **Check**: `audioSourcesRef` for active sources

---

## Common Tasks

### Adding a New Banking Function

1. **Define the function declaration** in `constants.ts`:
```typescript
export const newFunctionDeclaration: FunctionDeclaration = {
  name: 'newFunction',
  description: 'What this function does',
  parameters: {
    type: Type.OBJECT,
    properties: {
      param: { type: Type.STRING, description: 'Parameter description' }
    },
    required: ['param']
  }
}
```

2. **Add to tools array** in AssistantUI.tsx (line 152):
```typescript
tools: [{functionDeclarations: [...existing, newFunctionDeclaration]}]
```

3. **Handle the function call** in `handleServerMessage()` (around line 244):
```typescript
else if (fc.name === 'newFunction') {
  const result = await bankingApi.newFunction(user.id, fc.args.param)
  // Handle result
}
```

4. **Implement backend method** in `mockBankingApi.ts`:
```typescript
newFunction: async (userId: string, param: string): Promise<any> => {
  await delay(500)
  // Implementation
}
```

### Modifying UI Styling

- **Color Changes**: Update Tailwind classes in JSX
- **Layout Changes**: Modify flex/grid classes in component render
- **Responsive Design**: Use Tailwind's `md:` and `lg:` prefixes

### Changing AI Voice or Behavior

**Voice**: Modify in AssistantUI.tsx line 148:
```typescript
speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' }}}
```

**Behavior**: Update `SYSTEM_INSTRUCTION` in constants.ts

### Adding New Account Types

1. Update `Account` type in types.ts
2. Add mock data in mockBankingApi.ts
3. Update UI rendering logic in AssistantUI.tsx

---

## Security Considerations

### Current Security Model (Development/Demo)

1. **PIN Authentication**:
   - Required for fund transfers
   - Validated server-side (mock API)
   - Not transmitted to Gemini AI
   - Demo PIN: `1234`

2. **API Key Protection**:
   - Stored in `.env.local` (gitignored)
   - Never committed to version control
   - Exposed to frontend (acceptable for demo, **NOT for production**)

3. **Mock Data**:
   - Hardcoded in application
   - No persistent storage
   - Resets on page reload

### Production Considerations ⚠️

**IMPORTANT**: This is a demonstration application. For production use:

1. **Backend API**: Replace mock API with secure backend
   - Implement proper authentication (OAuth, JWT)
   - Use HTTPS for all requests
   - Validate all inputs server-side
   - Rate limiting and abuse prevention

2. **API Key Security**:
   - **NEVER** expose Gemini API key in frontend
   - Use backend proxy for AI requests
   - Implement request signing

3. **Data Protection**:
   - Encrypt sensitive data in transit and at rest
   - Implement proper session management
   - Add audit logging for all transactions
   - Comply with financial regulations (PCI DSS, etc.)

4. **PIN Security**:
   - Never log or display PINs
   - Use secure hashing (bcrypt, Argon2)
   - Implement lockout after failed attempts
   - Consider multi-factor authentication

5. **Audio Security**:
   - Warn users about recording
   - Implement audio encryption
   - Add privacy controls
   - Comply with recording laws

---

## Development Tips for AI Assistants

### When Making Changes

1. **Read First**: Always read the relevant files before modifying
2. **Type Safety**: Ensure TypeScript types are updated when changing data structures
3. **Test Audio**: Audio changes require browser testing (can't be unit tested easily)
4. **Console Logs**: Add meaningful logs for debugging async operations
5. **Cleanup**: Always clean up refs, listeners, and audio contexts

### Common Pitfall: Stale Closures
The audio processing code uses closures that can become stale. Always use refs (`sessionPromiseRef`, not a local variable) when accessing values in async callbacks.

**Bad**:
```typescript
const session = await ai.live.connect(...)
processor.onaudioprocess = () => {
  session.sendRealtimeInput(...) // May be stale!
}
```

**Good**:
```typescript
const sessionPromise = ai.live.connect(...)
sessionPromiseRef.current = sessionPromise
processor.onaudioprocess = () => {
  sessionPromiseRef.current.then(session =>
    session.sendRealtimeInput(...)
  )
}
```

### File Modification Checklist

When modifying:
- **types.ts**: Update all usages across components
- **constants.ts**: Update function handling in AssistantUI.tsx
- **mockBankingApi.ts**: Update return type definitions and error handling
- **AssistantUI.tsx**: Test audio lifecycle thoroughly
- **vite.config.ts**: Restart dev server after changes

---

## Additional Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## Quick Reference

### Demo Credentials
- **User ID**: `user123`
- **PIN**: `1234`

### Port Configuration
- **Dev Server**: `http://localhost:3000`
- **Host**: `0.0.0.0` (accessible on network)

### Key Files to Understand First
1. `types.ts` - Understand data structures
2. `constants.ts` - See AI function definitions
3. `App.tsx` - Entry point and auth flow
4. `AssistantUI.tsx` - Core functionality

### Audio Specifications
- **Input**: 16kHz, mono, PCM Int16
- **Output**: 24kHz, mono, PCM Int16
- **Format**: Base64-encoded for transmission
- **Buffer Size**: 4096 samples

---

**Last Updated**: 2025-11-14
**Maintainer**: AI Studio
**Status**: Demo/Development (not production-ready)
