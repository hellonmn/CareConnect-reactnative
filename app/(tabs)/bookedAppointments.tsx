import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Mock data for booked appointments
const mockAppointments = [
  {
    _id: '1',
    doctorName: 'Dr. Naman Jangir',
    specialty: 'Cardiologist',
    hospital: 'City General Hospital',
    status: 'pending',
    appointmentDate: new Date('2024-01-18T10:30:00Z').toISOString(),
    appointmentTime: '10:30 AM',
    duration: '30 mins',
    type: 'consultation',
    fees: 800,
    bookedAt: new Date('2024-01-15T14:20:00Z').toISOString(),
    patientNotes: 'Regular checkup',
  },
  {
    _id: '2',
    doctorName: 'Dr. Lakshya Agrawal',
    specialty: 'BGMI',
    hospital: 'St. Mary Medical Center',
    status: 'confirmed',
    appointmentDate: new Date('2024-01-20T14:00:00Z').toISOString(),
    appointmentTime: '2:00 PM',
    duration: '45 mins',
    type: 'follow-up',
    fees: 1200,
    bookedAt: new Date('2024-01-14T09:15:00Z').toISOString(),
    patientNotes: 'Follow-up consultation',
  },
  {
    _id: '3',
    doctorName: 'Dr. Lakshya Agrawal',
    specialty: 'BGMI',
    hospital: 'Regional Medical Hospital',
    status: 'pending',
    appointmentDate: new Date('2024-01-22T09:15:00Z').toISOString(),
    appointmentTime: '9:15 AM',
    duration: '30 mins',
    type: 'consultation',
    fees: 1000,
    bookedAt: new Date('2024-01-16T11:30:00Z').toISOString(),
    patientNotes: 'Knee pain evaluation',
  },
  {
    _id: '4',
    doctorName: 'Unknown Doctor',
    specialty: 'Specialty Unknown',
    hospital: 'University Hospital',
    status: 'confirmed',
    appointmentDate: new Date('2024-01-25T16:30:00Z').toISOString(),
    appointmentTime: '4:30 PM',
    duration: '60 mins',
    type: 'procedure',
    fees: 2500,
    bookedAt: new Date('2024-01-12T08:45:00Z').toISOString(),
    patientNotes: 'Diagnostic procedure',
  },
  {
    _id: '5',
    doctorName: 'Dr. Lakshya Agrawal',
    specialty: 'BGMI',
    hospital: 'Emergency Care Center',
    status: 'pending',
    appointmentDate: new Date('2024-01-28T11:00:00Z').toISOString(),
    appointmentTime: '11:00 AM',
    duration: '30 mins',
    type: 'consultation',
    fees: 900,
    bookedAt: new Date('2024-01-17T15:20:00Z').toISOString(),
    patientNotes: 'General health checkup',
  },
  {
    _id: '6',
    doctorName: 'Dr. Lakshya Agrawal',
    specialty: 'BGMI',
    hospital: 'Community Health Center',
    status: 'confirmed',
    appointmentDate: new Date('2024-02-01T13:45:00Z').toISOString(),
    appointmentTime: '1:45 PM',
    duration: '30 mins',
    type: 'consultation',
    fees: 700,
    bookedAt: new Date('2024-01-18T12:10:00Z').toISOString(),
    patientNotes: 'Routine examination',
  },
];

