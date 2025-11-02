// components/Sidebar.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import SidebarItem from "./SidebarItem";
import { colors } from "../constants/config";

export default function Sidebar({
  menuOpen,
  setMenuOpen,
  currentScreen,
  setCurrentScreen,
  businessScreen,
  setBusinessScreen,
}) {
  const widthAnim = useRef(new Animated.Value(menuOpen ? 270 : 64)).current;
  const slideAnim = useRef(new Animated.Value(menuOpen ? 0 : -200)).current;
  const labelOpacity = useRef(new Animated.Value(menuOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: menuOpen ? 270 : 64,
        duration: 280,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: menuOpen ? 0 : -200,
        duration: 280,
        useNativeDriver: false,
      }),
      Animated.timing(labelOpacity, {
        toValue: menuOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Handle navigation and auto-collapse sidebar
  const handleNavigation = (screen, businessKey = null) => {
    setCurrentScreen(screen);
    if (businessKey) {
      setBusinessScreen(businessKey);
    }
    // Auto-collapse sidebar after navigation
    setMenuOpen(false);
  };

  return (
    <Animated.View
      style={[
        styles.sideMenu,
        { width: widthAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {/* Collapse button only */}
      <View style={styles.sidebarHeader}>
        <TouchableOpacity onPress={toggleMenu} style={styles.collapseButton}>
          <Text style={styles.collapseButtonText}>
            {menuOpen ? "˄" : "˅"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Dashboard */}
        <SidebarItem
          icon="▤"
          label="Dashboard"
          active={currentScreen === "Dashboard"}
          onPress={() => handleNavigation("Dashboard")}
          showLabel={menuOpen}
          labelOpacity={labelOpacity}
        />

        {/* Business group */}
        <BusinessGroup
          menuOpen={menuOpen}
          labelOpacity={labelOpacity}
          currentScreen={currentScreen}
          businessScreen={businessScreen}
          onSelect={(key) => handleNavigation("Business", key)}
        />
      </ScrollView>
    </Animated.View>
  );
}

/** Collapsible "Business" menu with all modules */
function BusinessGroup({
  menuOpen,
  labelOpacity,
  currentScreen,
  businessScreen,
  onSelect,
}) {
  const [open, setOpen] = useState(true);

  const items = [
    { key: "SalesReps", icon: "◉", label: "Sales Reps" },
    { key: "Customers", icon: "◉", label: "Customers" },
    { key: "Products", icon: "◉", label: "Products" },
    { key: "Interactions", icon: "◉", label: "Interactions" },
    { key: "Invoices", icon: "◉", label: "Invoices" },
    { key: "Payments", icon: "◉", label: "Payments" },
  ];

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.groupRow}
        onPress={() => setOpen((o) => !o)}
      >
        <Text style={styles.groupIcon}>▣</Text>
        {menuOpen && (
          <>
            <Animated.Text
              numberOfLines={1}
              style={[styles.groupTitle, { opacity: labelOpacity }]}
            >
              Business
            </Animated.Text>
            <Text style={styles.groupCaret}>{open ? "▴" : "▾"}</Text>
          </>
        )}
      </TouchableOpacity>

      {menuOpen && open && (
        <View style={styles.submenu}>
          {items.map((it) => (
            <SidebarItem
              key={it.key}
              icon={it.icon}
              label={it.label}
              active={
                currentScreen === "Business" && businessScreen === it.key
              }
              onPress={() => onSelect(it.key)}
              showLabel={menuOpen}
              labelOpacity={labelOpacity}
            />
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sideMenu: {
    backgroundColor: colors.panel,
    paddingTop: 18,
    paddingHorizontal: 12,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  collapseButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#18233A",
    borderRadius: 6,
  },
  collapseButtonText: { color: colors.text, fontWeight: "600", fontSize: 14 },

  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  groupIcon: {
    width: 26,
    textAlign: "center",
    marginRight: 10,
    color: colors.subtext,
    fontSize: 16,
  },
  groupTitle: { color: colors.text, fontSize: 16, fontWeight: "700", flex: 1 },
  groupCaret: { color: colors.subtext, fontSize: 14 },

  submenu: { marginTop: 6, paddingRight: 8, paddingLeft: 44, gap: 8 },
});