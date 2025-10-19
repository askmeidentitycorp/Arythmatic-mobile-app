// components/SalesRep/SalesRepCard.js
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { colors } from '../../constants/config';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const StatusBadge = ({ status }) => {
  const isActive = status === "active";
  return (
    <View style={[styles.pill, { 
      backgroundColor: isActive ? "rgba(49,199,106,0.12)" : "rgba(167,174,192,0.1)",
      borderColor: isActive ? "#31C76A" : "#2a3450",
    }]}>
      <Text style={[styles.pillText, { 
        color: isActive ? "#31C76A" : "#A7AEC0" 
      }]}>
        {isActive ? "Active" : "Inactive"}
      </Text>
    </View>
  );
};

const Tag = ({ label, intent = "info" }) => {
  const stylesByIntent =
    intent === "danger"
      ? { bg: "rgba(241,99,100,0.15)", border: "#70373a", text: "#F16364" }
      : { bg: "rgba(107,92,231,0.15)", border: "#3f387e", text: "#A6A4FF" };
  
  return (
    <View style={[styles.pill, { 
      backgroundColor: stylesByIntent.bg, 
      borderColor: stylesByIntent.border 
    }]}>
      <Text style={[styles.pillText, { color: stylesByIntent.text }]}>
        {label}
      </Text>
    </View>
  );
};

const SalesRepCard = ({ salesRep, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");
  const actionsMenuAnim = useRef(new Animated.Value(0)).current;

  const name = salesRep.name || `${salesRep.firstName || ''} ${salesRep.lastName || ''}`.trim();
  const email = salesRep.email || "—";
  const employeeId = salesRep.employeeId || salesRep.employee_id || "—";
  const status = salesRep.status || "active";
  const role = salesRep.role || "sales_agent";
  
  // Format role for display
  const displayRole = role === "sales_agent" ? "Sales Agent" : "Admin";
  const permissions = role === "admin" ? "Full Access" : "Sales Access";

  useEffect(() => {
    Animated.timing(actionsMenuAnim, {
      toValue: actionsVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [actionsVisible]);

  const toggleActions = () => {
    setActionsVisible(!actionsVisible);
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    setActiveTab("roles");
  };

  const handleAction = (action) => {
    onAction?.(salesRep, action);
    setActionsVisible(false);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity style={styles.topRow} activeOpacity={0.9} onPress={toggleExpanded}>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtle}>{email}</Text>
          <Text style={styles.muted}>ID: {employeeId}</Text>
        </View>
        <TouchableOpacity onPress={toggleActions} style={styles.dotsButton}>
          <Text style={styles.dotsText}>⋮</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Badges */}
      <View style={styles.badgesRow}>
        <Tag label={displayRole} intent={role === "admin" ? "danger" : "info"} />
        <StatusBadge status={status} />
        <Tag label={permissions} intent={role === "admin" ? "danger" : "info"} />
      </View>

      {/* Expanded View */}
      {expanded && (
        <View style={styles.expandedBox}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => setActiveTab("roles")}
              style={[styles.tabBtn, activeTab === "roles" && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === "roles" && styles.tabTextActive]}>
                Roles & Permissions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("account")}
              style={[styles.tabBtn, activeTab === "account" && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === "account" && styles.tabTextActive]}>
                Account Details
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "roles" ? (
            <View style={styles.tabContent}>
              <Text style={styles.detailText}>
                {displayRole} – {role === "admin" ? "all permissions" : "generate sales"}
              </Text>
            </View>
          ) : (
            <View style={styles.tabContent}>
              <Text style={styles.detailText}>Email: {email}</Text>
              <Text style={styles.detailText}>Employee ID: {employeeId}</Text>
              <Text style={styles.detailText}>Status: {status}</Text>
              <Text style={styles.detailText}>Phone: {salesRep.phone || "—"}</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions Menu */}
      {actionsVisible && (
        <Animated.View style={[styles.actionsMenu, { opacity: actionsMenuAnim }]}>
          {[
            "View Details",
            "Edit Sales Rep",
            "View Performance",
            "Show Invoices",
            "Show Interactions",
            "Deactivate",
            "Delete",
          ].map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionRow}
              onPress={() => handleAction(action)}
            >
              <Text style={[
                styles.actionText, 
                action === "Delete" && { color: "red" }
              ]}>
                {action}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "visible",
  },
  topRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 6 
  },
  badgesRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 6, 
    marginBottom: 6 
  },
  name: { 
    color: colors.text, 
    fontWeight: "700", 
    fontSize: 15 
  },
  subtle: { 
    color: colors.subtext, 
    fontSize: 12 
  },
  muted: { 
    color: "#7e88a6", 
    fontSize: 11 
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginRight: 6,
    marginBottom: 6,
  },
  pillText: { 
    fontSize: 12, 
    fontWeight: "600" 
  },
  expandedBox: { 
    marginTop: 8, 
    borderTopWidth: 1, 
    borderTopColor: colors.border, 
    paddingTop: 8 
  },
  tabRow: { 
    flexDirection: "row", 
    marginBottom: 10 
  },
  tabBtn: { 
    marginRight: 10, 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 6 
  },
  tabBtnActive: { 
    backgroundColor: colors.primary 
  },
  tabText: { 
    color: colors.subtext, 
    fontSize: 13 
  },
  tabTextActive: { 
    color: "#fff", 
    fontWeight: "700" 
  },
  tabContent: { 
    marginBottom: 10 
  },
  detailText: { 
    color: colors.text, 
    fontSize: 13, 
    marginBottom: 4 
  },
  dotsButton: { 
    paddingHorizontal: 8, 
    paddingVertical: 4 
  },
  dotsText: { 
    fontSize: 20, 
    color: colors.subtext 
  },
  actionsMenu: {
    position: "absolute",
    right: 10,
    top: 40,
    backgroundColor: colors.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    zIndex: 999,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    minWidth: 160,
  },
  actionRow: { 
    paddingVertical: 6 
  },
  actionText: { 
    color: colors.text, 
    fontSize: 14 
  },
});

export default SalesRepCard;
