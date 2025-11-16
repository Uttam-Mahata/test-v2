import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:audio_waveforms/audio_waveforms.dart';
import '../../providers/voice_assistant_provider.dart';

class VoiceAssistantScreen extends ConsumerStatefulWidget {
  const VoiceAssistantScreen({super.key});

  @override
  ConsumerState<VoiceAssistantScreen> createState() =>
      _VoiceAssistantScreenState();
}

class _VoiceAssistantScreenState extends ConsumerState<VoiceAssistantScreen>
    with TickerProviderStateMixin {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late AnimationController _listeningAnimationController;
  late Animation<double> _listeningAnimation;

  @override
  void initState() {
    super.initState();

    // Initialize voice assistant if not already
    Future.microtask(() {
      final voiceState = ref.read(voiceAssistantProvider);
      if (!voiceState.isInitialized) {
        ref.read(voiceAssistantProvider.notifier).initialize();
      }
    });

    _listeningAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);

    _listeningAnimation = Tween<double>(begin: 0.8, end: 1.2).animate(
      CurvedAnimation(
        parent: _listeningAnimationController,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    _listeningAnimationController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final voiceState = ref.watch(voiceAssistantProvider);
    final timeFormat = DateFormat('h:mm a');

    // Auto-scroll when new messages arrive
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (voiceState.messages.isNotEmpty) {
        _scrollToBottom();
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Aarth Saarathi',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              voiceState.isActive
                  ? _getStatusText(voiceState)
                  : 'AI Voice Assistant',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: Colors.grey.shade400,
              ),
            ),
          ],
        ),
        elevation: 0,
        actions: [
          if (voiceState.messages.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: () {
                _showClearConversationDialog();
              },
            ),
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () {
              _showHelpDialog();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Error Banner
          if (voiceState.error != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              color: Colors.red.shade900.withOpacity(0.3),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.red),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      voiceState.error!,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: Colors.red.shade300,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 18),
                    onPressed: () {
                      ref.read(voiceAssistantProvider.notifier).clearError();
                    },
                  ),
                ],
              ),
            ),

          // Messages List
          Expanded(
            child: voiceState.messages.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.mic_none,
                          size: 80,
                          color: Colors.grey.shade700,
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'Voice Banking Assistant',
                          style: GoogleFonts.inter(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 48),
                          child: Text(
                            'Tap the microphone to start a conversation or type your message below',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: Colors.grey.shade500,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 32),
                        _buildSuggestionChips(),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: voiceState.messages.length,
                    itemBuilder: (context, index) {
                      final message = voiceState.messages[index];
                      return _MessageBubble(
                        message: message,
                        timeFormat: timeFormat,
                      );
                    },
                  ),
          ),

          // Current Transcription
          if (voiceState.currentTranscription != null &&
              voiceState.currentTranscription!.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.shade900.withOpacity(0.2),
                border: Border(
                  top: BorderSide(color: Colors.grey.shade800),
                ),
              ),
              child: Row(
                children: [
                  AnimatedBuilder(
                    animation: _listeningAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _listeningAnimation.value,
                        child: Icon(
                          Icons.mic,
                          color: Colors.blue.shade400,
                          size: 24,
                        ),
                      );
                    },
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      voiceState.currentTranscription!,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: Colors.blue.shade300,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // Input Area
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade900.withOpacity(0.5),
              border: Border(
                top: BorderSide(color: Colors.grey.shade800),
              ),
            ),
            child: Row(
              children: [
                // Text Input
                Expanded(
                  child: TextField(
                    controller: _textController,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Colors.grey.shade800,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 12,
                      ),
                    ),
                    enabled: !voiceState.isActive,
                    onSubmitted: (text) {
                      if (text.isNotEmpty) {
                        ref
                            .read(voiceAssistantProvider.notifier)
                            .sendTextMessage(text);
                        _textController.clear();
                      }
                    },
                  ),
                ),
                const SizedBox(width: 12),

                // Voice Button
                GestureDetector(
                  onLongPressStart: (_) {
                    ref.read(voiceAssistantProvider.notifier).startListening();
                  },
                  onLongPressEnd: (_) {
                    ref.read(voiceAssistantProvider.notifier).stopListening();
                  },
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: voiceState.isActive
                          ? const LinearGradient(
                              colors: [
                                Color(0xFF06b6d4),
                                Color(0xFF0891b2),
                              ],
                            )
                          : LinearGradient(
                              colors: [
                                Colors.grey.shade800,
                                Colors.grey.shade700,
                              ],
                            ),
                      boxShadow: voiceState.isActive
                          ? [
                              BoxShadow(
                                color:
                                    const Color(0xFF06b6d4).withOpacity(0.5),
                                blurRadius: 20,
                                spreadRadius: 2,
                              ),
                            ]
                          : null,
                    ),
                    child: Icon(
                      voiceState.isListening
                          ? Icons.mic
                          : voiceState.isProcessing
                              ? Icons.hourglass_empty
                              : voiceState.isSpeaking
                                  ? Icons.volume_up
                                  : Icons.mic_none,
                      color: Colors.white,
                      size: 28,
                    ),
                  ),
                ),

                const SizedBox(width: 8),

                // Send Button
                IconButton(
                  onPressed: () {
                    final text = _textController.text;
                    if (text.isNotEmpty) {
                      ref
                          .read(voiceAssistantProvider.notifier)
                          .sendTextMessage(text);
                      _textController.clear();
                    }
                  },
                  icon: const Icon(Icons.send),
                  color: const Color(0xFF06b6d4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestionChips() {
    final suggestions = [
      'Check my balance',
      'Recent transactions',
      'Transfer money',
      'Pay bills',
      'Loan information',
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      alignment: WrapAlignment.center,
      children: suggestions.map((suggestion) {
        return ActionChip(
          label: Text(
            suggestion,
            style: GoogleFonts.inter(fontSize: 12),
          ),
          onPressed: () {
            ref
                .read(voiceAssistantProvider.notifier)
                .sendTextMessage(suggestion);
          },
          backgroundColor: Colors.grey.shade800,
        );
      }).toList(),
    );
  }

  String _getStatusText(VoiceAssistantState state) {
    if (state.isListening) return 'Listening...';
    if (state.isProcessing) return 'Processing...';
    if (state.isSpeaking) return 'Speaking...';
    return 'Ready';
  }

  void _showClearConversationDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Clear Conversation'),
          content: const Text(
            'Are you sure you want to clear the entire conversation history?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                ref.read(voiceAssistantProvider.notifier).clearConversation();
                Navigator.pop(context);
              },
              child: const Text('Clear'),
              style: TextButton.styleFrom(foregroundColor: Colors.red),
            ),
          ],
        );
      },
    );
  }

  void _showHelpDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('How to Use'),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Voice Commands:',
                  style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                const Text('• "Check my balance"'),
                const Text('• "Show recent transactions"'),
                const Text('• "Transfer \$100 to account 1234567890"'),
                const Text('• "What is my savings account balance?"'),
                const Text('• "Show my loan details"'),
                const Text('• "Pay my bills"'),
                const SizedBox(height: 16),
                Text(
                  'How to Use Voice:',
                  style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                const Text('• Press and hold the microphone button'),
                const Text('• Speak your command clearly'),
                const Text('• Release when done'),
                const SizedBox(height: 16),
                Text(
                  'You can also type your message using the text input field.',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Got it'),
            ),
          ],
        );
      },
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final ConversationMessage message;
  final DateFormat timeFormat;

  const _MessageBubble({
    required this.message,
    required this.timeFormat,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: message.isUser
              ? const Color(0xFF06b6d4)
              : Colors.grey.shade800,
          borderRadius: BorderRadius.circular(16).copyWith(
            bottomRight: message.isUser ? const Radius.circular(4) : null,
            bottomLeft: !message.isUser ? const Radius.circular(4) : null,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.text,
              style: GoogleFonts.inter(
                fontSize: 14,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              timeFormat.format(message.timestamp),
              style: GoogleFonts.inter(
                fontSize: 10,
                color: Colors.white.withOpacity(0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