export default function BookedAppointments() {
  const navigation = useNavigation();
  
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      case 'completed':
        return '#14b8a6';
      case 'rescheduled':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  // Get appointment type color
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'consultation':
        return '#3b82f6';
      case 'follow-up':
        return '#10b981';
      case 'procedure':
        return '#f59e0b';
      case 'emergency':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // Get specialty background color
  const getSpecialtyColor = (specialty) => {
    const colors = {
      'Cardiologist': '#fef2f2',
      'BGMI': '#f0fdf4',
      'Orthopedic': '#fefce8',
      'Dermatologist': '#eff6ff',
      'Neurologist': '#f3e8ff',
      'Specialty Unknown': '#f8fafc',
    };
    return colors[specialty] || '#f8fafc';
  };

  const getSpecialtyTextColor = (specialty) => {
    const colors = {
      'Cardiologist': '#dc2626',
      'BGMI': '#16a34a',
      'Orthopedic': '#ca8a04',
      'Dermatologist': '#2563eb',
      'Neurologist': '#7c3aed',
      'Specialty Unknown': '#374151',
    };
    return colors[specialty] || '#374151';
  };

  // Check if appointment is upcoming
  const isUpcoming = (appointmentDate) => {
    return new Date(appointmentDate) > new Date();
  };

  // Simulate API call to fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointments(mockAppointments);
      setFilteredAppointments(mockAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to fetch appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(appointment =>
        appointment.doctorName.toLowerCase().includes(query.toLowerCase()) ||
        appointment.specialty.toLowerCase().includes(query.toLowerCase()) ||
        appointment.hospital.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAppointments(filtered);
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setAuthToken(token);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeScreen = async () => {
      await checkAuthStatus();
      await fetchAppointments();
    };
    
    initializeScreen();
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchAppointments(),
        checkAuthStatus()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle new appointment navigation
  const handleNewAppointment = () => {
    if (authToken) {
      navigation.navigate('BookAppointment');
    } else {
      Alert.alert(
        'Login Required',
        'Please login to book a new appointment',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }
  };

  // Handle menu options
  const handleNotificationPress = () => {
    Alert.alert(
      'Notifications',
      'No new notifications',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  // Render appointment item
  const renderAppointmentItem = ({ item, index }) => {
    const upcoming = isUpcoming(item.appointmentDate);
    
    return (
      <TouchableOpacity
        style={styles.appointmentCard}
        onPress={() => {
          console.log('Pressed appointment:', item._id);
          // navigation.navigate('AppointmentDetails', { appointmentId: item._id });
        }}
        activeOpacity={0.7}
      >
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.doctorInfo}>
            <View style={styles.avatarContainer}>
              <MaterialIcons name="person" size={24} color="#6b7280" />
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>{item.doctorName}</Text>
              <View
                style={[
                  styles.specialtyBadge,
                  { backgroundColor: getSpecialtyColor(item.specialty) },
                ]}
              >
                <Text
                  style={[
                    styles.specialtyText,
                    { color: getSpecialtyTextColor(item.specialty) },
                  ]}
                >
                  {item.specialty}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
            </Text>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="calendar" size={14} color="#6b7280" />
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {formatDate(item.appointmentDate)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="clock" size={14} color="#6b7280" />
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{item.appointmentTime}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="map-pin" size={14} color="#6b7280" />
              <Text style={styles.detailLabel}>Hospital:</Text>
              <Text style={[styles.detailValue, styles.hospitalText]} numberOfLines={1}>
                {item.hospital}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="dollar-sign" size={14} color="#6b7280" />
              <Text style={styles.detailLabel}>Fees:</Text>
              <Text style={styles.detailValue}>₹{item.fees}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.loadingCard}>
          <View style={styles.loadingHeader}>
            <View style={styles.loadingAvatar} />
            <View style={styles.loadingInfo}>
              <View style={styles.loadingLine} />
              <View style={styles.loadingLineShort} />
            </View>
            <View style={styles.loadingBadge} />
          </View>
          <View style={styles.loadingContent}>
            <View style={styles.loadingDetailsRow}>
              <View style={styles.loadingDetail} />
              <View style={styles.loadingDetail} />
            </View>
            <View style={styles.loadingDetailsRow}>
              <View style={styles.loadingDetail} />
              <View style={styles.loadingDetail} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialIcons name="event-note" size={64} color="#cbd5e1" />
      <Text style={styles.emptyStateTitle}>No Appointments Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery ? 
          `No appointments found for "${searchQuery}"` :
          authToken 
            ? 'Book your first appointment to get started' 
            : 'Login to view and book appointments'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={handleNewAppointment}
        >
          <Text style={styles.emptyStateButtonText}>
            {authToken ? 'Book Appointment' : 'Login'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booked Appointments</Text>
        
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Icon name="bell" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search appointments..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <Icon name="x" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && !isRefreshing ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={filteredAppointments}
            renderItem={renderAppointmentItem}
            keyExtractor={(item, index) => item._id || `appointment-${index}`}
            contentContainerStyle={[
              styles.listContainer,
              filteredAppointments.length === 0 && styles.listContainerEmpty
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={['#14b8a6']}
                tintColor="#14b8a6"
              />
            }
            ListEmptyComponent={!loading ? renderEmptyState : null}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewAppointment}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  notificationButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  listContainerEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 12,
  },
  // Appointment Card Styles
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  specialtyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  appointmentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  hospitalText: {
    flex: 1,
  },
  // Loading State Styles
  loadingContainer: {
    padding: 16,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },
  loadingInfo: {
    flex: 1,
  },
  loadingLine: {
    width: '70%',
    height: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginBottom: 4,
  },
  loadingLineShort: {
    width: '50%',
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  loadingBadge: {
    width: 60,
    height: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  loadingContent: {
    gap: 8,
  },
  loadingDetailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  loadingDetail: {
    flex: 1,
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
  },
  // Empty State Styles
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Floating Action Button Styles
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 90,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14b8a6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});