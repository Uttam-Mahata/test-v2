# Aarth Saarathi - Flutter Mobile App

Production-level Flutter mobile application for the AI Financial Voice Assistant.

## 🚀 Features Implemented

### ✅ Authentication System
- **Login Screen** - Email/password authentication with validation
- **Registration Screen** - User signup with form validation
- **Secure Token Storage** - flutter_secure_storage for JWT tokens
- **Auto Token Refresh** - Automatic refresh via Dio interceptors
- **Session Management** - Riverpod state management
- **Logout Functionality** - Clear authentication state

### ✅ Core Infrastructure
- **Clean Architecture** - Separation of concerns (Data, Domain, Presentation)
- **Dependency Injection** - Riverpod providers
- **HTTP Client** - Dio with custom interceptors
- **Error Handling** - Custom exceptions and failures
- **State Management** - Riverpod for reactive state
- **Secure Storage** - Encrypted local storage
- **Biometric Auth Service** - Ready for fingerprint/face ID integration

### ✅ Data Layer
- **Repository Pattern** - Abstract repositories with implementations
- **Data Sources** - Remote datasources with Retrofit-ready structure
- **Freezed Models** - Immutable data models
- **API Response Models** - Complete type-safe models
- **Error Handling** - Either pattern with dartz

### ✅ UI/UX
- **Material 3 Design** - Modern dark theme
- **Custom Theme** - Banking-focused color scheme
- **Responsive Layouts** - Adaptive to different screen sizes
- **Loading States** - Visual feedback for async operations
- **Error Snackbars** - User-friendly error messages
- **Form Validation** - Real-time input validation

## 📦 Dependencies

```yaml
dependencies:
  # State Management
  flutter_riverpod: ^2.4.9

  # Network & API
  dio: ^5.4.0
  retrofit: ^4.0.3
  json_annotation: ^4.8.1

  # Secure Storage
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.2

  # Biometric Authentication
  local_auth: ^2.1.8

  # Voice & Audio (Ready for implementation)
  speech_to_text: ^7.0.0
  flutter_tts: ^4.0.2
  permission_handler: ^11.1.0

  # Real-time Communication
  socket_io_client: ^2.0.3+1

  # Utils
  intl: ^0.19.0
  freezed_annotation: ^2.4.1
  dartz: ^0.10.1
  equatable: ^2.0.5

  # UI
  google_fonts: ^6.1.0
  pin_code_fields: ^8.0.1
  cached_network_image: ^3.3.1
```

## 🏗️ Project Structure

```
lib/
├── core/
│   ├── constants/          # App constants and API endpoints
│   ├── network/            # Dio client and interceptors
│   ├── storage/            # Secure storage and biometric services
│   ├── errors/             # Custom exceptions and failures
│   └── di/                 # Dependency injection
│
├── data/
│   ├── models/             # Freezed data models
│   ├── repositories/       # Repository implementations
│   └── datasources/        # Remote data sources
│
├── domain/
│   ├── entities/           # Business entities
│   ├── repositories/       # Repository interfaces
│   └── usecases/           # Business logic use cases
│
└── presentation/
    ├── providers/          # Riverpod providers
    ├── screens/            # UI screens
    │   ├── auth/           # Login, Register
    │   ├── home/           # Dashboard
    │   ├── accounts/       # Account management
    │   ├── transactions/   # Transaction history
    │   ├── payments/       # Payments and transfers
    │   └── voice_assistant/# Voice AI features
    └── widgets/            # Reusable widgets
```

## 🔧 Setup Instructions

### Prerequisites
- Flutter SDK 3.10.0 or higher
- Dart SDK
- Android Studio / VS Code with Flutter extensions
- Backend server running (see backend README)

### Installation

1. **Install Flutter dependencies:**
```bash
flutter pub get
```

2. **Configure environment:**
Edit `.env` file with your backend URL:
```env
API_BASE_URL=http://10.0.2.2:3000/api/v1  # For Android emulator
# Or http://localhost:3000/api/v1 for iOS simulator
WS_URL=ws://10.0.2.2:3000
GEMINI_API_KEY=your-gemini-api-key
```

3. **Run code generation (if needed):**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

4. **Run the app:**
```bash
# For development
flutter run

# For specific device
flutter run -d <device-id>

# For release build
flutter run --release
```

## 🔐 Test Credentials

```
Email: demo@example.com
Password: Password123!
PIN: 1234
```

## 📱 Screens Implemented

### ✅ Authentication
- **Login Screen** (`lib/presentation/screens/auth/login_screen.dart`)
  - Email/password form
  - Form validation
  - Demo credentials display
  - Loading states
  - Error handling

- **Register Screen** (`lib/presentation/screens/auth/register_screen.dart`)
  - Full name, email, phone, password, PIN
  - Comprehensive validation
  - Password visibility toggle
  - Success/error feedback

### ✅ Home
- **Dashboard Screen** (`lib/presentation/screens/home/dashboard_screen.dart`)
  - Welcome message with user name
  - Quick action cards (Transfer, Pay Bills, Voice, Transactions)
  - Account overview cards (Checking, Savings, Credit)
  - Logout functionality
  - Info banner

