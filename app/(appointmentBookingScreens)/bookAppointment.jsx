// AppointmentScreen.js
import Header from "@/components/bookAppointment/Header";
import SortFilterBottomSheet from "@/components/bookAppointment/SortFilterBottomSheet";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import MarkerIcon from "@/assets/images/icons/marker.svg";
import SearchIcon from "@/assets/images/icons/search.svg";
import StarIcon from "@/assets/images/icons/star.svg";
import UserMdIcon from "@/assets/images/icons/user-md.svg";

export default function AppointmentScreen() {
  const navigation = useNavigation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [filters, setFilters] = useState({
    experience: "",
    availability: "",
    rating: "",
  });
  const [showSortFilterSheet, setShowSortFilterSheet] = useState(false);
  const [showRecentlyViewedSheet, setShowRecentlyViewedSheet] = useState(false);

  // Categories
  const categories = [
    { id: "all", name: "All Doctors" },
    { id: "cardiology", name: "Cardiology" },
    { id: "neurology", name: "Neurology" },
    { id: "pediatrics", name: "Pediatrics" },
    { id: "orthopedics", name: "Orthopedics" },
    { id: "dermatology", name: "Dermatology" },
  ];

  // Fetch doctors on mount / category change
  useEffect(() => {
    setLoading(true);
    fetch("https://careconnect-arya.onrender.com/api/doctors/getAllDoctors")
      .then((res) => res.json())
      .then((data) => {
        let filtered = data;
        if (selectedCategory !== "all") {
          filtered = data.filter((doc) =>
            (doc.speciality || "").toLowerCase().includes(selectedCategory)
          );
        }
        setDoctors(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  // Filter, search & sort
  const filteredDoctors = doctors
    .filter(
      (doc) =>
        doc.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!filters.rating || doc.rating >= parseFloat(filters.rating)) &&
        (!filters.experience ||
          parseInt(doc.experience) >= parseInt(filters.experience))
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.doctorName.localeCompare(b.doctorName);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "experience")
        return (b.experience || 0) - (a.experience || 0);
      return 0;
    });

  // Toggle favorite
  const toggleFavorite = (id) => {
    setFavorites((fav) =>
      fav.includes(id) ? fav.filter((f) => f !== id) : [...fav, id]
    );
  };

  // Navigate to doctor details screen
  const navigateToDocotorDetails = (doctor) => {
    // Add to recently viewed before navigation
    setRecentlyViewed((prev) =>
      [doctor, ...prev.filter((d) => d._id !== doctor._id)].slice(0, 5)
    );
    
    // Navigate to doctor details screen
    // Replace 'DoctorDetailsScreen' with your actual screen name
    navigation.navigate('doctorProfile', { 
      doctorId: doctor._id,
      doctorData: doctor 
    });
  };

  const handleApplySortFilter = (newSortBy, newFilters) => {
    setSortBy(newSortBy);
    setFilters(newFilters);
    setShowSortFilterSheet(false);
  };

  const handleClearFilters = () => {
    setSortBy("name");
    setFilters({ experience: "", availability: "", rating: "" });
  };

  // Recently Viewed Bottom Sheet Component
  const RecentlyViewedBottomSheet = () => (
    <Modal
      visible={showRecentlyViewedSheet}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowRecentlyViewedSheet(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Recently Viewed</Text>
            <TouchableOpacity 
              onPress={() => setShowRecentlyViewedSheet(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.bottomSheetContent}>
            {recentlyViewed.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No recently viewed doctors</Text>
              </View>
            ) : (
              recentlyViewed.map((doc) => (
                <TouchableOpacity
                  key={doc._id}
                  style={styles.recentDoctorItem}
                  onPress={() => {
                    setShowRecentlyViewedSheet(false);
                    navigateToDocotorDetails(doc);
                  }}
                >
                  <View style={styles.recentDoctorIcon}>
                    <UserMdIcon width={40} height={40} fill="#00000030" />
                  </View>
                  <View style={styles.recentDoctorInfo}>
                    <Text style={styles.recentDoctorName}>{doc.doctorName}</Text>
                    <Text style={styles.recentDoctorSpecialty}>{doc.speciality}</Text>
                    <View style={styles.recentDoctorMeta}>
                      <View style={styles.recentRatingBadge}>
                        <StarIcon width={10} height={10} fill="#14B8A6" />
                        <Text style={styles.recentRatingText}>{doc.rating || 0}</Text>
                      </View>
                      <View style={styles.recentDistanceBadge}>
                        <MarkerIcon width={10} height={10} fill="#9CA3AF" />
                        <Text style={styles.recentDistanceText}>{doc.distance || 0}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <Header />

      <View style={styles.searchBox}>
        <SearchIcon style={styles.searchIcon} fill="#aeaeaeff" width={20} height={26} />
        <TextInput
          placeholder="Search doctors..."
          style={styles.searchInput}
          onChangeText={setSearchQuery}
          placeholderTextColor="#aeaeaeff"
          value={searchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 10 }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={[
              styles.categoryBtn,
              selectedCategory === cat.id && styles.categoryBtnActive,
            ]}
          >
            <Text
              style={
                selectedCategory === cat.id
                  ? styles.categoryTextActive
                  : styles.categoryText
              }
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort & Filter + Recently Viewed Buttons */}
      <View style={styles.sortFilterRow}>
        <Text style={styles.resultsText}>
          {filteredDoctors.length} doctors found
        </Text>
        <View style={styles.buttonGroup}>
          {recentlyViewed.length > 0 && (
            <TouchableOpacity 
              style={styles.recentlyViewedBtn}
              onPress={() => setShowRecentlyViewedSheet(true)}
            >
              <Text style={styles.recentlyViewedBtnText}>Recent ({recentlyViewed.length})</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.sortFilterBtn}
            onPress={() => setShowSortFilterSheet(true)}
          >
            <Text style={styles.sortFilterBtnText}>Sort & Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active filters display */}
      {(sortBy !== "name" || filters.rating || filters.experience) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersLabel}>Active filters:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sortBy !== "name" && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Sort: {sortBy}</Text>
              </View>
            )}
            {filters.rating && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Rating ≥ {filters.rating}</Text>
              </View>
            )}
            {filters.experience && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Experience ≥ {filters.experience}</Text>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearFiltersText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Doctors list */}
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        filteredDoctors.map((doc) => (
          <TouchableOpacity
            key={doc._id}
            style={styles.doctorCard}
            onPress={() => navigateToDocotorDetails(doc)}
          >
            <View style={styles.iconBox}>
              <UserMdIcon width={50} height={50} fill="#00000030" />
            </View>
            <View style={styles.details}>
              <Text style={{ fontWeight: "500", fontSize: 16 }}>{doc.doctorName}</Text>
              <View style={styles.detailsBadge}>
                <View style={styles.ratingBadge}>
                  <StarIcon width={12} height={12} fill="#14B8A6" />
                  <Text style={styles.ratingText}>{doc.rating || 0}</Text>
                </View>
                <View style={styles.distanceBadge}>
                  <MarkerIcon width={12} height={12} fill="#9CA3AF" />
                  <Text style={styles.distanceText}>{doc.distance || 0}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Sort & Filter Bottom Sheet */}
      <SortFilterBottomSheet
        visible={showSortFilterSheet}
        onClose={() => setShowSortFilterSheet(false)}
        currentSortBy={sortBy}
        currentFilters={filters}
        onApply={handleApplySortFilter}
        onClear={handleClearFilters}
      />

      {/* Recently Viewed Bottom Sheet */}
      <RecentlyViewedBottomSheet />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16,
    paddingTop: 40,
    backgroundColor: "#fff" 
  },
  searchBox: {
    position: "relative",
    marginTop: 50,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    padding: 10,
    paddingLeft: 40,
    borderRadius: 50,
    borderColor: "#f6f6f6ff",
    backgroundColor: "#fefefeff",
  },
  searchIcon: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 1,
  },
  categoryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e9e7e7ff",
  },
  categoryBtnActive: {
    backgroundColor: "#14B8A6",
    borderColor: "#14B8A6",
  },
  categoryText: { color: "#333" },
  categoryTextActive: { color: "#fff" },
  sortFilterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  sortFilterBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e9e7e7ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sortFilterBtnText: {
    color: "#000",
    fontWeight: "500",
  },
  recentlyViewedBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#14B8A6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recentlyViewedBtnText: {
    color: "#14B8A6",
    fontWeight: "500",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  activeFiltersLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  filterTag: {
    backgroundColor: "#E5F3FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  filterTagText: {
    fontSize: 12,
    color: "#0066CC",
  },
  clearFiltersText: {
    fontSize: 12,
    color: "#FF4444",
    marginLeft: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginVertical: 8 },
  doctorCard: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f7f7f7f7",
    borderRadius: 20,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  iconBox: {
    backgroundColor: "#f7f7f7f7",
    borderRadius: 16,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    gap: 5
  },
  detailsBadge: {
    gap: 2,
    width: 60
  },
  ratingBadge: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7f7',
    borderRadius: 50,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    width: "100%"
  },
  ratingText: {
    fontSize: 14,
    color: '#14B8A6',
  },
  distanceBadge: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 50,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    width: "100%"
  },
  distanceText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  bottomSheetContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  recentDoctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    gap: 12,
  },
  recentDoctorIcon: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
  },
  recentDoctorInfo: {
    flex: 1,
  },
  recentDoctorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  recentDoctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  recentDoctorMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  recentRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  recentRatingText: {
    fontSize: 12,
    color: '#14B8A6',
  },
  recentDistanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  recentDistanceText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});