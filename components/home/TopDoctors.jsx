import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import MarkerIcon from "../../assets/images/icons/marker.svg";
import StarIcon from "../../assets/images/icons/star.svg";
import UserMdIcon from "../../assets/images/icons/user-md.svg";

export default function TopDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://careconnect-arya.onrender.com/api/doctors/getAllDoctors')
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data || []); // depends on API response shape
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching doctors:', error);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Top Doctors</Text>
        <Text style={styles.viewAll}>View all</Text>
      </View>

      {/* Doctor Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={[styles.card, styles.skeletonCard]}>
                <View style={[styles.avatar, styles.skeletonAvatar]} />
                <View style={styles.skeletonText} />
                <View style={styles.badges}>
                  <View style={styles.skeletonBadge} />
                  <View style={styles.skeletonBadge} />
                </View>
              </View>
            ))
          : doctors.map((doc) => (
              <View key={doc._id} style={styles.card}>
                <View style={styles.avatar}>
                  <UserMdIcon width={30} fill="#00000030" />
                </View>
                <Text style={styles.name}>{doc.doctorName}</Text>
                <View style={styles.badges}>
                  <View style={styles.ratingBadge}>
                    <StarIcon width={12} height={12} fill="#14B8A6" />
                    <Text style={styles.ratingText}>{doc.rating || 0}</Text>
                  </View>
                  <View style={styles.distanceBadge}>
                    <MarkerIcon width={12} height={12} fill="#00000030" />
                    <Text style={styles.distanceText}>{doc.distance || 0}</Text>
                  </View>
                </View>
              </View>
            ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: 24,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewAll: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#f6f6f6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  scrollContainer: {
    marginTop: 16,
    gap: 12,
  },
  card: {
    width: 144,
    borderWidth: 1,
    borderColor: '#f6f6f6ff',
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f7f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 24,
    height: 24,
    color: '#D1D5DB',
  },
  name: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    backgroundColor: '#CCFBF1',
    borderRadius: 50,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#14B8A6',
  },
  distanceBadge: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7f7',
    borderRadius: 50,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // Skeleton styles
  skeletonCard: {
    backgroundColor: '#F3F4F6',
  },
  skeletonAvatar: {
    backgroundColor: '#D1D5DB',
  },
  skeletonText: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginTop: 8,
  },
  skeletonBadge: {
    width: 30,
    height: 10,
    borderRadius: 9999,
    backgroundColor: '#D1D5DB',
  },
});
