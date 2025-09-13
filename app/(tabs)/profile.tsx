import { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Mock user data
const mockUserData = {
  name: 'Naman Jangir',
  email: 'naman.jangir@example.com',
  phone: '+91 98765 43210',
  avatar: null,
  healthStats: {
    heartRate: '215bpm',
    calories: '756cal',
    weight: '109lbs'
  },
  memberSince: '2024-01-01',
};

export default function UserProfile() {
  const navigation = useNavigation();
  
  const [userData, setUserData] = useState(mockUserData);
  const [loading, setLoading] = useState(false);

  // Menu items configuration
  const menuItems = [
    {
      id: 'medical-records',
      title: 'Medical Records',
      icon: 'file-text',
      iconColor: '#14b8a6',
      onPress: () => navigation.navigate('MedicalRecords'),
    },
    {
      id: 'my-saved',
      title: 'My Saved',
      icon: 'heart',
      iconColor: '#14b8a6',
      onPress: () => navigation.navigate('MySaved'),
    },
    {
      id: 'appointment',
      title: 'Appointment',
      icon: 'calendar',
      iconColor: '#14b8a6',
      onPress: () => navigation.navigate('BookedAppointments'),
    },
    {
      id: 'payment-method',
      title: 'Payment Method',
      icon: 'credit-card',
      iconColor: '#14b8a6',
      onPress: () => navigation.navigate('PaymentMethod'),
    },
    {
      id: 'faqs',
      title: 'FAQs',
      icon: 'help-circle',
      iconColor: '#14b8a6',
      onPress: () => navigation.navigate('FAQs'),
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: 'log-out',
      iconColor: '#ef4444',
      onPress: handleLogout,
    },
  ];

  // Load user data
  const loadUserData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, fetch user data from API
      setUserData(mockUserData);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  }

  // Handle menu options
  const handleMenuPress = () => {
    Alert.alert(
      'Options',
      'Choose an option',
      [
        {
          text: 'Edit Profile',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          text: 'Settings',
          onPress: () => navigation.navigate('Settings'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Initial data load
  useEffect(() => {
    loadUserData();
  }, []);

  // Render menu item
  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        item.id === 'logout' && styles.logoutItem
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[
          styles.menuIconContainer,
          item.id === 'logout' && styles.logoutIconContainer
        ]}>
          <Icon 
            name={item.icon} 
            size={20} 
            color={item.iconColor}
          />
        </View>
        <Text style={[
          styles.menuItemText,
          item.id === 'logout' && styles.logoutText
        ]}>
          {item.title}
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14b8a6" />
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={20} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name="more-vert" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={60} color="#9ca3af" />
            </View>
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
        </View>

        {/* Health Stats */}
        <View style={styles.healthStats}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="favorite" size={20} color="#ffffff" />
            </View>
            <Text style={styles.statLabel}>Heart rate</Text>
            <Text style={styles.statValue}>{userData.healthStats.heartRate}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="local-fire-department" size={20} color="#ffffff" />
            </View>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>{userData.healthStats.calories}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="fitness-center" size={20} color="#ffffff" />
            </View>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{userData.healthStats.weight}</Text>
          </View>
        </View>
      </View>

      {/* Menu Section */}
      <View style={styles.menuSection}>
        <ScrollView 
          style={styles.menuContainer}
          contentContainerStyle={styles.menuContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {menuItems.map(renderMenuItem)}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerSection: {
    backgroundColor: '#14b8a6',
    paddingBottom: 30,
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  menuButton: {
    padding: 4,
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 40,
    backgroundColor: '#fdfdfdff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  healthStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
  menuSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuContentContainer: {
    paddingBottom: 100, // Added padding to ensure content is visible above bottom nav bar
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logoutItem: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  logoutIconContainer: {
    backgroundColor: '#fee2e2',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  logoutText: {
    color: '#dc2626',
  },
});