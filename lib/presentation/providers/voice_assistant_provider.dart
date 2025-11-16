import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/voice_assistant_service.dart';
import '../../core/storage/secure_storage_service.dart';

class VoiceAssistantState {
  final VoiceAssistantService service;
  final bool isInitialized;
  final bool isListening;
  final bool isProcessing;
  final bool isSpeaking;
  final String? currentTranscription;
  final List<ConversationMessage> messages;
  final String? error;

  VoiceAssistantState({
    required this.service,
    this.isInitialized = false,
    this.isListening = false,
    this.isProcessing = false,
    this.isSpeaking = false,
    this.currentTranscription,
    this.messages = const [],
    this.error,
  });

  VoiceAssistantState copyWith({
    VoiceAssistantService? service,
    bool? isInitialized,
    bool? isListening,
    bool? isProcessing,
    bool? isSpeaking,
    String? currentTranscription,
    List<ConversationMessage>? messages,
    String? error,
  }) {
    return VoiceAssistantState(
      service: service ?? this.service,
      isInitialized: isInitialized ?? this.isInitialized,
      isListening: isListening ?? this.isListening,
      isProcessing: isProcessing ?? this.isProcessing,
      isSpeaking: isSpeaking ?? this.isSpeaking,
      currentTranscription: currentTranscription ?? this.currentTranscription,
      messages: messages ?? this.messages,
      error: error,
    );
  }

  bool get isActive =>
      isListening || isProcessing || isSpeaking;
}

class ConversationMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  ConversationMessage({
    required this.text,
    required this.isUser,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

class VoiceAssistantNotifier extends StateNotifier<VoiceAssistantState> {
  final SecureStorageService _storageService;

  VoiceAssistantNotifier(this._storageService)
      : super(VoiceAssistantState(service: VoiceAssistantService()));

  Future<void> initialize() async {
    try {
      // Initialize voice assistant service
      await state.service.initialize();

      // Set up callbacks
      state.service.onStateChanged = _handleStateChange;
      state.service.onTranscription = _handleTranscription;
      state.service.onResponse = _handleResponse;
      state.service.onError = _handleError;

      // Connect WebSocket with auth token
      final accessToken = await _storageService.getAccessToken();
      if (accessToken != null) {
        state.service.connectWebSocket(accessToken);
      }

      state = state.copyWith(isInitialized: true, error: null);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      print('Failed to initialize voice assistant: $e');
    }
  }

  void _handleStateChange(VoiceAssistantService serviceState) {
    state = state.copyWith(
      isListening: state.service.isListening,
      isProcessing: state.service.isProcessing,
      isSpeaking: state.service.isSpeaking,
    );
  }

  void _handleTranscription(String transcription) {
    state = state.copyWith(currentTranscription: transcription);
  }

  void _handleResponse(String response) {
    final updatedMessages = [
      ...state.messages,
      ConversationMessage(text: response, isUser: false),
    ];
    state = state.copyWith(
      messages: updatedMessages,
      currentTranscription: null,
    );
  }

  void _handleError(String error) {
    state = state.copyWith(error: error);
  }

  Future<void> startListening() async {
    if (!state.isInitialized) {
      state = state.copyWith(error: 'Voice assistant not initialized');
      return;
    }

    try {
      await state.service.startListening();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> stopListening() async {
    try {
      await state.service.stopListening();

      // Add user message to conversation
      if (state.currentTranscription != null &&
          state.currentTranscription!.isNotEmpty) {
        final updatedMessages = [
          ...state.messages,
          ConversationMessage(
            text: state.currentTranscription!,
            isUser: true,
          ),
        ];
        state = state.copyWith(messages: updatedMessages);
      }
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> speak(String text) async {
    try {
      await state.service.speak(text);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> stopSpeaking() async {
    try {
      await state.service.stopSpeaking();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  void sendTextMessage(String message) {
    if (!state.isInitialized) {
      state = state.copyWith(error: 'Voice assistant not initialized');
      return;
    }

    // Add user message to conversation
    final updatedMessages = [
      ...state.messages,
      ConversationMessage(text: message, isUser: true),
    ];
    state = state.copyWith(messages: updatedMessages);

    // Send to AI
    state.service.sendTextMessage(message);
  }

  Future<void> cancel() async {
    try {
      await state.service.cancel();
      state = state.copyWith(currentTranscription: null);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  void clearConversation() {
    state = state.copyWith(messages: []);
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  @override
  void dispose() {
    state.service.dispose();
    super.dispose();
  }
}

final voiceAssistantProvider =
    StateNotifierProvider<VoiceAssistantNotifier, VoiceAssistantState>((ref) {
  throw UnimplementedError();
});
