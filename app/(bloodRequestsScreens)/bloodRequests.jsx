import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
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

// Mock data for blood requests
const mockBloodRequests = [
  {
    _id: '1',
    bloodType: 'A+',
    patientName: 'John Doe',
    hospitalName: 'City General Hospital',
    status: 'urgent',
    priority: 'high',
    unitsNeeded: 3,
    urgencyLevel: 'Critical',
    createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
    progress: 75,
  },
  {
    _id: '2',
    bloodType: 'O-',
    patientName: 'Sarah Johnson',
    hospitalName: 'St. Mary Medical Center',
    status: 'pending',
    priority: 'urgent',
    unitsNeeded: 2,
    urgencyLevel: 'High',
    createdAt: new Date('2024-01-14T14:20:00Z').toISOString(),
    progress: 30,
  },
  {
    _id: '3',
    bloodType: 'B+',
    patientName: 'Michael Smith',
    hospitalName: 'Regional Medical Hospital',
    status: 'approved',
    priority: 'medium',
    unitsNeeded: 1,
    urgencyLevel: 'Medium',
    createdAt: new Date('2024-01-13T09:15:00Z').toISOString(),
    progress: 100,
  },
  {
    _id: '4',
    bloodType: 'AB-',
    patientName: 'Emily Davis',
    hospitalName: 'University Hospital',
    status: 'fulfilled',
    priority: 'low',
    unitsNeeded: 4,
    urgencyLevel: 'Low',
    createdAt: new Date('2024-01-12T16:45:00Z').toISOString(),
    progress: 100,
  },
  {
    _id: '5',
    bloodType: 'O+',
    patientName: 'Robert Wilson',
    hospitalName: 'Emergency Care Center',
    status: 'rejected',
    priority: 'medium',
    unitsNeeded: 2,
    urgencyLevel: 'Medium',
    createdAt: new Date('2024-01-11T11:00:00Z').toISOString(),
    progress: 0,
  },
];

