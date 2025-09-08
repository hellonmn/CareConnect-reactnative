import SendIcon from '@/assets/images/icons/paper-plane.svg';
import MenuIcon from '@/assets/images/icons/star.svg'; // Add menu icon
import BotIcon from '@/assets/images/icons/user-md.svg';
import UserIcon from '@/assets/images/icons/user.svg';
import { ThemedText } from '@/components/ThemedText';
import Header from '@/components/ui/Header';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Your Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyB118A_rRPHAZnlsL4Ja09biT5O079iUfA'; // Replace with your actual API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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

type UserProfile = {
  name: string;
  age: string;
  gender: string;
  bloodType: string;
  allergies: string[];
  chronicDiseases: string[];
  currentMedications: string[];
  medicalHistory: string[];
  emergencyContact: string;
  lastCheckup: string;
  notes: string;
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

const UserProfileModal = ({ 
  visible, 
  onClose, 
  profile, 
  onUpdateProfile 
}: {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}) => {
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleSave = () => {
    onUpdateProfile(editedProfile);
    onClose();
  };

  const updateField = (field: keyof UserProfile, value: string | string[]) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: 'allergies' | 'chronicDiseases' | 'currentMedications' | 'medicalHistory', value: string) => {
    if (value.trim()) {
      const currentArray = editedProfile[field] as string[];
      setEditedProfile(prev => ({
        ...prev,
        [field]: [...currentArray, value.trim()]
      }));
    }
  };

  const removeFromArray = (field: 'allergies' | 'chronicDiseases' | 'currentMedications' | 'medicalHistory', index: number) => {
    const currentArray = editedProfile[field] as string[];
    setEditedProfile(prev => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <ThemedText style={styles.modalTitle}>Medical Profile</ThemedText>
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.modalButton}>
              <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.modalButton, styles.saveButton]}>
              <ThemedText style={[styles.modalButtonText, styles.saveButtonText]}>Save</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
            <TextInput
              style={styles.textInput}
              placeholder="Name"
              value={editedProfile.name}
              onChangeText={(value) => updateField('name', value)}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Age"
              value={editedProfile.age}
              onChangeText={(value) => updateField('age', value)}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Gender"
              value={editedProfile.gender}
              onChangeText={(value) => updateField('gender', value)}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Blood Type"
              value={editedProfile.bloodType}
              onChangeText={(value) => updateField('bloodType', value)}
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Allergies</ThemedText>
            {editedProfile.allergies.map((allergy, index) => (
              <View key={index} style={styles.arrayItem}>
                <ThemedText style={styles.arrayItemText}>{allergy}</ThemedText>
                <TouchableOpacity onPress={() => removeFromArray('allergies', index)}>
                  <ThemedText style={styles.removeButton}>Remove</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.textInput}
              placeholder="Add new allergy"
              onSubmitEditing={(e) => {
                addToArray('allergies', e.nativeEvent.text);
                e.target.clear();
              }}
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Chronic Diseases</ThemedText>
            {editedProfile.chronicDiseases.map((disease, index) => (
              <View key={index} style={styles.arrayItem}>
                <ThemedText style={styles.arrayItemText}>{disease}</ThemedText>
                <TouchableOpacity onPress={() => removeFromArray('chronicDiseases', index)}>
                  <ThemedText style={styles.removeButton}>Remove</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.textInput}
              placeholder="Add chronic disease"
              onSubmitEditing={(e) => {
                addToArray('chronicDiseases', e.nativeEvent.text);
                e.target.clear();
              }}
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Current Medications</ThemedText>
            {editedProfile.currentMedications.map((medication, index) => (
              <View key={index} style={styles.arrayItem}>
                <ThemedText style={styles.arrayItemText}>{medication}</ThemedText>
                <TouchableOpacity onPress={() => removeFromArray('currentMedications', index)}>
                  <ThemedText style={styles.removeButton}>Remove</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.textInput}
              placeholder="Add current medication"
              onSubmitEditing={(e) => {
                addToArray('currentMedications', e.nativeEvent.text);
                e.target.clear();
              }}
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Medical History</ThemedText>
            {editedProfile.medicalHistory.map((history, index) => (
              <View key={index} style={styles.arrayItem}>
                <ThemedText style={styles.arrayItemText}>{history}</ThemedText>
                <TouchableOpacity onPress={() => removeFromArray('medicalHistory', index)}>
                  <ThemedText style={styles.removeButton}>Remove</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.textInput}
              placeholder="Add medical history"
              onSubmitEditing={(e) => {
                addToArray('medicalHistory', e.nativeEvent.text);
                e.target.clear();
              }}
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Additional Information</ThemedText>
            <TextInput
              style={styles.textInput}
              placeholder="Emergency Contact"
              value={editedProfile.emergencyContact}
              onChangeText={(value) => updateField('emergencyContact', value)}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Last Checkup Date"
              value={editedProfile.lastCheckup}
              onChangeText={(value) => updateField('lastCheckup', value)}
            />
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Additional Notes"
              value={editedProfile.notes}
              onChangeText={(value) => updateField('notes', value)}
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

type ChatViewProps = {
  onClose: () => void;
};

export default function ChatView({ onClose }: ChatViewProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: 'Hello! I\'m Dr Care AI powered by Google Gemini. I can assist you with your health concerns based on your medical profile. How can I help you today?',
    isUser: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: '',
    gender: '',
    bloodType: '',
    allergies: [],
    chronicDiseases: [],
    currentMedications: [],
    medicalHistory: [],
    emergencyContact: '',
    lastCheckup: '',
    notes: ''
  });

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const buildMedicalContext = (profile: UserProfile): string => {
    const context = `
Patient Medical Profile:
- Name: ${profile.name || 'Not specified'}
- Age: ${profile.age || 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}
- Blood Type: ${profile.bloodType || 'Not specified'}
- Allergies: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None specified'}
- Chronic Diseases: ${profile.chronicDiseases.length > 0 ? profile.chronicDiseases.join(', ') : 'None specified'}
- Current Medications: ${profile.currentMedications.length > 0 ? profile.currentMedications.join(', ') : 'None specified'}
- Medical History: ${profile.medicalHistory.length > 0 ? profile.medicalHistory.join(', ') : 'None specified'}
- Last Checkup: ${profile.lastCheckup || 'Not specified'}
- Additional Notes: ${profile.notes || 'None'}

Please provide medical advice considering this patient's profile. Always remind that this is for informational purposes only and recommend consulting healthcare professionals for serious concerns.
    `;
    return context.trim();
  };

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    try {
      const medicalContext = buildMedicalContext(userProfile);
      const fullPrompt = `${medicalContext}\n\nUser Question: ${userMessage}`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      return `I apologize, but I'm having trouble connecting to the medical assistant service right now. Please try again later. If you have urgent medical concerns, please contact your healthcare provider immediately.`;
    }
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
      const currentMessage = message;
      setMessage('');
      inputRef.current?.clear();
      
      setIsTyping(true);
      
      try {
        const aiResponseText = await callGeminiAPI(currentMessage);
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponseText,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'I apologize, but I encountered an error processing your request. Please try again.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleProfileUpdate = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    // Here you might want to save to AsyncStorage or your preferred storage solution
    Alert.alert('Profile Updated', 'Your medical profile has been updated successfully.');
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
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setShowProfileModal(true)}
        >
          <MenuIcon width={24} height={24} fill="#0694a2" />
          <ThemedText style={styles.profileButtonText}>Medical Profile</ThemedText>
        </TouchableOpacity>
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
          <ThemedText style={styles.typingText}>Dr Care is analyzing your medical profile...</ThemedText>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your health concern..."
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

      <UserProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={userProfile}
        onUpdateProfile={handleProfileUpdate}
      />
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
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    gap: 8,
  },
  profileButtonText: {
    color: '#0694a2',
    fontSize: 14,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    marginTop: 20,
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
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#0694a2',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  arrayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    marginBottom: 4,
  },
  arrayItemText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  removeButton: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
});