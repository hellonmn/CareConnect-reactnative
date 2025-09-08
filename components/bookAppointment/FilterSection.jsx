// components/FilterSection.js
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

export default function FilterSection({ filters, onFiltersChange }) {
  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Filters</Text>
      
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Minimum Rating</Text>
        <TextInput
          style={styles.filterInput}
          value={filters.rating}
          onChangeText={(value) => updateFilter("rating", value)}
          placeholder="e.g., 4.0"
          keyboardType="decimal-pad"
          maxLength={3}
        />
      </View>
      
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Minimum Experience (years)</Text>
        <TextInput
          style={styles.filterInput}
          value={filters.experience}
          onChangeText={(value) => updateFilter("experience", value)}
          placeholder="e.g., 5"
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>
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
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#555",
  },
  filterInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
});