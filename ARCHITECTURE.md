# Architecture Documentation

## System Overview

The AI Financial Voice Assistant is built using a modern microservices architecture with clear separation between the frontend, backend, and data layers.

## Technology Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + Passport
- **API Documentation**: Swagger/OpenAPI
- **Real-time Communication**: Socket.IO
- **AI Integration**: Google Gemini 2.5
- **Security**: Helmet, Rate Limiting, CORS

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx (for frontend)
- **Process Manager**: PM2 (optional)

## Architecture Diagrams

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Client Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │  Browser   │  │   Mobile   │  │   Voice Interface      │ │
│  │   (PWA)    │  │  App (TBD) │  │   (Smart Speakers)     │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTPS/WSS
┌────────────────────────┴─────────────────────────────────────┐
│                      API Gateway Layer                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │   Rate Limiting │ CORS │ Authentication │ Logging       │ │
│  └─────────────────────────────────────────────────────────┘ │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────────────┐
│                    Application Layer (NestJS)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │     Auth     │  │   Accounts   │  │  AI Assistant    │  │
│  │   Service    │  │   Service    │  │     Service      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Transactions │  │   Payments   │  │      Loans       │  │
│  │   Service    │  │   Service    │  │     Service      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │ TypeORM
┌────────────────────────┴─────────────────────────────────────┐
│                      Data Layer                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              PostgreSQL Database                         ││
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐     ││
│  │  │Users │  │Accts │  │Trans │  │Loans │  │ Logs │     ││
│  │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘     ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────────────┐
│                   External Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Google     │  │    Email     │  │      SMS         │  │
│  │   Gemini     │  │   Service    │  │    Service       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│ 1. User Voice Input                                      │
│    ┌──────────┐                                         │
│    │ "Transfer $100 from checking to savings"          │
│    └────────┬─────────────────────────────────────────┘
             │
             ↓
┌────────────┴────────────────────────────────────────────┐
│ 2. Frontend Processing                                   │
│    ┌──────────────────────────────────────────────────┐ │
│    │ • Capture audio via Web Audio API                │ │
│    │ • Convert to appropriate format                  │ │
│    │ • Send to backend via WebSocket                  │ │
│    └──────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────┴───────────────────────────────────┐
│ 3. AI Processing (Backend)                              │
│    ┌──────────────────────────────────────────────────┐ │
│    │ • Receive audio stream                           │ │
│    │ • Send to Google Gemini for NLP                  │ │
│    │ • Extract intent and parameters                  │ │
│    │ • Identify function call: transferFunds()        │ │
│    └──────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────┴───────────────────────────────────┐
│ 4. Business Logic Execution                             │
│    ┌──────────────────────────────────────────────────┐ │
│    │ • Validate user has sufficient funds            │ │
│    │ • Request PIN verification                       │ │
│    │ • Wait for PIN input from user                  │ │
│    └──────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────┴───────────────────────────────────┐
│ 5. Security Verification                                │
│    ┌──────────────────────────────────────────────────┐ │
│    │ • User enters PIN                                │ │
│    │ • Backend verifies PIN (bcrypt)                  │ │
│    │ • Authorize transaction                          │ │
│    └──────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────┴───────────────────────────────────┐
│ 6. Database Transaction                                  │
│    ┌──────────────────────────────────────────────────┐ │
│    │ BEGIN TRANSACTION                                │ │
│    │   • Debit checking account (-$100)               │ │
│    │   • Credit savings account (+$100)               │ │
│    │   • Create transaction records                   │ │
│    │   • Generate confirmation number                 │ │
│    │ COMMIT                                            │ │
│    └──────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────┴───────────────────────────────────┐
│ 7. Response Generation                                   │
│    ┌──────────────────────────────────────────────────┐ │
│    │ • Prepare success response                       │ │
│    │ • Generate voice response via Gemini             │ │
│    │ • Send audio back to frontend                    │ │
│    └──────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────┴───────────────────────────────────┐
│ 8. User Feedback                                         │
│    ┌──────────────────────────────────────────────────┐ │
│    │ Voice: "Transfer successful. Your checking       │ │
│    │ account now has $5,110.55"                       │ │
│    │                                                   │ │
│    │ UI: Updated account balances displayed           │ │
│    └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Module Architecture

### Backend Modules

#### Auth Module
- **Responsibility**: User authentication and authorization
- **Components**:
  - JWT Strategy & Guards
  - Local Strategy
  - OTP Service
  - Voice Biometric Service (Mock)
  - PIN Verification
- **Dependencies**: Users Module

#### Users Module
- **Responsibility**: User profile management
- **Components**:
  - User CRUD operations
  - Profile updates
  - User preferences
- **Database**: User entity

#### Accounts Module
- **Responsibility**: Bank account management
- **Components**:
  - Account creation
  - Balance management
  - Account types (Checking, Savings, Credit)
- **Database**: Account entity

#### Transactions Module
- **Responsibility**: Transaction history
- **Components**:
  - Transaction recording
  - History retrieval
  - Transaction search/filter
- **Database**: Transaction entity
- **Dependencies**: Accounts Module

