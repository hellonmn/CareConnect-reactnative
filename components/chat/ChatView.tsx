import AllergyIcon from '@/assets/images/icons/allergy.svg';
import HospitalIcon from '@/assets/images/icons/hospital.svg';
import MedicationIcon from '@/assets/images/icons/medication.svg';
import MenuIcon from '@/assets/images/icons/menu.svg'; // Add translate icon
import MicIcon from '@/assets/images/icons/microphone.svg'; // Add microphone icon
import SendIcon from '@/assets/images/icons/paper-plane.svg';
import PhoneIcon from '@/assets/images/icons/phone.svg';
import QRIcon from '@/assets/images/icons/qr.svg';
import SearchIcon from '@/assets/images/icons/search.svg';
import TranslateIcon from '@/assets/images/icons/translate.svg'; // Add translate icon
import BotIcon from '@/assets/images/icons/user-md.svg';
import { default as PersonIcon, default as UserIcon } from '@/assets/images/icons/user.svg';
import VitalsIcon from '@/assets/images/icons/vitals.svg';
import { ThemedText } from '@/components/ThemedText';
import Header from '@/components/ui/Header';
import { Audio } from 'expo-av';
import { Camera, CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    TextInput as RNTextInput,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type Message = {
  id: string;
  text: string | React.ReactNode;
  isUser: boolean;
  timestamp: string;
  isCollapsed?: boolean;
  images?: string[];
  safetyVerdict?: string;
  language?: string; // Add language property for translated messages
};

type ChatMessageProps = {
  message: string | React.ReactNode;
  isUser: boolean;
  timestamp: string;
  isCollapsed: boolean;
  images?: string[];
  onToggleCollapse: () => void;
  safetyVerdict?: string;
  language?: string;
};

type Allergy = {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
  date_discovered: string;
};

type Medication = {
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  prescribing_doctor: string;
};

type MedicalRecord = {
  date: string;
  diagnosis: string;
  treatment: string;
  doctor: string;
  notes: string;
};

type VitalSigns = {
  date: string;
  blood_pressure: string;
  heart_rate: number;
  temperature: number;
  weight: number;
  height: number;
};

type UserHealthData = {
  user_id: string;
  name: string;
  age: number;
  gender: string;
  blood_type: string;
  emergency_contact: string;
  medical_records: MedicalRecord[];
  allergies: Allergy[];
  current_medications: Medication[];
  vital_signs: VitalSigns[];
  chronic_conditions: string[];
  family_history: string[];
  created_at: string;
  updated_at: string;
};

const GEMINI_API_KEY = "AIzaSyB118A_rRPHAZnlsL4Ja09biT5O079iUfA";
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hl', name: 'Hinglish' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
];

