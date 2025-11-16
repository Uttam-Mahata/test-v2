import 'package:flutter_tts/flutter_tts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../constants/app_constants.dart';

enum VoiceAssistantState {
  idle,
  listening,
  processing,
  speaking,
  error,
}

class VoiceAssistantService {
  // Speech Recognition
  final stt.SpeechToText _speechToText = stt.SpeechToText();
  bool _speechEnabled = false;
  String _lastWords = '';

  // Text to Speech
  final FlutterTts _flutterTts = FlutterTts();
  bool _ttsInitialized = false;

  // WebSocket for AI Communication
  io.Socket? _socket;
  bool _socketConnected = false;

  // State
  VoiceAssistantState _currentState = VoiceAssistantState.idle;
  Function(VoiceAssistantState)? onStateChanged;
  Function(String)? onTranscription;
  Function(String)? onResponse;
  Function(String)? onError;

  VoiceAssistantState get currentState => _currentState;
  bool get isListening => _currentState == VoiceAssistantState.listening;
  bool get isProcessing => _currentState == VoiceAssistantState.processing;
  bool get isSpeaking => _currentState == VoiceAssistantState.speaking;
  String get lastWords => _lastWords;

  // Initialize the service
  Future<void> initialize() async {
    await _initializeSpeechRecognition();
    await _initializeTextToSpeech();
    _initializeWebSocket();
  }

  // Speech Recognition Initialization
  Future<void> _initializeSpeechRecognition() async {
    try {
      // Request microphone permission
      final status = await Permission.microphone.request();
      if (!status.isGranted) {
        throw Exception('Microphone permission not granted');
      }

      _speechEnabled = await _speechToText.initialize(
        onError: (error) {
          print('Speech recognition error: ${error.errorMsg}');
          _updateState(VoiceAssistantState.error);
          onError?.call(error.errorMsg);
        },
        onStatus: (status) {
          print('Speech recognition status: $status');
          if (status == 'notListening') {
            if (_currentState == VoiceAssistantState.listening) {
              _updateState(VoiceAssistantState.processing);
            }
          }
        },
      );

      if (!_speechEnabled) {
        throw Exception('Speech recognition not available');
      }
    } catch (e) {
      print('Failed to initialize speech recognition: $e');
      rethrow;
    }
  }

  // Text to Speech Initialization
  Future<void> _initializeTextToSpeech() async {
    try {
      await _flutterTts.setLanguage('en-US');
      await _flutterTts.setSpeechRate(0.5);
      await _flutterTts.setVolume(1.0);
      await _flutterTts.setPitch(1.0);

      // Set up callbacks
      _flutterTts.setStartHandler(() {
        _updateState(VoiceAssistantState.speaking);
      });

      _flutterTts.setCompletionHandler(() {
        _updateState(VoiceAssistantState.idle);
      });

      _flutterTts.setErrorHandler((msg) {
        print('TTS error: $msg');
        _updateState(VoiceAssistantState.error);
        onError?.call(msg);
      });

      _ttsInitialized = true;
    } catch (e) {
      print('Failed to initialize TTS: $e');
      rethrow;
    }
  }

  // WebSocket Initialization
  void _initializeWebSocket() {
    try {
      // Extract the base URL without /api/v1
      final baseUrl = AppConstants.baseUrl.replaceAll('/api/v1', '');

      _socket = io.io(
        baseUrl,
        io.OptionBuilder()
            .setTransports(['websocket'])
            .disableAutoConnect()
            .setExtraHeaders({'authorization': 'Bearer TOKEN'}) // Will be set dynamically
            .build(),
      );

      _socket?.onConnect((_) {
        print('WebSocket connected');
        _socketConnected = true;
      });

      _socket?.onDisconnect((_) {
        print('WebSocket disconnected');
        _socketConnected = false;
      });

      _socket?.on('ai-response', (data) {
        print('Received AI response: $data');
        final response = data['message'] as String;
        onResponse?.call(response);
        speak(response);
      });

      _socket?.on('error', (error) {
        print('WebSocket error: $error');
        _updateState(VoiceAssistantState.error);
        onError?.call(error.toString());
      });

      _socket?.on('action-result', (data) {
        print('Action result: $data');
        // Handle banking operation results
        final message = data['message'] as String;
        onResponse?.call(message);
        speak(message);
      });
    } catch (e) {
      print('Failed to initialize WebSocket: $e');
    }
  }

  // Connect WebSocket with auth token
  void connectWebSocket(String accessToken) {
    if (_socket == null) return;

    _socket?.io.options?['extraHeaders'] = {
      'authorization': 'Bearer $accessToken',
    };

    _socket?.connect();
  }

  // Disconnect WebSocket
  void disconnectWebSocket() {
    _socket?.disconnect();
    _socketConnected = false;
  }

  // Start Listening
  Future<void> startListening() async {
    if (!_speechEnabled) {
      onError?.call('Speech recognition not available');
      return;
    }

    _lastWords = '';
    _updateState(VoiceAssistantState.listening);

    await _speechToText.listen(
      onResult: (result) {
        _lastWords = result.recognizedWords;
        onTranscription?.call(_lastWords);

        // If speech is finalized, send to AI
        if (result.finalResult) {
          _processVoiceCommand(_lastWords);
        }
      },
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 3),
      partialResults: true,
      cancelOnError: true,
    );
  }

  // Stop Listening
  Future<void> stopListening() async {
    await _speechToText.stop();
    if (_currentState == VoiceAssistantState.listening) {
      _updateState(VoiceAssistantState.idle);
    }
  }

  // Process Voice Command
  void _processVoiceCommand(String command) {
    if (command.isEmpty) return;

    _updateState(VoiceAssistantState.processing);

    if (_socketConnected && _socket != null) {
      _socket?.emit('voice-command', {
        'message': command,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } else {
      // Fallback: local processing or error
      onError?.call('Not connected to AI assistant');
      _updateState(VoiceAssistantState.idle);
    }
  }

  // Speak Response
  Future<void> speak(String text) async {
    if (!_ttsInitialized) {
      print('TTS not initialized');
      return;
    }

    _updateState(VoiceAssistantState.speaking);
    await _flutterTts.speak(text);
  }

  // Stop Speaking
  Future<void> stopSpeaking() async {
    await _flutterTts.stop();
    _updateState(VoiceAssistantState.idle);
  }

  // Update State
  void _updateState(VoiceAssistantState newState) {
    _currentState = newState;
    onStateChanged?.call(newState);
  }

  // Send a text message to AI (non-voice)
  void sendTextMessage(String message) {
    if (_socketConnected && _socket != null) {
      _socket?.emit('voice-command', {
        'message': message,
        'timestamp': DateTime.now().toIso8601String(),
      });
      _updateState(VoiceAssistantState.processing);
    } else {
      onError?.call('Not connected to AI assistant');
    }
  }

  // Cancel current operation
  Future<void> cancel() async {
    await stopListening();
    await stopSpeaking();
    _updateState(VoiceAssistantState.idle);
  }

  // Dispose
  void dispose() {
    _speechToText.cancel();
    _flutterTts.stop();
    _socket?.disconnect();
    _socket?.dispose();
  }
}
