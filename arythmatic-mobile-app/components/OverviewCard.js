// components/OverviewCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/config";

export default function OverviewCard({ label, value, color = colors.text }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: 16,
    margin: 6,
    minWidth: "45%",
  },
  label: { color: colors.subtext, fontSize: 13, marginBottom: 8 },
  value: { fontSize: 20, fontWeight: "bold" },
});
