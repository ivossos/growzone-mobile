/**
 * Voice Recorder Component
 * Handles voice message recording for chat
 */

import React, { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, Text, Animated, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { colors } from "@/styles/colors";

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onCancel }: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Pulse animation
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      pulseAnim.setValue(1);
    };
  }, [isRecording]);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.log("Permission to record denied");
        onCancel();
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);

      // Start duration counter
      durationInterval.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          // Auto-stop at 60 seconds
          if (newDuration >= 60) {
            handleStopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      onCancel();
    }
  };

  const handleStopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);

      // Clear interval
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (uri) {
        onRecordingComplete(uri, duration);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      onCancel();
    }
  };

  const handleCancelRecording = async () => {
    if (recording) {
      try {
        setIsRecording(false);

        if (durationInterval.current) {
          clearInterval(durationInterval.current);
        }

        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      } catch (error) {
        console.error("Failed to cancel recording:", error);
      }
    }
    onCancel();
  };

  const stopRecordingCleanup = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    }
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="flex-row items-center px-4 py-3 bg-black-90">
      {/* Cancel Button */}
      <TouchableOpacity
        onPress={handleCancelRecording}
        className="mr-4"
      >
        <Ionicons name="close" size={28} color={colors.brand.white} opacity={0.6} />
      </TouchableOpacity>

      {/* Recording Indicator */}
      <View className="flex-1 flex-row items-center">
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <View className="w-3 h-3 rounded-full bg-red-500 mr-3" />
        </Animated.View>

        {/* Waveform visualization (simplified) */}
        <View className="flex-row items-center flex-1 gap-1">
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              className="flex-1 bg-brand-green/30 rounded-full"
              style={{
                height: Math.random() * 20 + 10,
                opacity: isRecording ? 0.3 + Math.random() * 0.7 : 0.3,
              }}
            />
          ))}
        </View>

        {/* Duration */}
        <Text className="text-white text-base font-mono ml-3">
          {formatDuration(duration)}
        </Text>
      </View>

      {/* Send Button */}
      <TouchableOpacity
        onPress={handleStopRecording}
        className="ml-4 w-12 h-12 rounded-full bg-brand-green items-center justify-center"
        disabled={duration < 1}
        style={{ opacity: duration < 1 ? 0.5 : 1 }}
      >
        <Ionicons name="send" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );
}