export default function BloodBank() {
  const navigation = useNavigation();
  
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authToken, setAuthToken] = useState(null);

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
      case 'urgent':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'fulfilled':
        return '#14b8a6';
      default:
        return '#6b7280';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#10b981';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  // Get blood type background color
  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': '#fef2f2',
      'A-': '#fef2f2',
      'B+': '#f0fdf4',
      'B-': '#f0fdf4',
      'AB+': '#fefce8',
      'AB-': '#fefce8',
      'O+': '#eff6ff',
      'O-': '#eff6ff',
    };
    return colors[bloodType] || '#f8fafc';
  };

  const getBloodTypeTextColor = (bloodType) => {
    const colors = {
      'A+': '#dc2626',
      'A-': '#dc2626',
      'B+': '#16a34a',
      'B-': '#16a34a',
      'AB+': '#ca8a04',
      'AB-': '#ca8a04',
      'O+': '#2563eb',
      'O-': '#2563eb',
    };
    return colors[bloodType] || '#374151';
  };

  // Simulate API call to fetch blood requests
  const fetchBloodRequests = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBloodRequests(mockBloodRequests);
    } catch (error) {
      console.error('Error fetching blood requests:', error);
      Alert.alert('Error', 'Failed to fetch blood requests. Please try again.');
    } finally {
      setLoading(false);
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
      await fetchBloodRequests();
    };
    
    initializeScreen();
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchBloodRequests(),
        checkAuthStatus()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle new request navigation
  const handleNewRequest = () => {
    if (authToken) {
      navigation.navigate('NewRequest');
    } else {
      Alert.alert(
        'Login Required',
        'Please login to create a new blood request',
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
  const handleMenuPress = () => {
    Alert.alert(
      'Options',
      'Choose an option',
      [
        {
          text: 'Refresh',
          onPress: onRefresh,
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

  // Render blood request item
  const renderBloodRequestItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => {
          console.log('Pressed blood request:', item._id);
          // navigation.navigate('BloodRequestDetails', { requestId: item._id });
        }}
        activeOpacity={0.7}
      >
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.bloodTypeBadge,
                { backgroundColor: getBloodTypeColor(item.bloodType) },
              ]}
            >
              <MaterialIcons
                name="bloodtype"
                size={16}
                color={getBloodTypeTextColor(item.bloodType)}
              />
              <Text
                style={[
                  styles.bloodTypeText,
                  { color: getBloodTypeTextColor(item.bloodType) },
                ]}
              >
                {item.bloodType}
              </Text>
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
          <View style={styles.headerRight}>
            {item.priority && (
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: `${getPriorityColor(item.priority)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    { color: getPriorityColor(item.priority) },
                  ]}
                >
                  {item.priority.toUpperCase()}
                </Text>
              </View>
            )}
            <Icon name="chevron-right" size={16} color="#9ca3af" />
          </View>
        </View>

        {/* Patient Information */}
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {item.patientName}
          </Text>
          {item.hospitalName && (
            <View style={styles.hospitalInfo}>
              <Icon name="map-pin" size={14} color="#6b7280" />
              <Text style={styles.hospitalName}>{item.hospitalName}</Text>
            </View>
          )}
        </View>

        {/* Request Details */}
        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="droplet" size={14} color="#6b7280" />
              <Text style={styles.detailLabel}>Units needed:</Text>
              <Text style={styles.detailValue}>
                {item.unitsNeeded}
              </Text>
            </View>
            {item.urgencyLevel && (
              <View style={styles.detailItem}>
                <Icon name="clock" size={14} color="#6b7280" />
                <Text style={styles.detailLabel}>Urgency:</Text>
                <Text style={styles.detailValue}>{item.urgencyLevel}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer with Date and Actions */}
        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Icon name="calendar" size={12} color="#9ca3af" />
            <Text style={styles.dateText}>
              {formatDate(item.createdAt)}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                console.log('Share blood request:', item._id);
              }}
            >
              <Icon name="share-2" size={14} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                console.log('Bookmark blood request:', item._id);
              }}
            >
              <Icon name="bookmark" size={14} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

      </TouchableOpacity>
    );
  };

  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.loadingCard}>
        <View style={styles.loadingHeader}>
          <View style={styles.loadingBadge}>
            <View style={styles.loadingCircle} />
            <View style={styles.loadingCircle} />
          </View>
          <View style={styles.loadingBadge}>
            <View style={styles.loadingCircle} />
          </View>
        </View>
          <View style={styles.loadingContent}>
            <View style={styles.loadingLine} />
            <View style={styles.loadingLineShort} />
          </View>
        </View>
      ))}
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialIcons name="bloodtype" size={64} color="#cbd5e1" />
      <Text style={styles.emptyStateTitle}>No Blood Requests</Text>
      <Text style={styles.emptyStateSubtitle}>
        {authToken 
          ? 'Create your first blood request to get started' 
          : 'Login to view and create blood requests'
        }
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={handleNewRequest}
      >
        <Text style={styles.emptyStateButtonText}>
          {authToken ? 'Create Request' : 'Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={20} color="#374151" />
          <Text style={styles.headerTitle}>Track your blood enquiries</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.headerRight}
          onPress={handleMenuPress}
          activeOpacity={0.7}
        >
          <MaterialIcons name="more-vert" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && !isRefreshing ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={bloodRequests}
            renderItem={renderBloodRequestItem}
            keyExtractor={(item, index) => item._id || `blood-request-${index}`}
            contentContainerStyle={[
              styles.listContainer,
              bloodRequests.length === 0 && styles.listContainerEmpty
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
          onPress={handleNewRequest}
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  headerRight: {
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
  // Blood Request Card Styles
  requestCard: {
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bloodTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  bloodTypeText: {
    fontSize: 12,
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  patientInfo: {
    marginBottom: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hospitalName: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  timeText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14b8a6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
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
    height: 100,
  },
  loadingCircle: {
    backgroundColor: '#f3f3f3ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    height: 20,
    width: 50,
  },
  loadingHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  loadingBadge: {
    flexDirection: 'row',
    gap: 8,
    height: 24,
  },
  loadingLine: {
    width: '100%',
    height: 16,
    backgroundColor: '#f3f3f3ff',
    borderRadius: 4,
    marginBottom: 8,
  },
  loadingLineShort: {
    width: '70%',
    height: 14,
    backgroundColor: '#f3f3f3ff',
    borderRadius: 4,
    marginBottom: 12,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingDate: {
    width: 80,
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
  },
  loadingActions: {
    width: 60,
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
    bottom: 20,
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