import SendIcon from '@/assets/images/icons/paper-plane.svg';
import BotIcon from '@/assets/images/icons/user-md.svg';
import UserIcon from '@/assets/images/icons/user.svg';
import { ThemedText } from '@/components/ThemedText';
import Header from '@/components/ui/Header';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
};

type ChatMessageProps = {
  message: string;
  isUser: boolean;
  timestamp: string;
};

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => (
  <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
    <View style={[styles.avatarContainer, isUser ? styles.userAvatar : styles.botAvatar]}>
      {isUser ? (
        <UserIcon width={20} height={20} fill="#6B7280" />
      ) : (
        <BotIcon width={20} height={20} fill="#0694a2" />
      )}
    </View>
    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
      <ThemedText style={[styles.messageText, isUser && styles.userMessageText]}>
        {message}
      </ThemedText>
      <ThemedText style={[styles.timestamp, isUser && styles.userTimestamp]}>
        {timestamp}
      </ThemedText>
    </View>
  </View>
);

type ChatViewProps = {
  onClose: () => void;
};

export default function ChatView({ onClose }: ChatViewProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: 'Hello! I\'m Dr Care AI. How can I assist you with your health concerns today?',
    isUser: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiResponse: Message = {
      id: Date.now().toString(),
      text: `I understand your concern about "${userMessage}". Let me help you with that...`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (message.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      inputRef.current?.clear();
      await simulateAIResponse(message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <View style={styles.headerBox}>
        <Header 
            title="Dr Care AI"
            showBack={true}
            onBackPress={onClose}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatMessage
            message={item.text}
            isUser={item.isUser}
            timestamp={item.timestamp}
          />
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator color="#0694a2" size="small" />
          <ThemedText style={styles.typingText}>Dr Care is typing...</ThemedText>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!message.trim() || isTyping}
          >
            <SendIcon 
              width={24} 
              height={24} 
              fill={message.trim() && !isTyping ? "#0694a2" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBox: {
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatContainer: {
    flex: 1,
    marginTop: 40,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: '#F3F4F6',
  },
  botAvatar: {
    backgroundColor: '#E6FFFA',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#0694a2',
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
  },
  userMessageText: {
    color: '#FFFFFF', // White text for user messages
  },
  timestamp: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white for timestamp
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f6f6f6ff',
    padding: 16,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: '#1F2937',
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});