const ChatMessage = ({ message, isUser, timestamp, isCollapsed, images, onToggleCollapse, safetyVerdict, language }: ChatMessageProps) => {
  const getBubbleColor = () => {
    if (safetyVerdict) {
      if (safetyVerdict.toLowerCase().includes('safe')) return '#10B981';
      if (safetyVerdict.toLowerCase().includes('caution')) return '#F59E0B';
      if (safetyVerdict.toLowerCase().includes('unsafe')) return '#EF4444';
    }
    return isUser ? '#0694a2' : '#F3F4F6';
  };

  const renderFormattedText = () => {
    if (typeof message !== 'string') {
      return (
        <View style={styles.upperContent} backgroundColor="#F3F4F6">
          {message}
        </View>
      );
    }

    const lines = message.split('\n');
    const displayText = isCollapsed ? lines.slice(0, 3).join('\n') + (lines.length > 3 ? '...' : '') : message;

    if (isUser) {
      return (
        <View style={styles.upperContent} backgroundColor="#F3F4F6">
          <ThemedText style={[styles.messageText, styles.userMessageText]}>
            {displayText}
            {language && <Text style={styles.languageTag}> ({language})</Text>}
          </ThemedText>
        </View>
      );
    }

    const parts = displayText.split(/(\*\*.*?\*\*)/g);
    
    return (
      <View style={styles.upperContent} backgroundColor="#F3F4F6">
        <Text style={styles.messageText}>
          {parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const boldText = part.slice(2, -2);
              const lowerText = boldText.toLowerCase();
              
              let textStyle = [styles.boldText];
              
              if (lowerText.includes('safety verdict')) {
                if (lowerText.includes('safe') && !lowerText.includes('unsafe')) {
                  textStyle = [styles.safeText];
                } else if (lowerText.includes('caution') || lowerText.includes('unsafe')) {
                  textStyle = [styles.cautionText];
                } else {
                  textStyle = [styles.warningText];
                }
              } else if (lowerText.includes('concern') || lowerText.includes('warning') || lowerText.includes('alert')) {
                textStyle = [styles.warningText];
              } else if (lowerText.includes('specific concerns') || lowerText.includes('nutritional considerations')) {
                textStyle = [styles.sectionHeaderText];
              }
              
              return (
                <Text key={index} style={textStyle}>
                  {boldText}
                </Text>
              );
            }
            
            return (
              <Text key={index} style={styles.normalText}>
                {part}
              </Text>
            );
          })}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}
      onPress={onToggleCollapse}
      activeOpacity={0.8}
    >
      <View style={[styles.avatarContainer, isUser ? styles.userAvatar : styles.botAvatar]}>
        {isUser ? (
          <UserIcon width={20} height={20} fill="#6B7280" />
        ) : (
          <BotIcon width={20} height={20} fill="#0694a2" />
        )}
      </View>
      <View style={[styles.messageBubble, { backgroundColor: getBubbleColor() }, isUser ? styles.userBubble : styles.botBubble]}>
        {renderFormattedText()}
        {images && images.length > 0 && !isCollapsed && (
          <View style={styles.imageContainer}>
            {images.slice(0, 4).map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.productImage}
                resizeMode="contain"
                onError={() => console.log(`Failed to load image: ${imageUrl}`)}
              />
            ))}
          </View>
        )}
        <ThemedText style={[styles.timestamp, isUser && styles.userTimestamp]}>
          {timestamp}
        </ThemedText>
        {typeof message === 'string' && message.split('\n').length > 3 && (
          <ThemedText style={styles.collapseText}>
            {isCollapsed ? 'Show more' : 'Show less'}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
};

type ChatViewProps = {
  onClose: () => void;
};

export default function ChatView({ onClose }: ChatViewProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: 'Hello! I\'m Dr Care AI. How can I assist you with your health concerns today? You can also scan product barcodes to check if they\'re safe for you!',
    isUser: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isCollapsed: false,
    language: 'English'
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const recording = useRef<Audio.Recording | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const [userHealthData, setUserHealthData] = useState<UserHealthData>({
    user_id: "e10fdcff-0c94-4646-bdc4-61117893f31e",
    name: "John Doe",
    age: 45,
    gender: "male",
    blood_type: "A+",
    emergency_contact: "+1-555-0123",
    medical_records: [
      {
        date: "2024-01-15",
        diagnosis: "Annual Physical - Diabetes Management",
        treatment: "Continue current medications, dietary counseling",
        doctor: "Dr. Sarah Johnson",
        notes: "HbA1c: 7.2%, Blood pressure well controlled"
      }
    ],
    allergies: [
      {
        allergen: "Penicillin",
        severity: "severe",
        reaction: "Anaphylaxis, difficulty breathing",
        date_discovered: "2018-03-15"
      },
      {
        allergen: "Shellfish",
        severity: "moderate",
        reaction: "Hives and swelling",
        date_discovered: "2020-07-22"
      }
    ],
    current_medications: [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "twice daily",
        start_date: "2022-01-15",
        end_date: null,
        prescribing_doctor: "Dr. Sarah Johnson"
      },
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "once daily",
        start_date: "2021-11-20",
        end_date: null,
        prescribing_doctor: "Dr. Michael Chen"
      }
    ],
    vital_signs: [
      {
        date: "2024-01-15",
        blood_pressure: "128/82",
        heart_rate: 72,
        temperature: 98.6,
        weight: 185.5,
        height: 70.0
      }
    ],
    chronic_conditions: ["Type 2 Diabetes", "Hypertension", "High Cholesterol"],
    family_history: ["Heart Disease", "Diabetes", "Cancer"],
    created_at: "2025-09-09T01:24:06.473060",
    updated_at: "2025-09-09T01:24:06.473060"
  });

  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        setHasPermission(cameraStatus.status === 'granted');
        await Audio.requestPermissionsAsync();
      } catch (error) {
        console.log('Permission error:', error);
        setHasPermission(false);
      }
    };

    getPermissions();
  }, []);

  const toggleMessageCollapse = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isCollapsed: !msg.isCollapsed } : msg
      )
    );
  };

  const handleStopResponse = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsTyping(false);
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          id: Date.now().toString(),
          text: 'Request stopped by user.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCollapsed: false,
          language: 'English'
        }
      ]);
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone permission is required for voice input.');
        setIsRecording(false);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = { ...Audio.RecordingOptionsPresets.HIGH_QUALITY };
      recording.current = new Audio.Recording();
      await recording.current.prepareToRecordAsync(recordingOptions);
      await recording.current.startAsync();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start voice input.');
    }
  };

  const stopRecording = async () => {
    if (!recording.current) return;

    try {
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;

      if (uri) {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        const transcribedText = await transcribeAudio(base64);
        setMessage(transcribedText);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to process voice input.');
    } finally {
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (base64Audio: string) => {
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Transcribe this audio to text accurately." },
                {
                  inlineData: {
                    mimeType: "audio/mp3",
                    data: base64Audio
                  }
                }
              ]
            }]
          })
        }
      );
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Transcription failed.";
    } catch (error) {
      console.error('Transcription error:', error);
      return "Transcription failed.";
    }
  };

  const translateMessage = async (text: string, targetLanguage: string) => {
    // Mock translation function (replace with real API like Google Translate)
    try {
      // Placeholder for actual translation API call
      const translations: { [key: string]: string } = {
        en: text,
        hi: `Translated to Hindi: ${text}`,
        hl: `Translated to Hinglish: ${text} with some Hindi mix`,
        es: `Translated to Spanish: ${text}`,
        fr: `Translated to French: ${text}`,
      };
      return translations[targetLanguage] || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const fetchProductInfo = async (barcode: string, controller: AbortController) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
        signal: controller.signal
      });
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const images = [
          data.product.image_url,
          data.product.image_front_url,
          data.product.image_ingredients_url,
          data.product.image_nutrition_url,
          data.product.image_packaging_url
        ].filter(url => url && typeof url === 'string');
        
        return {
          name: data.product.product_name || 'Unknown Product',
          ingredients: data.product.ingredients_text || 'Ingredients not available',
          allergens: data.product.allergens_tags || [],
          nutritionalInfo: {
            energy: data.product.nutriments?.energy_100g,
            fat: data.product.nutriments?.fat_100g,
            saturatedFat: data.product.nutriments?.['saturated-fat_100g'],
            carbohydrates: data.product.nutriments?.carbohydrates_100g,
            sugars: data.product.nutriments?.sugars_100g,
            fiber: data.product.nutriments?.fiber_100g,
            proteins: data.product.nutriments?.proteins_100g,
            salt: data.product.nutriments?.salt_100g,
            sodium: data.product.nutriments?.sodium_100g
          },
          categories: data.product.categories_tags || [],
          brands: data.product.brands || 'Unknown Brand',
          images
        };
      } else {
        return null;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request aborted');
      }
      console.error('Error fetching product info:', error);
      return null;
    }
  };

  const analyzeProductSafety = async (productInfo: any, barcode: string, controller: AbortController) => {
    try {
      setIsTyping(true);
      
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          id: Date.now().toString(),
          text: (
            <View style={styles.inlineIconContainer}>
              <SearchIcon width={16} height={16} fill="#0694a2" />
              <Text> Analyzing product...</Text>
            </View>
          ),
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCollapsed: false,
          language: 'English'
        }
      ]);

      const analysisPrompt = `
        HEALTH SAFETY ANALYSIS REQUEST
        
        User Health Profile:
        ${JSON.stringify(userHealthData, null, 2)}
        
        Product Information (Barcode: ${barcode}):
        - Name: ${productInfo.name}
        - Brand: ${productInfo.brands}
        - Ingredients: ${productInfo.ingredients}
        - Allergens: ${productInfo.allergens.join(', ') || 'None listed'}
        - Nutritional Info (per 100g): ${JSON.stringify(productInfo.nutritionalInfo, null, 2)}
        - Categories: ${productInfo.categories.join(', ')}
        
        Please analyze this product for the user and provide a concise response (under 150 words):
        1. SAFETY VERDICT: SAFE, CAUTION, or UNSAFE.
        2. Key concerns based on allergies, medications, conditions.
        3. Brief nutritional considerations.
        4. Short alternative recommendations if needed.
        5. Any drug-food interactions.
        
        Be specific but brief. Focus on actionable advice.
      `;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: analysisPrompt }] }],
            generationConfig: {
              temperature: 0.2,
              topK: 1,
              topP: 0.8,
              maxOutputTokens: 1500,
            }
          }),
          signal: controller.signal
        }
      );
      
      const data = await response.json();
      let analysisResult = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't analyze this product.";
      const safetyVerdictMatch = analysisResult.match(/SAFETY VERDICT: (SAFE|CAUTION|UNSAFE)/i);
      const safetyVerdict = safetyVerdictMatch ? safetyVerdictMatch[1] : undefined;

      // Translate AI response to selected language
      analysisResult = await translateMessage(analysisResult, selectedLanguage);

      const scanMessage: Message = {
        id: Date.now().toString(),
        text: (
          <View style={styles.inlineIconContainer}>
            <PhoneIcon width={16} height={16} fill="#d4190fff" />
            <Text> Scanned product: ${productInfo.name} (${productInfo.brands})</Text>
          </View>
        ),
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCollapsed: false,
        images: productInfo.images,
        language: 'English'
      };

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `**Product Safety Analysis**\n\n${analysisResult}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCollapsed: true,
        safetyVerdict,
        language: LANGUAGES.find(l => l.code === selectedLanguage)?.name
      };

      setMessages(prev => [...prev.slice(0, -1), scanMessage, aiResponse]);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request aborted');
      }
      console.error('Error analyzing product:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I couldn't analyze this product. Please try again or ask me any questions about it manually.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCollapsed: false,
        language: 'English'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setAbortController(null);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setShowQRScanner(false);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/beep.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing beep sound:', error);
    }

    const searchingMessage: Message = {
      id: Date.now().toString(),
      text: (
        <View style={styles.inlineIconContainer}>
          <SearchIcon width={16} height={16} fill="#0694a2" />
          <Text> Searching database for barcode: ${data}...</Text>
        </View>
      ),
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCollapsed: false,
      language: 'English'
    };
    setMessages(prev => [...prev, searchingMessage]);
    setIsTyping(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const productInfo = await fetchProductInfo(data, controller);
      
      if (productInfo) {
        await analyzeProductSafety(productInfo, data, controller);
      } else {
        setMessages(prev => [
          ...prev.slice(0, -1),
          {
            id: Date.now().toString(),
            text: `Product not found in database for barcode: ${data}. This might be a local product or the barcode might not be in the Open Food Facts database. You can still ask me about any specific product manually!`,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCollapsed: false,
            language: 'English'
          }
        ]);
      }
    } catch (error) {
      if (error.message === 'Request aborted') {
        return;
      }
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          id: Date.now().toString(),
          text: "Sorry, there was an error looking up this product. Please try again or ask me about it manually.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCollapsed: false,
          language: 'English'
        }
      ]);
    } finally {
      setIsTyping(false);
      setScanned(false);
      setAbortController(null);
    }
  };

  const openQRScanner = async () => {
    if (hasPermission === null) {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    }

    if (hasPermission === false) {
      Alert.alert(
        'Camera Permission Required',
        'Camera access is needed to scan barcodes. You can also enter the barcode manually.',
        [
          { text: 'Enter Manually', onPress: () => setShowBarcodeInput(true) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    setScanned(false);
    setShowQRScanner(true);
  };

  const queryGemini = async (userMessage: string) => {
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      setIsTyping(true);
      const prompt = `User health profile:\n${JSON.stringify(userHealthData)}\n\nUser message: ${userMessage}\n\nAnswer like a healthcare assistant using the provided health data. Be helpful, informative, and always recommend consulting healthcare professionals for serious concerns. Keep your response concise and under 150 words.`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
          signal: controller.signal
        }
      );
      const data = await response.json();
      let textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

      // Translate response to selected language
      textResponse = await translateMessage(textResponse, selectedLanguage);

      const aiResponse: Message = {
        id: Date.now().toString(),
        text: textResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCollapsed: textResponse.split('\n').length > 3,
        language: LANGUAGES.find(l => l.code === selectedLanguage)?.name
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: 'Request stopped by user.',
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCollapsed: false,
            language: 'English'
          }
        ]);
        return;
      }
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: "Error contacting AI service. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCollapsed: false,
        language: 'English'
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
      setAbortController(null);
    }
  };

  const handleSend = async () => {
    if (message.trim()) {
      const translatedMessage = await translateMessage(message, selectedLanguage);
      const userMessage: Message = {
        id: Date.now().toString(),
        text: translatedMessage,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCollapsed: false,
        language: LANGUAGES.find(l => l.code === selectedLanguage)?.name
      };
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      inputRef.current?.clear();
      await queryGemini(userMessage.text as string);
    }
  };

  const updateHealthData = (section: string, data: any) => {
    setUserHealthData(prev => ({
      ...prev,
      [section]: data,
      updated_at: new Date().toISOString()
    }));
  };

  const addNewItem = (section: string) => {
    const newItems = {
      allergies: { allergen: '', severity: 'mild', reaction: '', date_discovered: '' },
      current_medications: { name: '', dosage: '', frequency: '', start_date: '', end_date: null, prescribing_doctor: '' },
      medical_records: { date: '', diagnosis: '', treatment: '', doctor: '', notes: '' },
      vital_signs: { date: '', blood_pressure: '', heart_rate: 0, temperature: 0, weight: 0, height: 0 }
    };

    if (newItems[section as keyof typeof newItems]) {
      const currentArray = userHealthData[section as keyof UserHealthData] as any[];
      updateHealthData(section, [...currentArray, newItems[section as keyof typeof newItems]]);
    }
  };

  const removeItem = (section: string, index: number) => {
    const currentArray = userHealthData[section as keyof UserHealthData] as any[];
    const newArray = currentArray.filter((_, i) => i !== index);
    updateHealthData(section, newArray);
  };

  const updateArrayItem = (section: string, index: number, field: string, value: any) => {
    const currentArray = [...(userHealthData[section as keyof UserHealthData] as any[])];
    currentArray[index] = { ...currentArray[index], [field]: value };
    updateHealthData(section, currentArray);
  };

  const updateStringArray = (section: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    updateHealthData(section, array);
  };

  const renderBasicInfo = () => (
    <View>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <Text style={styles.fieldLabel}>Name</Text>
      <RNTextInput
        style={styles.sheetInput}
        value={userHealthData.name}
        onChangeText={(value) => updateHealthData('name', value)}
        placeholder="Full name"
      />

      <Text style={styles.fieldLabel}>Age</Text>
      <RNTextInput
        style={styles.sheetInput}
        value={userHealthData.age.toString()}
        onChangeText={(value) => updateHealthData('age', parseInt(value) || 0)}
        placeholder="Age"
        keyboardType="numeric"
      />

      <Text style={styles.fieldLabel}>Gender</Text>
      <RNTextInput
        style={styles.sheetInput}
        value={userHealthData.gender}
        onChangeText={(value) => updateHealthData('gender', value)}
        placeholder="Gender"
      />

      <Text style={styles.fieldLabel}>Blood Type</Text>
      <RNTextInput
        style={styles.sheetInput}
        value={userHealthData.blood_type}
        onChangeText={(value) => updateHealthData('blood_type', value)}
        placeholder="Blood Type (e.g., A+, B-, O+)"
      />

      <Text style={styles.fieldLabel}>Emergency Contact</Text>
      <RNTextInput
        style={styles.sheetInput}
        value={userHealthData.emergency_contact}
        onChangeText={(value) => updateHealthData('emergency_contact', value)}
        placeholder="Emergency contact number"
        keyboardType="phone-pad"
      />
    </View>
  );

  const renderAllergies = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Allergies</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => addNewItem('allergies')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      
      {userHealthData.allergies.map((allergy, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>Allergy #{index + 1}</Text>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeItem('allergies', index)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.fieldLabel}>Allergen</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={allergy.allergen}
            onChangeText={(value) => updateArrayItem('allergies', index, 'allergen', value)}
            placeholder="What are you allergic to?"
          />
          
          <Text style={styles.fieldLabel}>Severity</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={allergy.severity}
            onChangeText={(value) => updateArrayItem('allergies', index, 'severity', value)}
            placeholder="mild, moderate, or severe"
          />
          
          <Text style={styles.fieldLabel}>Reaction</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={allergy.reaction}
            onChangeText={(value) => updateArrayItem('allergies', index, 'reaction', value)}
            placeholder="Describe the reaction"
            multiline
          />
          
          <Text style={styles.fieldLabel}>Date Discovered</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={allergy.date_discovered}
            onChangeText={(value) => updateArrayItem('allergies', index, 'date_discovered', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>
      ))}
    </View>
  );

  const renderMedications = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Current Medications</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => addNewItem('current_medications')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      
      {userHealthData.current_medications.map((medication, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>Medication #{index + 1}</Text>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeItem('current_medications', index)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.fieldLabel}>Medication Name</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={medication.name}
            onChangeText={(value) => updateArrayItem('current_medications', index, 'name', value)}
            placeholder="Medication name"
          />
          
          <Text style={styles.fieldLabel}>Dosage</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={medication.dosage}
            onChangeText={(value) => updateArrayItem('current_medications', index, 'dosage', value)}
            placeholder="e.g., 500mg, 10ml"
          />
          
          <Text style={styles.fieldLabel}>Frequency</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={medication.frequency}
            onChangeText={(value) => updateArrayItem('current_medications', index, 'frequency', value)}
            placeholder="e.g., twice daily, once weekly"
          />
          
          <Text style={styles.fieldLabel}>Prescribing Doctor</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={medication.prescribing_doctor}
            onChangeText={(value) => updateArrayItem('current_medications', index, 'prescribing_doctor', value)}
            placeholder="Doctor's name"
          />
          
          <Text style={styles.fieldLabel}>Start Date</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={medication.start_date}
            onChangeText={(value) => updateArrayItem('current_medications', index, 'start_date', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>
      ))}
    </View>
  );

  const renderConditionsAndHistory = () => (
    <View>
      <Text style={styles.sectionTitle}>Chronic Conditions</Text>
      <RNTextInput
        style={[styles.sheetInput, styles.multilineInput]}
        value={userHealthData.chronic_conditions.join(', ')}
        onChangeText={(value) => updateStringArray('chronic_conditions', value)}
        placeholder="Enter conditions separated by commas"
        multiline
      />
      
      <Text style={styles.sectionTitle}>Family History</Text>
      <RNTextInput
        style={[styles.sheetInput, styles.multilineInput]}
        value={userHealthData.family_history.join(', ')}
        onChangeText={(value) => updateStringArray('family_history', value)}
        placeholder="Enter family medical history separated by commas"
        multiline
      />
    </View>
  );

  const renderVitalSigns = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vital Signs</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => addNewItem('vital_signs')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      
      {userHealthData.vital_signs.map((vitals, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>Reading #{index + 1}</Text>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeItem('vital_signs', index)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.fieldLabel}>Date</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={vitals.date}
            onChangeText={(value) => updateArrayItem('vital_signs', index, 'date', value)}
            placeholder="YYYY-MM-DD"
          />
          
          <Text style={styles.fieldLabel}>Blood Pressure</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={vitals.blood_pressure}
            onChangeText={(value) => updateArrayItem('vital_signs', index, 'blood_pressure', value)}
            placeholder="e.g., 120/80"
          />
          
          <Text style={styles.fieldLabel}>Heart Rate (bpm)</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={vitals.heart_rate.toString()}
            onChangeText={(value) => updateArrayItem('vital_signs', index, 'heart_rate', parseInt(value) || 0)}
            placeholder="Heart rate"
            keyboardType="numeric"
          />
          
          <Text style={styles.fieldLabel}>Weight (lbs)</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={vitals.weight.toString()}
            onChangeText={(value) => updateArrayItem('vital_signs', index, 'weight', parseFloat(value) || 0)}
            placeholder="Weight"
            keyboardType="numeric"
          />
          
          <Text style={styles.fieldLabel}>Height (inches)</Text>
          <RNTextInput
            style={styles.sheetInput}
            value={vitals.height.toString()}
            onChangeText={(value) => updateArrayItem('vital_signs', index, 'height', parseFloat(value) || 0)}
            placeholder="Height"
            keyboardType="numeric"
          />
        </View>
      ))}
    </View>
  );

  const renderSectionSelection = () => (
    <View>
      <Text style={styles.sectionTitle}>Edit Health Profile</Text>
      {[
        { key: 'basic', label: 'Basic Information', icon: PersonIcon },
        { key: 'allergies', label: 'Allergies', icon: AllergyIcon },
        { key: 'medications', label: 'Current Medications', icon: MedicationIcon },
        { key: 'conditions', label: 'Conditions & Family History', icon: HospitalIcon },
        { key: 'vitals', label: 'Vital Signs', icon: VitalsIcon },
      ].map((section) => (
        <TouchableOpacity
          key={section.key}
          style={styles.sectionButton}
          onPress={() => setEditingSection(section.key)}
        >
          <section.icon width={24} height={24} fill="#6B7280" style={styles.sectionButtonIcon} />
          <Text style={styles.sectionButtonText}>{section.label}</Text>
          <Text style={styles.sectionButtonArrow}>›</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.sectionTitle}>Language Settings</Text>
      {LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[styles.sectionButton, selectedLanguage === lang.code && styles.sectionButtonSelected]}
          onPress={() => {
            setSelectedLanguage(lang.code);
            setShowLanguageMenu(false);
          }}
        >
          <Text style={styles.sectionButtonText}>{lang.name}</Text>
          {selectedLanguage === lang.code && <Text style={styles.sectionButtonArrow}>✓</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEditSection = () => {
    switch (editingSection) {
      case 'basic':
        return renderBasicInfo();
      case 'allergies':
        return renderAllergies();
      case 'medications':
        return renderMedications();
      case 'conditions':
        return renderConditionsAndHistory();
      case 'vitals':
        return renderVitalSigns();
      default:
        return renderSectionSelection();
    }
  };

  const renderQRScanner = () => (
    <Modal
      visible={showQRScanner}
      animationType="slide"
      onRequestClose={() => setShowQRScanner(false)}
    >
      <View style={styles.qrScannerContainer}>
        <View style={styles.qrScannerHeader}>
          <TouchableOpacity 
            style={styles.qrCloseButton}
            onPress={() => setShowQRScanner(false)}
          >
            <Text style={styles.qrCloseButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.qrScannerTitle}>Scan Product Barcode</Text>
          <TouchableOpacity 
            style={styles.qrCloseButton}
            onPress={() => {
              setShowQRScanner(false);
              setShowBarcodeInput(true);
            }}
          >
            <Text style={styles.qrCloseButtonText}>Manual</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128", "code39"]
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Text style={styles.scannerText}>Position barcode within the frame</Text>
              <Text style={styles.scannerSubText}>We'll analyze the product's safety for your health profile</Text>
            </View>
          </CameraView>
        </View>
      </View>
    </Modal>
  );

  const renderBarcodeInputModal = () => (
    <Modal
      visible={showBarcodeInput}
      transparent
      animationType="slide"
      onRequestClose={() => setShowBarcodeInput(false)}
    >
      <View style={styles.bottomSheetOverlay}>
        <View style={[styles.bottomSheet, { minHeight: '40%' }]}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.sheetTitle}>Enter Product Barcode</Text>
            <TouchableOpacity 
              style={styles.closeButtonSmall}
              onPress={() => setShowBarcodeInput(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.bottomSheetContent}>
            <Text style={styles.fieldLabel}>Product Barcode</Text>
            <RNTextInput
              style={styles.sheetInput}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              placeholder="Enter barcode number (e.g., 3017620422003)"
              keyboardType="numeric"
            />
            
            <Text style={styles.scannerSubText}>
              You can find the barcode number printed below the barcode on the product packaging. Most food products use 8-13 digit codes.
            </Text>
            
            <TouchableOpacity 
              style={[styles.saveButton, !manualBarcode.trim() && { opacity: 0.5 }]}
              onPress={() => {
                if (manualBarcode.trim()) {
                  setShowBarcodeInput(false);
                  handleBarCodeScanned({ type: 'manual', data: manualBarcode.trim() });
                  setManualBarcode('');
                }
              }}
              disabled={!manualBarcode.trim()}
            >
              <Text style={styles.saveButtonText}>Check Product Safety</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderLanguageMenu = () => (
    <Modal
      visible={showLanguageMenu}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLanguageMenu(false)}
    >
      <View style={styles.bottomSheetOverlay}>
        <View style={[styles.bottomSheet, { minHeight: '40%' }]}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.sheetTitle}>Select Language</Text>
            <TouchableOpacity 
              style={styles.closeButtonSmall}
              onPress={() => setShowLanguageMenu(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.bottomSheetContent}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.sectionButton, selectedLanguage === lang.code && styles.sectionButtonSelected]}
                onPress={() => {
                  setSelectedLanguage(lang.code);
                  setShowLanguageMenu(false);
                }}
              >
                <Text style={styles.sectionButtonText}>{lang.name}</Text>
                {selectedLanguage === lang.code && <Text style={styles.sectionButtonArrow}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
        <TouchableOpacity style={styles.menuButton} onPress={() => setBottomSheetVisible(true)}>
          <MenuIcon width={18} height={18} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View>
            <ChatMessage
              message={item.text}
              isUser={item.isUser}
              timestamp={item.timestamp}
              isCollapsed={item.isCollapsed || false}
              images={item.images}
              onToggleCollapse={() => toggleMessageCollapse(item.id)}
              safetyVerdict={item.safetyVerdict}
              language={item.language}
            />
            {!item.isUser && (
              <TouchableOpacity
                style={styles.translateButton}
                onPress={() => setShowLanguageMenu(true)}
              >
                <TranslateIcon width={16} height={16} fill="#0694a2" />
                <Text style={styles.translateButtonText}>Translate</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator color="#0694a2" size="small" />
          <ThemedText style={styles.typingText}>Dr Care is typing...</ThemedText>
          <TouchableOpacity 
            style={styles.stopButton}
            onPress={handleStopResponse}
          >
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.qrScanButton} onPress={openQRScanner}>
          <QRIcon fill="#ffffff" width={20} height={20} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.micButton, isRecording && styles.micButtonActive]} 
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isTyping}
        >
          <MicIcon fill={isRecording ? "#EF4444" : "#ffffff"} width={20} height={20} />
        </TouchableOpacity>
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

      {renderQRScanner()}
      {renderBarcodeInputModal()}
      {renderLanguageMenu()}

      <Modal
        visible={bottomSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setBottomSheetVisible(false);
          setEditingSection(null);
        }}
      >
        <View style={styles.bottomSheetOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              {editingSection && (
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setEditingSection(null)}
                >
                  <Text style={styles.backButtonText}>‹ Back</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.sheetTitle}>Edit Health Profile</Text>
              <TouchableOpacity 
                style={styles.closeButtonSmall}
                onPress={() => {
                  setBottomSheetVisible(false);
                  setEditingSection(null);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.bottomSheetContent}>
              {renderEditSection()}
            </ScrollView>
            
            <Pressable 
              style={styles.saveButton} 
              onPress={() => {
                setBottomSheetVisible(false);
                setEditingSection(null);
                Alert.alert('Success', 'Health profile updated successfully!');
              }}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerBox: {
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end"
  },
  menuButton: { padding: 8, marginTop: 8, zIndex: 1000 },
  chatContainer: { flex: 1, marginTop: 0 },
  chatContent: { padding: 16, paddingBottom: 32 },
  messageContainer: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  userMessage: { flexDirection: 'row-reverse' },
  avatarContainer: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  userAvatar: { backgroundColor: '#F3F4F6' },
  botAvatar: { backgroundColor: '#E6FFFA' },
  messageBubble: { maxWidth: '85%', padding: 12, borderRadius: 16 },
  userBubble: { borderTopRightRadius: 4 },
  botBubble: { borderTopLeftRadius: 4 },
  upperContent: { padding: 8, borderRadius: 12, marginBottom: 8 },
  messageText: { fontSize: 14, color: '#1F2937', lineHeight: 20 },
  userMessageText: { color: '#FFFFFF' },
  normalText: { color: '#1F2937' },
  boldText: { fontWeight: '700', color: '#1F2937' },
  safeText: {
    color: '#10B981',
    fontWeight: '700',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  cautionText: {
    color: '#EF4444',
    fontWeight: '700',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  warningText: {
    color: '#F59E0B',
    fontWeight: '700',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sectionHeaderText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
  languageTag: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  timestamp: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  userTimestamp: { color: 'rgba(255, 255, 255, 0.7)' },
  collapseText: {
    fontSize: 12,
    color: '#0694a2',
    marginTop: 8,
    textAlign: 'right'
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  inlineIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 40,
    marginBottom: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  translateButtonText: {
    fontSize: 12,
    color: '#0694a2',
    marginLeft: 4,
  },
  typingIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 8, 
    marginHorizontal: 16, 
    marginBottom: 8, 
    gap: 8 
  },
  typingText: { 
    fontSize: 14, 
    color: '#6B7280',
    flex: 1 
  },
  stopButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },
  inputContainer: { 
    borderTopWidth: 1, 
    borderTopColor: '#f6f6f6ff', 
    padding: 16, 
    backgroundColor: '#FFFFFF', 
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  inputWrapper: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB', 
    borderRadius: 24, 
    paddingHorizontal: 16, 
    paddingVertical: 8 
  },
  qrScanButton: { 
    padding: 10, 
    borderRadius: 24,
    backgroundColor: '#0694a2',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  micButton: { 
    padding: 10, 
    borderRadius: 24,
    backgroundColor: '#0694a2',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  micButtonActive: {
    backgroundColor: '#EF4444',
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    maxHeight: 100, 
    color: '#1F2937', 
    paddingTop: Platform.OS === 'ios' ? 8 : 0 
  },
  sendButton: { 
    marginLeft: 8, 
    padding: 8 
  },
  sendButtonDisabled: { 
    opacity: 0.5 
  },
  qrScannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  qrScannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000',
  },
  qrCloseButton: {
    padding: 8,
  },
  qrCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  qrScannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#0694a2',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 30,
  },
  scannerSubText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  bottomSheetOverlay: { 
    flex: 1, 
    justifyContent: "flex-end", 
    backgroundColor: "rgba(0,0,0,0.5)" 
  },
  bottomSheet: { 
    backgroundColor: "#fff", 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    maxHeight: "95%",
    minHeight: "80%"
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  backButton: {
    padding: 8
  },
  backButtonText: {
    fontSize: 18,
    color: '#0694a2',
    fontWeight: '600'
  },
  closeButtonSmall: {
    padding: 8
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold'
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20
  },
  sheetTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 20,
    textAlign: 'center',
    color: '#1F2937'
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  sectionButtonSelected: {
    backgroundColor: '#E6FFFA',
    borderColor: '#0694a2',
  },
  sectionButtonIcon: {
    marginRight: 12,
    width: 24,
    height: 24
  },
  sectionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937'
  },
  sectionButtonArrow: {
    fontSize: 20,
    color: '#9CA3AF'
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginBottom: 12,
    marginTop: 20,
    color: '#1F2937'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 20
  },
  addButton: {
    backgroundColor: '#0694a2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500'
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
    marginTop: 8
  },
  sheetInput: { 
    borderWidth: 1, 
    borderColor: "#D1D5DB", 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937'
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  itemContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  removeButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },
  saveButton: { 
    margin: 20,
    marginTop: 10,
    backgroundColor: "#0694a2", 
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: '600'
  },
});