## 🔄 State Management with Riverpod

### Auth Provider
```dart
// Access auth state
final authState = ref.watch(authProvider);

// Login
await ref.read(authProvider.notifier).login(email, password);

// Logout
await ref.read(authProvider.notifier).logout();

// Verify PIN
await ref.read(authProvider.notifier).verifyPin(pin);
```

## 🌐 API Integration

### Dio Client Configuration
- Base URL from environment
- 30-second timeout
- Automatic token injection
- Token refresh on 401
- Error interceptor with custom exceptions
- Pretty logging in debug mode

### Making API Calls
```dart
// Example: Login
final authRepo = ref.read(authRepositoryProvider);
final result = await authRepo.login(email, password);

result.fold(
  (failure) => // Handle error,
  (response) => // Handle success,
);
```

## 🔒 Security Features

1. **Secure Token Storage**
   - Encrypted storage using flutter_secure_storage
   - Android: EncryptedSharedPreferences
   - iOS: Keychain

2. **Automatic Token Refresh**
   - Intercepts 401 responses
   - Refreshes token automatically
   - Retries failed request

3. **Biometric Authentication** (Ready for implementation)
   - Service already configured
   - Supports fingerprint and face ID
   - Easy to enable in settings

4. **PIN Verification**
   - 4-digit PIN for sensitive operations
   - Backend validation
   - Secure transmission

## 🎨 Theme & Design

- **Color Scheme:**
  - Primary: Cyan (#06b6d4)
  - Background: Stone 950 (#0c0a09)
  - Surface: Stone 900 (#1c1917)
  - Card Border: Stone 800 (#292524)

- **Typography:** Inter font family (Google Fonts)
- **Design System:** Material 3
- **Theme:** Dark mode optimized

## 🚧 Pending Features

The foundation is complete. Ready to implement:

### Account Management
- [ ] Account details screen
- [ ] Account creation
- [ ] Account settings
- [ ] Balance refresh

### Transactions
- [ ] Transaction list screen
- [ ] Transaction details
- [ ] Filter and search
- [ ] Export transactions

### Payments & Transfers
- [ ] Transfer between accounts screen
- [ ] External payment screen
- [ ] Beneficiary management
- [ ] Payment history
- [ ] PIN verification dialog

### Voice Assistant
- [ ] Voice assistant screen
- [ ] Speech-to-text integration
- [ ] Text-to-speech responses
- [ ] Real-time audio visualization
- [ ] WebSocket connection for AI
- [ ] Context-aware conversations

### Loans
- [ ] Loan list screen
- [ ] Loan details
- [ ] Payment schedule
- [ ] Interest calculator

### Profile & Settings
- [ ] User profile screen
- [ ] Edit profile
- [ ] Change PIN
- [ ] Enable biometric authentication
- [ ] Theme selection
- [ ] Language preferences

### Additional Features
- [ ] Push notifications
- [ ] In-app messaging
- [ ] Bill reminders
- [ ] Spending analytics
- [ ] Budget tracking
- [ ] Transaction categories

## 📦 Build & Deploy

### Android
```bash
# Build APK
flutter build apk --release

# Build App Bundle
flutter build appbundle --release
```

### iOS
```bash
# Build IPA
flutter build ipa --release
```

## 🧪 Testing

```bash
# Run unit tests
flutter test

# Run widget tests
flutter test test/widget_test.dart

# Run integration tests
flutter drive --target=test_driver/app.dart
```

## 🐛 Debugging

### Common Issues

1. **API Connection Failed**
   - Check backend is running
   - Verify API_BASE_URL in .env
   - For Android emulator, use `10.0.2.2` instead of `localhost`

2. **Dependencies Error**
   ```bash
   flutter clean
   flutter pub get
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

3. **Code Generation Issues**
   - Delete `.dart_tool` folder
   - Run `flutter pub get`
   - Run build_runner again

## 📚 Code Generation

The app uses code generation for:
- **Freezed** - Immutable data classes
- **JSON Serializable** - JSON parsing
- **Riverpod Generator** - Provider generation (ready to use)

Generate code:
```bash
flutter pub run build_runner watch  # Auto-generate on file changes
# or
flutter pub run build_runner build  # One-time generation
```

## 🔗 Backend Integration

This Flutter app integrates with the NestJS backend:
- Base URL: `http://localhost:3000/api/v1`
- WebSocket: `ws://localhost:3000`
- Swagger Docs: `http://localhost:3000/api/docs`

See `backend/README.md` for backend setup.

## 📖 Additional Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Riverpod Documentation](https://riverpod.dev/)
- [Dio Documentation](https://pub.dev/packages/dio)
- [Freezed Documentation](https://pub.dev/packages/freezed)

## 🤝 Contributing

1. Follow Flutter style guide
2. Use Riverpod for state management
3. Implement proper error handling
4. Add comments for complex logic
5. Test on both Android and iOS

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Flutter**

For questions or issues, please refer to the main project README.
