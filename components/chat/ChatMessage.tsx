import BotIcon from '../../assets/images/icons/user.svg';
import UserIcon from '../../assets/images/icons/user.svg';
import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type ChatMessageProps = {
  message: string;
  isUser: boolean;
  timestamp: string;
};

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
      <View style={styles.iconContainer}>
        {isUser ? (
          <UserIcon width={24} height={24} fill="#9CA3AF" />
        ) : (
          <BotIcon width={24} height={24} fill="#0694a2" />
        )}
      </View>
      <View style={styles.messageContent}>
        <ThemedText style={styles.message}>{message}</ThemedText>
        <ThemedText style={styles.timestamp}>{timestamp}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
    gap: 12,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
    maxWidth: '75%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  message: {
    fontSize: 14,
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});