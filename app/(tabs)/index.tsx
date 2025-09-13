import Banner from "@/components/home/Banner";
import HomeHeader from "@/components/home/Header";
import QuickLinks from "@/components/home/QuickLinks";
import SearchBar from "@/components/home/SearchBar";
import TopDoctors from "@/components/home/TopDoctors";
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { 
  Easing as ReanimatedEasing, 
  cancelAnimation, 
  runOnJS, 
  useAnimatedProps, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const [showLottieAnimation, setShowLottieAnimation] = useState(false);
  const [sosActivated, setSosActivated] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState("");
  const [locationPermission, setLocationPermission] = useState(false);
  
  const progressSV = useSharedValue(0);
  const scaleSV = useSharedValue(1);
  const glowOpacitySV = useSharedValue(0);
  const translateXSV = useSharedValue(0);
  const translateYSV = useSharedValue(0);
  const lottieRef = useRef(null);
  const holdTimeoutRef = useRef(null);

  const radius = 35;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const HOLD_DURATION = 3000; // 3 seconds

  // Backend configuration
  const backendApiUrl = "https://cc-backend-0zoj.onrender.com";

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressSV.value),
  }));

  // Button container animation (scale + position adjustment)
  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = interpolate(scaleSV.value, [1, 1.3], [1, 1.3]);
    return {
      transform: [
        { translateX: translateXSV.value },
        { translateY: translateYSV.value },
        { scale }
      ],
    };
  });

  // Glow effect animation
  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacitySV.value,
    transform: [{ scale: scaleSV.value * 1.2 }],
  }));

  // Progress ring animation
  const animatedRingStyle = useAnimatedStyle(() => ({
    opacity: isHolding ? 1 : 0,
  }));

  // Request location permission on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
      } else {
        console.log('Location permission denied');
        setLocationPermission(false);
      }
    })();
  }, []);

  // Get address from coordinates using reverse geocoding
  const getAddress = async (lat, lng) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.display_name) {
        setLocation(data.display_name);
        return data.display_name;
      } else {
        setLocation("Address not found");
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setLocation("Error fetching address");
      return "Error fetching address";
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      if (!locationPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to Jaipur coordinates if location fails
      return {
        latitude: 26.9124,
        longitude: 75.7873,
      };
    }
  };

  // Store SOS data in database
  const storeInDb = async () => {
    try {
      const locationData = await getCurrentLocation();
      const address = await getAddress(locationData.latitude, locationData.longitude);

      const userData = {
        timestamp: new Date().toISOString(),
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        emergency_contacts_notified: true,
        location: address,
      };

      // Get auth token from AsyncStorage
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${backendApiUrl}/api/sos/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": authToken,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        const savedSosId = result._id;
        console.log('SOS Data stored with ID:', savedSosId);
        
        // Send emergency alert with the saved SOS ID
        await sendEmergencyAlert(savedSosId);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to store SOS data');
      }

    } catch (error) {
      console.error('Error storing SOS data:', error);
      setError(error.message || 'Failed to store SOS data. Please try again.');
      setShowLottieAnimation(false);
      setShowSOSDialog(true);
    }
  };

  // Send emergency alert using Twilio
  const sendEmergencyAlert = async (savedSosId) => {
    try {
      // Note: In a real app, you should not store sensitive credentials in the frontend
      // These should be handled by your backend API
      const twilioApi = "YOUR_TWILIO_FLOW_ID"; // Replace with actual Flow ID
      const twilioSecret = "YOUR_TWILIO_CREDENTIALS"; // Replace with actual credentials
      
      const url = `https://studio.twilio.com/v2/Flows/${twilioApi}/Executions`;
      const auth = btoa(twilioSecret);

      const formData = new URLSearchParams({
        To: "+917073197237", // Replace with actual emergency contact
        From: "+13512000815", // Replace with your Twilio number
        Parameters: JSON.stringify({
          sosId: savedSosId
        }),
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${auth}`,
        },
        body: formData,
      });

      if (response.ok) {
        console.log('Emergency alert sent successfully');
        setSosActivated(true);
        
        // Show Lottie animation first
        setShowLottieAnimation(true);
        
        // After animation, show success dialog
        setTimeout(() => {
          setShowLottieAnimation(false);
          setShowSOSDialog(true);
        }, 2500); // Lottie animation duration
      } else {
        throw new Error('Failed to send emergency alert');
      }
      
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      setError('Failed to send emergency alert. Please try again.');
      setShowLottieAnimation(false);
      setShowSOSDialog(true);
    }
  };

  const onProgressComplete = () => {
    console.log('Progress completed, triggering SOS');
    storeInDb();
  };

  const startHold = () => {
    console.log('Starting hold');
    setIsHolding(true);
    setError(null);
    
    // Reset progress
    progressSV.value = 0;
    
    // Scale up and adjust position to keep centered under finger
    scaleSV.value = withSpring(1.3, {
      damping: 15,
      stiffness: 300,
    });
    
    // Adjust position to keep button centered under finger when scaling
    const offsetAdjustment = -8; // Adjust these values as needed
    translateXSV.value = withSpring(offsetAdjustment, { damping: 15, stiffness: 300 });
    translateYSV.value = withSpring(offsetAdjustment, { damping: 15, stiffness: 300 });
    
    // Show glow effect
    glowOpacitySV.value = withTiming(0.8, { duration: 200 });
    
    // Start progress animation
    progressSV.value = withTiming(1, { 
      duration: HOLD_DURATION, 
      easing: ReanimatedEasing.linear 
    }, (finished) => {
      if (finished) {
        runOnJS(onProgressComplete)();
      }
    });
  };

  const cancelHold = () => {
    console.log('Cancelling hold');
    setIsHolding(false);
    
    // Cancel progress animation
    cancelAnimation(progressSV);
    
    // Scale down button and reset position
    scaleSV.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    
    // Reset position
    translateXSV.value = withSpring(0, { damping: 15, stiffness: 300 });
    translateYSV.value = withSpring(0, { damping: 15, stiffness: 300 });
    
    // Hide glow effect
    glowOpacitySV.value = withTiming(0, { duration: 200 });
    
    // Reset progress smoothly
    progressSV.value = withTiming(0, { duration: 300 });
  };

  const closeDialog = () => {
    setShowSOSDialog(false);
    setSosActivated(false);
    setError(null);
    
    // Reset all animations
    scaleSV.value = withSpring(1, { damping: 15, stiffness: 300 });
    glowOpacitySV.value = withTiming(0, { duration: 300 });
    translateXSV.value = withSpring(0, { damping: 15, stiffness: 300 });
    translateYSV.value = withSpring(0, { damping: 15, stiffness: 300 });
    progressSV.value = 0;
  };

  // Play Lottie animation when shown
  useEffect(() => {
    if (showLottieAnimation && lottieRef.current) {
      lottieRef.current.reset();
      lottieRef.current.play();
    }
  }, [showLottieAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
      cancelAnimation(progressSV);
      cancelAnimation(scaleSV);
      cancelAnimation(glowOpacitySV);
      cancelAnimation(translateXSV);
      cancelAnimation(translateYSV);
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} bounces={true}>
        <HomeHeader />
        <SearchBar />
        <QuickLinks />
        <Banner />
        <TopDoctors />
        <View style={{ height: 150 }}></View>
      </ScrollView>
      
      {/* Floating SOS Button */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <Animated.View style={[styles.buttonWrapper, animatedContainerStyle]}>
          {/* Glow effect background */}
          <Animated.View style={[styles.glowEffect, animatedGlowStyle]} />
          
          {/* Progress Ring - only visible when holding */}
          <Animated.View style={[styles.progressRing, animatedRingStyle]} pointerEvents="none">
            <Svg width={(radius + strokeWidth + 10) * 2} height={(radius + strokeWidth + 10) * 2}>
              {/* Background circle */}
              <Circle
                cx={radius + strokeWidth + 10}
                cy={radius + strokeWidth + 10}
                r={radius}
                stroke="rgba(239, 68, 68, 0.3)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
              <AnimatedCircle
                cx={radius + strokeWidth + 10}
                cy={radius + strokeWidth + 10}
                r={radius}
                stroke="#ef4444"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${circumference}, ${circumference}`}
                animatedProps={animatedCircleProps}
                transform={`rotate(-90 ${radius + strokeWidth + 10} ${radius + strokeWidth + 10})`}
              />
            </Svg>
          </Animated.View>
          
          {/* Main SOS Button */}
          <Pressable
            onPressIn={startHold}
            onPressOut={cancelHold}
            style={[
              styles.fab,
              sosActivated && styles.fabActivated
            ]}
          >
            <Text style={[
              styles.fabText,
              sosActivated && styles.fabTextActivated
            ]}>
              {sosActivated ? 'SENT' : 'SOS'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Lottie Animation Modal - Shows immediately after progress completion */}
      <Modal 
        transparent 
        visible={showLottieAnimation} 
        animationType="fade"
      >
        <View style={styles.lottieOverlay}>
          <View style={styles.lottieContainer}>
            <LottieView
              ref={lottieRef}
              source={require('@/assets/animation/sos.json')}
              style={styles.lottieAnimation}
              loop={false}
              autoPlay={false}
            />
          </View>
        </View>
      </Modal>

      {/* SOS Success/Error Dialog - Shows after Lottie animation */}
      <Modal 
        transparent 
        visible={showSOSDialog} 
        animationType="fade" 
        onRequestClose={closeDialog}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.dialogContainer}>
            {/* Icon container */}
            <View style={[
              styles.iconContainer,
              { backgroundColor: error ? '#fef2f2' : '#f0fdf4' }
            ]}>
              {error ? (
                <Text style={styles.errorIcon}>✕</Text>
              ) : (
                <Text style={styles.successIcon}>✓</Text>
              )}
            </View>

            {/* Title */}
            <Text style={styles.dialogTitle}>
              {error ? 'Error Sending Alert' : 'Emergency Alert Sent'}
            </Text>

            {/* Message */}
            <Text style={styles.dialogMessage}>
              {error || 'Your emergency alert has been successfully transmitted. Help is on the way.'}
            </Text>

            {/* Location info */}
            {location && !error && (
              <Text style={styles.locationText}>
                Location: {location}
              </Text>
            )}

            {/* Close button */}
            <Pressable onPress={closeDialog} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 40
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    zIndex: 1000,
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabActivated: {
    backgroundColor: '#10b981',
  },
  fabText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fabTextActivated: {
    fontSize: 12,
  },
  glowEffect: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ef444466',
    opacity: 0,
  },
  progressRing: {
    position: 'absolute',
  },
  // Lottie Animation Modal Styles
  lottieOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieContainer: {
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  // Dialog Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    maxWidth: 400,
    width: '90%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 36,
    color: '#10b981',
    fontWeight: 'bold',
  },
  errorIcon: {
    fontSize: 36,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  dialogMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  closeButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
});