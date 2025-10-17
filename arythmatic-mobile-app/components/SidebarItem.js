// components/SidebarItem.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, Animated } from "react-native";

const colors = {
  primary: "#6B5CE7",
  text: "#E7E9EF",
  subtext: "#A7AEC0",
};

export default function SidebarItem({
  icon,
  label,
  active,
  onPress,
  showLabel,      // boolean (menuOpen)
  labelOpacity,   // Animated.Value from parent (we fade labels)
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.pillItem, active && styles.pillItemActive]}
    >
      <Text style={[styles.pillIcon, active && styles.pillIconActive]}>{icon}</Text>

      {showLabel ? (
        <Animated.Text
          numberOfLines={1}
          style={[styles.pillText, active && styles.pillTextActive, { opacity: labelOpacity }]}
        >
          {label}
        </Animated.Text>
      ) : (
        <View />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pillItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "transparent",
  },
  pillItemActive: { backgroundColor: colors.primary },
  pillIcon: {
    width: 22,
    textAlign: "center",
    marginRight: 12,
    color: colors.subtext,
    fontSize: 14,
  },
  pillIconActive: { color: "#FFFFFF" },
  pillText: { color: colors.subtext, fontSize: 15, fontWeight: "600" },
  pillTextActive: { color: "#FFFFFF" },
});