#### Payments Module
- **Responsibility**: Payment processing
- **Components**:
  - Internal transfers
  - External payments
  - Payment validation
- **Dependencies**: Accounts, Transactions, Auth

#### Loans Module
- **Responsibility**: Loan information
- **Components**:
  - Loan details
  - Payment schedules
  - Interest rates
- **Database**: Loan entity

#### AI Assistant Module
- **Responsibility**: Voice assistant functionality
- **Components**:
  - Google Gemini integration
  - Function calling
  - Context management
  - WebSocket gateway
- **Dependencies**: All business modules

## Security Architecture

### Authentication Flow

```
1. User Registration
   ├─> Hash password (bcrypt)
   ├─> Generate OTP secret
   ├─> Create user record
   └─> Return success (no auto-login)

2. User Login
   ├─> Validate credentials
   ├─> Generate JWT access token (7 days)
   ├─> Generate refresh token (30 days)
   ├─> Update last login timestamp
   └─> Return tokens + user data

3. Authenticated Request
   ├─> Extract JWT from Authorization header
   ├─> Validate token signature
   ├─> Check expiration
   ├─> Load user from database
   ├─> Attach user to request
   └─> Proceed to route handler

4. Token Refresh
   ├─> Validate refresh token
   ├─> Generate new access token
   └─> Return new access token
```

### Transaction Security Flow

```
1. Transaction Request
   ├─> Validate JWT
   ├─> Parse transaction details
   └─> Request PIN

2. PIN Verification
   ├─> User submits PIN
   ├─> Hash and compare with stored PIN
   ├─> Fail if incorrect (3 attempts max)
   └─> Continue if correct

3. Business Validation
   ├─> Check account ownership
   ├─> Validate sufficient funds
   ├─> Check account limits
   └─> Validate transaction rules

4. Database Transaction
   ├─> BEGIN TRANSACTION
   ├─> Update account balances
   ├─> Create transaction records
   ├─> COMMIT or ROLLBACK
   └─> Return result

5. Audit Log
   ├─> Log transaction attempt
   ├─> Log result (success/failure)
   ├─> Log user IP and timestamp
   └─> Store for compliance
```

## Database Schema

### Entity Relationships

```
User (1) ─────< (N) Account
  │
  │
  └───────────< (N) Loan

Account (1) ───< (N) Transaction

Legend:
  (1) One
  (N) Many
```

### Key Entities

#### User
```typescript
- id: UUID (PK)
- email: string (unique)
- name: string
- password: string (hashed)
- pin: string (hashed)
- phoneNumber: string
- otpSecret: string
- voiceBiometricData: JSONB
- isActive: boolean
- isVerified: boolean
- lastLogin: timestamp
- createdAt: timestamp
- updatedAt: timestamp
```

#### Account
```typescript
- id: UUID (PK)
- userId: UUID (FK)
- type: enum (checking, savings, credit)
- accountNumber: string (unique)
- balance: decimal
- limit: decimal (nullable)
- currency: string
- isActive: boolean
- createdAt: timestamp
- updatedAt: timestamp
```

#### Transaction
```typescript
- id: UUID (PK)
- accountId: UUID (FK)
- type: enum (debit, credit)
- amount: decimal
- description: string
- referenceNumber: string (unique)
- status: enum (pending, completed, failed, reversed)
- fromAccountId: UUID (nullable)
- toAccountId: UUID (nullable)
- metadata: JSONB
- createdAt: timestamp
```

## API Design

### RESTful Principles
- Resources identified by URIs
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Stateless communication
- HATEOAS where applicable

### Response Format
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Format
```json
{
  "statusCode": 400,
  "message": "Invalid input",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/payments/transfer"
}
```

## Scalability Considerations

### Horizontal Scaling
- Stateless backend (can run multiple instances)
- Session storage in Redis (planned)
- Load balancer (nginx/HAProxy)

### Database Scaling
- Read replicas for read-heavy operations
- Connection pooling
- Query optimization with indexes

### Caching Strategy
- Redis for session management
- Application-level caching for static data
- CDN for frontend assets

### Future Enhancements
- Microservices decomposition
- Event-driven architecture (RabbitMQ/Kafka)
- Kubernetes orchestration
- Multi-region deployment

## Monitoring & Observability

### Logging
- Winston for structured logging
- Daily log rotation
- Log levels: error, warn, info, debug
- Centralized logging (ELK stack planned)

### Metrics
- Request/response times
- Error rates
- Database query performance
- API endpoint usage

### Alerts
- Error threshold exceeded
- Database connection issues
- High response times
- Failed authentication attempts

## Compliance & Privacy

### Data Protection
- Encryption at rest (database)
- Encryption in transit (TLS/SSL)
- PII data hashing (passwords, PINs)
- Secure key management

### Compliance
- GDPR considerations
- PCI DSS guidelines
- OWASP Top 10 mitigation
- Regular security audits

---

This architecture is designed to be:
- **Secure**: Multiple layers of security
- **Scalable**: Can handle growing user base
- **Maintainable**: Clear module boundaries
- **Testable**: Unit and integration tests
- **Observable**: Comprehensive logging and monitoring
