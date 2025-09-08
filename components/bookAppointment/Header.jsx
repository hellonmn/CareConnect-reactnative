import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
// import your icons here: e.g., AngleLeftIcon, FilterIcon, RefreshIcon
import AngleLeftIcon from "../../assets/images/icons/angle-left.svg";

export default function Header({ setShowFilterModal, forceRefresh, loading }) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="Back to Home"
      >
        {/* Replace with your own icon */}
        <AngleLeftIcon width={20} height={20} />
        <Text style={styles.title}>Book an appointment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute', // fixed at top
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // if gap doesn't work in your version, use marginLeft
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 14,
    color: '#6B7280',
  },
  spin: {
    // basic "spin" style; for real animation use react-native-reanimated or Lottie
    transform: [{ rotate: '45deg' }],
  },
});
