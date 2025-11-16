import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/voice_assistant_provider.dart';
import '../screens/voice/voice_assistant_screen.dart';

class VoiceAssistantFAB extends ConsumerStatefulWidget {
  const VoiceAssistantFAB({super.key});

  @override
  ConsumerState<VoiceAssistantFAB> createState() => _VoiceAssistantFABState();
}

class _VoiceAssistantFABState extends ConsumerState<VoiceAssistantFAB>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final voiceState = ref.watch(voiceAssistantProvider);

    return Stack(
      alignment: Alignment.center,
      children: [
        // Pulsing circles when active
        if (voiceState.isActive)
          AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) {
              return Container(
                width: 70 * _pulseAnimation.value,
                height: 70 * _pulseAnimation.value,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF06b6d4).withOpacity(
                    0.3 * (1 - (_pulseAnimation.value - 1) / 0.3),
                  ),
                ),
              );
            },
          ),

        // Main FAB
        AnimatedBuilder(
          animation: _scaleAnimation,
          builder: (context, child) {
            return Transform.scale(
              scale: voiceState.isActive ? _scaleAnimation.value : 1.0,
              child: FloatingActionButton.large(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const VoiceAssistantScreen(),
                    ),
                  );
                },
                backgroundColor: voiceState.isActive
                    ? const Color(0xFF06b6d4)
                    : Colors.grey.shade800,
                child: _buildFABIcon(voiceState),
              ),
            );
          },
        ),

        // Active indicator badge
        if (voiceState.isActive)
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.red.withOpacity(0.5),
                    blurRadius: 8,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(
                Icons.fiber_manual_record,
                size: 8,
                color: Colors.white,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildFABIcon(VoiceAssistantState voiceState) {
    if (voiceState.isListening) {
      return const Icon(
        Icons.mic,
        size: 36,
        color: Colors.white,
      );
    } else if (voiceState.isProcessing) {
      return const SizedBox(
        width: 36,
        height: 36,
        child: CircularProgressIndicator(
          strokeWidth: 3,
          valueColor: AlwaysStoppedAnimation(Colors.white),
        ),
      );
    } else if (voiceState.isSpeaking) {
      return const Icon(
        Icons.volume_up,
        size: 36,
        color: Colors.white,
      );
    } else {
      return const Icon(
        Icons.mic_none,
        size: 36,
        color: Colors.white,
      );
    }
  }
}
