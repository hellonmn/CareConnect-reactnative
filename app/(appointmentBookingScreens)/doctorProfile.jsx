import MarkerIcon from "@/assets/images/icons/marker.svg";
import StarIcon from "@/assets/images/icons/star.svg";
import UserMdIcon from "@/assets/images/icons/user-md.svg";
import Header from '@/components/ui/Header';
import { useNavigation, useRoute } from "@react-navigation/native";
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get('window');

// LoadingDoctorDetails Component
const LoadingDoctorDetails = () => {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim]);

  const SkeletonBox = ({ width, height, style }) => (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#E2E8F0',
          borderRadius: 8,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingDoctorCard}>
        <SkeletonBox width={80} height={80} style={{ borderRadius: 40 }} />
        <View style={styles.loadingTextContainer}>
          <SkeletonBox width="100%" height={20} />
          <SkeletonBox width="50%" height={16} style={{ marginTop: 8 }} />
          <View style={styles.loadingBadges}>
            <SkeletonBox width={60} height={24} style={{ borderRadius: 12 }} />
            <SkeletonBox width={80} height={24} style={{ borderRadius: 12, marginTop: 4 }} />
          </View>
        </View>
      </View>

      <View style={styles.loadingAboutSection}>
        <SkeletonBox width="25%" height={20} />
        <SkeletonBox width="100%" height={16} style={{ marginTop: 12 }} />
        <SkeletonBox width="90%" height={16} style={{ marginTop: 8 }} />
        <SkeletonBox width="75%" height={16} style={{ marginTop: 8 }} />
      </View>

      <View style={styles.loadingDateSection}>
        <View style={styles.loadingDateRow}>
          {[1, 2, 3, 4].map((item) => (
            <SkeletonBox key={item} width={70} height={80} style={{ borderRadius: 12 }} />
          ))}
        </View>
      </View>

      <View style={styles.loadingSlotsSection}>
        <View style={styles.loadingSlotsRow}>
          <SkeletonBox width="30%" height={50} style={{ borderRadius: 25 }} />
          <SkeletonBox width="30%" height={50} style={{ borderRadius: 25 }} />
          <SkeletonBox width="30%" height={50} style={{ borderRadius: 25 }} />
        </View>
        <View style={styles.loadingSlotsRow}>
          <SkeletonBox width="30%" height={50} style={{ borderRadius: 25 }} />
          <SkeletonBox width="30%" height={50} style={{ borderRadius: 25 }} />
        </View>
      </View>
    </View>
  );
};

