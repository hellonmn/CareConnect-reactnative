import BotIcon from '@/assets/images/icons/user-md.svg';
import UserIcon from '@/assets/images/icons/user.svg';
import ChatView from '@/components/chat/ChatView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/ui/Header';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Contact = {
  id: string;
  name: string;
  type: 'ai' | 'doctor';
  status: string;
  avatar?: string;
};

const contacts: Contact[] = [
  {
    id: 'ai',
    name: 'Dr Care AI',
    type: 'ai',
    status: 'Always available',
  },
  // Add more contacts here if needed
];

export default function AIChatScreen() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const navigation = useNavigation();

  // Hide tab bar when chat is open
  useEffect(() => {
    if (selectedContact) {
      navigation.setOptions({
        tabBarStyle: { display: 'none' }
      });
    } else {
      navigation.setOptions({
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            bottom: 0,
            left: 20,
            right: 20,
            elevation: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: 15,
            height: 70,
          },
          android: {
            position: 'absolute',
            bottom: 0,
            paddingTop: 5,
            left: 20,
            right: 20,
            backgroundColor: '#FFFFFF',
            height: 70,
          },
        })
      });
    }
  }, [selectedContact]);

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={styles.contactItem}
      onPress={() => item.type === 'ai' && setSelectedContact(item)}
    >
      <View style={styles.avatarContainer}>
        {item.type === 'ai' ? (
          <BotIcon width={24} height={24} fill="#0694a2" />
        ) : (
          <UserIcon width={24} height={24} fill="#6B7280" />
        )}
      </View>
      <View style={styles.contactInfo}>
        <ThemedText style={styles.contactName}>{item.name}</ThemedText>
        <ThemedText style={styles.contactStatus}>{item.status}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  if (selectedContact) {
    return (
      <ChatView onClose={() => setSelectedContact(null)} />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={{ fontSize: 24, fontWeight: '600', color: '#1F2937' }}>Messages</Text>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={item => item.id}
        renderItem={renderContactItem}
        style={styles.contactList}
        contentContainerStyle={styles.contactListContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBox: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  contactList: {
    flex: 1,
  },
  contactListContent: {
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fcfcfcff',
    borderRadius: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});
