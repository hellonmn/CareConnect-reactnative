// components/SortSection.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SortSection({ selectedSort, onSortChange }) {
  const sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "rating", label: "Rating (High to Low)" },
    { value: "experience", label: "Experience (High to Low)" },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sort By</Text>
      {sortOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.optionRow,
            selectedSort === option.value && styles.selectedOptionRow,
          ]}
          onPress={() => onSortChange(option.value)}
        >
          <Text
            style={[
              styles.optionText,
              selectedSort === option.value && styles.selectedOptionText,
            ]}
          >
            {option.label}
          </Text>
          {selectedSort === option.value && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  selectedOptionRow: {
    backgroundColor: "#E5F3FF",
    borderWidth: 1,
    borderColor: "#14B8A6",
  },
  optionText: {
    fontSize: 14,
    color: "#666",
  },
  selectedOptionText: {
    color: "#14B8A6",
    fontWeight: "500",
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#14B8A6",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