// Success Popup with Lottie Animation
const SuccessPopup = ({ show, message, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const lottieRef = useRef(null);

  useEffect(() => {
    if (show) {
      // Reset and play Lottie animation
      if (lottieRef.current) {
        lottieRef.current.reset();
        lottieRef.current.play();
      }
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [show, fadeAnim, scaleAnim]);

  return (
    <Modal transparent visible={show} animationType="none">
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.successPopup,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successAnimationContainer}>
            <LottieView
              ref={lottieRef}
              source={require('@/assets/animation/success.json')}
              style={styles.successAnimation}
              loop={false}
              autoPlay={false}
            />
          </View>
          <Text style={styles.successMessage}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Main DoctorDetails Component
const DoctorDetails = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  
  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [showBottomButtons, setShowBottomButtons] = useState(false);
  const [selectedSlotTime, setSelectedSlotTime] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const doctorApiUrl = "https://mocki.io/v1/2d8ca2d0-a5d7-4319-bc3d-2cffc0e9a1e6";
  const backendApiUrl = props.backendUrl;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const slideAnim = useRef(new Animated.Value(100)).current;

  const handleSuccessPopupVisibility = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const generateSlots = (availableDays, selectedDay) => {
    const slots = [];
    
    if (availableDays.includes(selectedDay)) {
      // Generate morning slots (8 AM to 12 PM)
      const morningSlots = [
        { slotId: "slot-8", slotStart: "08:00", slotEnd: "08:30" },
        { slotId: "slot-8-30", slotStart: "08:30", slotEnd: "09:00" },
        { slotId: "slot-9", slotStart: "09:00", slotEnd: "09:30" },
        { slotId: "slot-9-30", slotStart: "09:30", slotEnd: "10:00" },
        { slotId: "slot-10", slotStart: "10:00", slotEnd: "10:30" },
        { slotId: "slot-10-30", slotStart: "10:30", slotEnd: "11:00" },
        { slotId: "slot-11", slotStart: "11:00", slotEnd: "11:30" },
        { slotId: "slot-11-30", slotStart: "11:30", slotEnd: "12:00" },
      ];
      
      slots.push(...morningSlots);
    }
    
    return slots;
  };

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const response = await fetch(doctorApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setDoctor(result);
        setLoading(false);
        
        // Set up initial date and slots
        const today = new Date();
        const currentDay = dayNames[today.getDay()];
        const currentDate = today.getDate();
        setSelectedDate(currentDate);
        
        // Generate slots for current day if available
        if (result.availableDays && result.availableDays.includes(currentDay)) {
          const generatedSlots = generateSlots(result.availableDays, currentDay);
          setAvailableSlots(generatedSlots);
        }
      }
    } catch (error) {
      console.error("Error fetching doctor details", error);
      setLoading(false);
    }
  };

  const fetchAppointments = async (date) => {
    // Mock booked slots - you can replace this with actual API call
    const mockBookedSlots = [
      { slotId: "slot-9", time: "09:00" },
      { slotId: "slot-11", time: "11:00" },
    ];
    setBookedSlots(mockBookedSlots);
  };

  useEffect(() => {
    fetchDoctor();
  }, []);

  useEffect(() => {
    if (doctor && selectedDate) {
      const today = new Date();
      const currentDayIndex = today.getDay();
      const selectedDayIndex =
        (currentDayIndex + (selectedDate - today.getDate())) % 7;
      const selectedDay = dayNames[selectedDayIndex];

      // Generate slots for selected day if it's available
      if (doctor.availableDays && doctor.availableDays.includes(selectedDay)) {
        const generatedSlots = generateSlots(doctor.availableDays, selectedDay);
        setAvailableSlots(generatedSlots);
      } else {
        setAvailableSlots([]);
      }

      // Fetch appointments for the selected date
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const formattedDate = String(selectedDate).padStart(2, "0");
      const appointmentDate = `${today.getFullYear()}-${month}-${formattedDate}`;
      fetchAppointments(appointmentDate);

      // Clear selected slot when date changes
      setSelectedSlot("");
      setSelectedSlotTime("");
      setShowBottomButtons(false);
    }
  }, [selectedDate, doctor]);

  useEffect(() => {
    if (showBottomButtons) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showBottomButtons, slideAnim]);

  const isSlotBooked = (slotStart) => {
    const normalizeTime = (time) => {
      if (!time) return "";
      const [hours, minutes] = time.split(":");
      return `${hours.padStart(2, "0")}:${minutes}`;
    };

    const normalizedSlotStart = normalizeTime(slotStart);

    return bookedSlots.some((bookedSlot) => {
      const normalizedBookedTime = normalizeTime(bookedSlot.time);
      return normalizedBookedTime === normalizedSlotStart;
    });
  };

  const handleSlotPress = (slot) => {
    const slotValue = `${slot.slotStart} - ${slot.slotEnd}`;
    
    if (selectedSlot === slotValue) {
      setSelectedSlot("");
      setSelectedSlotId("");
      setSelectedSlotTime("");
      setShowBottomButtons(false);
    } else {
      setSelectedSlot(slotValue);
      setSelectedSlotId(slot.slotId);
      setSelectedSlotTime(slotValue);
      setShowBottomButtons(true);
    }
  };

  const handleDatePress = (day) => {
    if (selectedDate !== day) {
      setSelectedDate(day);
      setSelectedSlot("");
      setSelectedSlotTime("");
      setShowBottomButtons(false);
    }
  };

  const bookAppointment = async () => {
    if (selectedSlot) {
      const [slotStart] = selectedSlot.split(" - ");
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate).padStart(2, "0");
      const appointmentDate = `${today.getFullYear()}-${month}-${day}`;

      const payload = {
        date: appointmentDate,
        time: slotStart,
        slotId: selectedSlotId,
        doctorId: id,
        hospitalId: doctor.user,
      };

      fetchAppointments(appointmentDate);
          handleSuccessPopupVisibility();
          setSelectedSlot("");
          setShowBottomButtons(false);
      // try {
      //   const authToken = await AsyncStorage.getItem("authToken");
      //   const response = await fetch(`${backendApiUrl}/api/appointments/book`, {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       "auth-token": authToken,
      //     },
      //     body: JSON.stringify(payload),
      //   });
      //   if (response.ok) {
      //     fetchAppointments(appointmentDate);
      //     handleSuccessPopupVisibility();
      //     setSelectedSlot("");
      //     setShowBottomButtons(false);
      //   } else {
      //     Alert.alert("Error", "Error booking appointment. Please try again.");
      //   }
      // } catch (error) {
      //   console.error("Error booking appointment", error);
      //   Alert.alert("Error", "Error booking appointment. Please try again.");
      // }
    } else {
      Alert.alert("Error", "Please select a slot first.");
    }
  };

  const getCurrentDayName = () => {
    const today = new Date();
    const dayIndex = (today.getDay() + (selectedDate - today.getDate())) % 7;
    return dayNames[dayIndex];
  };

  if (loading) return <LoadingDoctorDetails />;

  const today = new Date();
  const daysInMonth = Array.from(
    { length: 31 - today.getDate() + 1 },
    (_, i) => today.getDate() + i
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBox}>
        <Header title="Select Doctor for Appointment" />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Info */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorAvatar}>
            <View style={styles.doctorAvatarCircle}>
              <UserMdIcon width={50} fill="#00000030" />
            </View>
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>
              {doctor?.doctorName || 'Dr. Lakshya Agrawal'}
            </Text>
            <Text style={styles.doctorSpecialization}>
              {doctor?.specialty || 'Cardiologist'}
            </Text>
            <View style={styles.doctorBadges}>
              <View style={styles.ratingBadge}>
                <StarIcon width={12} height={12} fill="#14B8A6" />
                <Text style={styles.ratingText}>{doctor?.rating || '0'}</Text>
              </View>
              <View style={styles.distanceBadge}>
                <MarkerIcon width={12} height={12} fill="#00000030" />
                <Text style={styles.distanceText}>{doctor?.distance || '500'}m</Text>
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutText}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Et inventore ad cum cupiditate eius asperiores, provident dolorum aut corrupti nam nemo accusamus deleniti dolore. Vitae delectus natus repellat corporis soluta.
          </Text>
        </View>

        {/* Date Selection */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.dateScrollView}
          contentContainerStyle={styles.dateContainer}
        >
          {daysInMonth.slice(0, 7).map((day, index) => {
            const dayIndex = (today.getDay() + index) % 7;
            const isSelected = selectedDate === day;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dateButton,
                  isSelected && styles.selectedDateButton,
                ]}
                onPress={() => handleDatePress(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {dayNames[dayIndex]}
                </Text>
                <Text
                  style={[
                    styles.dateText,
                    isSelected && styles.selectedDateText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slots */}
        <View style={styles.slotsContainer}>
          {availableSlots.length > 0 ? (
            <View style={styles.slotsGrid}>
              {availableSlots.map((slot, index) => {
                const isBooked = isSlotBooked(slot.slotStart);
                const isSelected = selectedSlot === `${slot.slotStart} - ${slot.slotEnd}`;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slotButton,
                      isBooked && styles.bookedSlot,
                      isSelected && styles.selectedSlot,
                    ]}
                    onPress={() => !isBooked && handleSlotPress(slot)}
                    disabled={isBooked}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isBooked && styles.bookedSlotText,
                        isSelected && styles.selectedSlotText,
                      ]}
                    >
                      {slot.slotStart} - {slot.slotEnd}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.noSlotsContainer}>
              <Text style={styles.noSlotsText}>
                No available slots for this day.
              </Text>
            </View>
          )}
        </View>

        {/* Dynamic bottom spacing - adds space when date is selected and slots are visible */}
        <View style={{ 
          height: selectedDate && availableSlots.length > 0 ? 180 : 120 
        }} />
      </ScrollView>

      {/* Bottom Booking Panel */}
      {showBottomButtons && (
        <Animated.View
          style={[
            styles.bottomPanel,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.bookingInfo}>
            <View style={styles.bookingDetails}>
              <View style={styles.calendarIcon}>
                <MarkerIcon width={20} height={20} fill="#14B8A6" />
              </View>
              <View style={styles.bookingText}>
                <Text style={styles.bookingTitle}>Book Appointment for</Text>
                <Text style={styles.bookingDateTime}>
                  {getCurrentDayName()}, {selectedDate} • {selectedSlotTime}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedSlot("");
                setSelectedSlotTime("");
                setShowBottomButtons(false);
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={bookAppointment}
          >
            <Text style={styles.bookButtonText}>Book Appointment</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <SuccessPopup
        show={showSuccess}
        message="Appointment booked successfully!"
        onClose={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 35,
  },
  headerBox: {
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginTop: 16,
    borderRadius: 16,
  },
  doctorAvatar: {
    marginRight: 16,
  },
  doctorAvatarCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#f9f9f9ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorIcon: {
    fontSize: 40,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  doctorBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    backgroundColor: '#14b8a513',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '600',
  },
  distanceBadge: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    backgroundColor: '#f9f9f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  distanceIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  aboutSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  dateScrollView: {
    marginTop: 24,
  },
  dateContainer: {
    paddingRight: 16,
  },
  dateButton: {
    width: 60,
    height: 70,
    backgroundColor: '#f9f9f9ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedDateButton: {
    backgroundColor: '#14b8a6',
  },
  dayText: {
    fontSize: 12,
    color: '#11182743',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  dateText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#11182743',
  },
  selectedDateText: {
    color: '#ffffff',
  },
  slotsContainer: {
    marginTop: 24,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotButton: {
    width: '32%',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#f5f5f5ff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  selectedSlot: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  bookedSlot: {
    backgroundColor: '#fef2f2',
    borderColor: '#fef2f2',
    opacity: 0.6,
  },
  slotText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedSlotText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  bookedSlotText: {
    color: '#dc2626',
  },
  noSlotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noSlotsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calendarIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#14b8a51a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  calendarEmoji: {
    fontSize: 20,
  },
  bookingText: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  bookingDateTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#9ca3af',
  },
  bookButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingDoctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  loadingTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  loadingBadges: {
    marginTop: 12,
  },
  loadingAboutSection: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  loadingDateSection: {
    marginTop: 24,
    paddingBottom: 16,
  },
  loadingDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  loadingSlotsSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  loadingSlotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // Success popup styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successPopup: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 40,
  },
  successAnimationContainer: {
    width: 120,
    height: 120,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successAnimation: {
    width: 150,
    height: 150,
  },
  successMessage: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default DoctorDetails;