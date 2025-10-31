// components/CustomerCard.js
import { useRef, useState } from 'react';
import {
    Animated,
    LayoutAnimation,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { colors } from '../../constants/config';


const StatusBadge = ({ status }) => {
  const isActive = status === "Active" || status === true;
  return (
    <View style={[styles.statusBadge, { 
      backgroundColor: isActive ? "rgba(49,199,106,0.12)" : "rgba(167,174,192,0.1)",
      borderColor: isActive ? "#31C76A" : "#A7AEC0",
    }]}>
      <Text style={[styles.statusText, { 
        color: isActive ? "#31C76A" : "#A7AEC0" 
      }]}>
        {isActive ? "Active" : "Inactive"}
      </Text>
    </View>
  );
};

const CustomerCard = ({ customer, onActionPress }) => {
  const [expanded, setExpanded] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("Basic Information");
  const actionsMenuAnim = useRef(new Animated.Value(0)).current;

  const displayName = customer.displayName || 
    `${customer.firstName} ${customer.lastname || customer.lastName}`.trim();
  const email = customer.contact_details?.emails?.[0]?.email || "—";
  const phone = customer.contact_details?.phones?.[0]?.phone || "—";
  const status = customer.status || (customer.is_deleted ? "Inactive" : "Active");

  const toggleActions = () => {
    const newValue = !actionsVisible;
    setActionsVisible(newValue);
    
    Animated.timing(actionsMenuAnim, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    setActiveTab("Basic Information");
  };

  const handleAction = (action) => {
    onActionPress(customer, action);
    setActionsVisible(false);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.type}>{customer.type}</Text>
          <Text style={styles.id}>ID: {customer.id}</Text>
        </View>
        <TouchableOpacity onPress={toggleActions} style={styles.actionsButton}>
          <Text style={styles.actionsIcon}>⋮</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Status and Tags */}
      <View style={styles.badgesRow}>
        <StatusBadge status={status} />
        {customer.entity_tags?.map((tag, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Basic Info */}
      <Text style={styles.infoText}>Email: {email}</Text>
      <Text style={styles.infoText}>Phone: {phone}</Text>
      <Text style={styles.infoText}>Country: {customer.countryCode || "—"}</Text>
      <Text style={styles.infoText}>
        Created: {new Date(customer.created_at || Date.now()).toLocaleDateString()}
      </Text>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.tabRow}>
            {[
              { label: "Basic", value: "Basic Information" },
              { label: "Contact", value: "Contact Details" },
              { label: "Notes", value: "Notes" }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setActiveTab(tab.value)}
                style={[styles.tab, activeTab === tab.value && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === tab.value && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabContent}>
            {activeTab === "Basic Information" && (
              <>
                <Text style={styles.detailText}>First Name: {customer.firstName}</Text>
                <Text style={styles.detailText}>Last Name: {customer.lastname}</Text>
                <Text style={styles.detailText}>Type: {customer.type}</Text>
                <Text style={styles.detailText}>Country: {customer.countryCode}</Text>
              </>
            )}
            {activeTab === "Contact Details" && (
              <>
                <Text style={styles.detailText}>Email: {email}</Text>
                <Text style={styles.detailText}>Phone: {phone}</Text>
              </>
            )}
            {activeTab === "Notes" && (
              <Text style={styles.detailText}>
                {customer.contact_details?.notes?.[0]?.note || "No notes available"}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Actions Menu */}
      {actionsVisible && (
        <Animated.View style={[styles.actionsMenu, { opacity: actionsMenuAnim }]}>
          {[
            "View Details",
            "Edit Customer", 
            "View Interactions",
            "View Invoices",
            "Audit History",
            status === "Active" ? "Deactivate" : "Activate",
            "Delete"
          ].map((action) => (
            <TouchableOpacity
              key={action}
              style={styles.actionItem}
              onPress={() => handleAction(action)}
            >
              <Text style={[
                styles.actionText,
                (action === "Delete" || action === "Deactivate") && { color: "#ff6b6b" }
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
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  type: {
    color: colors.subtext,
    fontSize: 14,
    marginBottom: 2,
  },
  id: {
    color: '#7e88a6',
    fontSize: 12,
  },
  actionsButton: {
    padding: 8,
  },
  actionsIcon: {
    fontSize: 20,
    color: colors.subtext,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tag: {
    backgroundColor: "rgba(107,92,231,0.15)", 
    borderColor: "#3f387e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    color: "#A6A4FF",
    fontSize: 12,
    fontWeight: '600',
  },
  infoText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 4,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: colors.subtext,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  tabContent: {
    paddingTop: 8,
  },
  detailText: {
    color: colors.text,
    fontSize: 13,
    marginBottom: 4,
  },
  actionsMenu: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: colors.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    minWidth: 150,
  },
  actionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
  },
});

export default CustomerCard;
