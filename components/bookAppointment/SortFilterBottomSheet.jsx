// components/SortFilterBottomSheet.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import SortSection from "./SortSection";
import FilterSection from "./FilterSection";

const { height: screenHeight } = Dimensions.get("window");

export default function SortFilterBottomSheet({
  visible,
  onClose,
  currentSortBy,
  currentFilters,
  onApply,
  onClear,
}) {
  const [localSortBy, setLocalSortBy] = useState(currentSortBy);
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [translateY] = useState(new Animated.Value(screenHeight));

  useEffect(() => {
    if (visible) {
      setLocalSortBy(currentSortBy);
      setLocalFilters(currentFilters);
      showBottomSheet();
    } else {
      hideBottomSheet();
    }
  }, [visible]);

  const showBottomSheet = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 10,
      friction: 50,
    }).start();
  };

  const hideBottomSheet = () => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        showBottomSheet();
      }
    },
  });

  const handleApply = () => {
    onApply(localSortBy, localFilters);
  };

  const handleClear = () => {
    setLocalSortBy("name");
    setLocalFilters({ experience: "", availability: "", rating: "" });
    onClear();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragHandle} />
          
          <Text style={styles.title}>Sort & Filter</Text>
          
          <SortSection
            selectedSort={localSortBy}
            onSortChange={setLocalSortBy}
          />
          
          <FilterSection
            filters={localFilters}
            onFiltersChange={setLocalFilters}
          />
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: screenHeight * 0.8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#14B8A6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

