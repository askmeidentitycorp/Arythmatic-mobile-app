// components/Interaction/InteractionCard.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

const StatusBadge = ({ status }) => {
  const good = status === "completed" || status === "Completed";
  const warn = status === "in_progress" || status === "In Progress";
  let bg = "rgba(167,174,192,0.1)";
  let br = "#2a3450";
  let fg = "#A7AEC0";
  if (good) {
    bg = "rgba(49,199,106,0.12)";
    br = "#31C76A";
    fg = "#31C76A";
  } else if (warn) {
    bg = "rgba(244,183,64,0.15)";
    br = "#6b5221";
    fg = "#F4B740";
  }
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: br }]}>
      <Text style={[styles.pillText, { color: fg }]}>{status}</Text>
    </View>
  );
};

const Tag = ({ label, intent = "info" }) => {
  const stylesByIntent =
    intent === "danger"
      ? { bg: "rgba(241,99,100,0.15)", border: "#70373a", text: "#F16364" }
      : { bg: "rgba(107,92,231,0.15)", border: "#3f387e", text: "#A6A4FF" };
  return (
    <View style={[styles.pill, { backgroundColor: stylesByIntent.bg, borderColor: stylesByIntent.border }]}>
      <Text style={[styles.pillText, { color: stylesByIntent.text }]}>{label}</Text>
    </View>
  );
};

const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    if (String(d) === "Invalid Date" || !iso) return "—";
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } catch {
    return "—";
  }
};

const InteractionCard = ({ interaction, expanded, onToggle, onAction }) => {
  const customerName = interaction.customer_details?.displayName || 
                      interaction.customer_details?.name || 
                      interaction.customer || 
                      "Unknown Customer";
  
  const assignedToName = interaction.sales_rep_details?.name || 
                        interaction.assigned_to_name || 
                        interaction.assignedTo || 
                        "Unassigned";

  const interactionType = interaction.interaction_type || interaction.interactionType || "General";
  const status = interaction.status || "new";
  const priority = interaction.priority || "medium";
  const description = interaction.description || "";

  return (
    <View style={styles.card}>
      {/* Top row */}
      <TouchableOpacity style={styles.cardHeader} onPress={onToggle}>
        <View style={styles.cardHeaderContent}>
          <Text style={styles.customerName}>{customerName}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.assignedTo}>Assigned: {assignedToName}</Text>
            <Tag label={interactionType} intent="info" />
          </View>
        </View>
        <StatusBadge status={status} />
      </TouchableOpacity>

      {/* Middle row */}
      <View style={styles.cardTags}>
        <Tag label={`Priority: ${priority}`} intent={priority === "high" || priority === "High" ? "danger" : "info"} />
        {interaction.scheduled_date || interaction.scheduledDate ? (
          <Tag label={`Scheduled: ${fmtDate(interaction.scheduled_date || interaction.scheduledDate)}`} intent="info" />
        ) : null}
        {interaction.follow_up_date || interaction.followUpDate ? (
          <Tag label={`Follow-up: ${fmtDate(interaction.follow_up_date || interaction.followUpDate)}`} intent="info" />
        ) : null}
      </View>

      {/* Description */}
      {description && (
        <Text style={styles.description} numberOfLines={expanded ? undefined : 2} ellipsizeMode="tail">
          {description}
        </Text>
      )}

      {/* Meta & Actions toggle */}
      <View style={styles.cardFooter}>
        <View style={styles.cardMetaInfo}>
          <Text style={styles.metaText}>CREATED: {fmtDate(interaction.created_at)}</Text>
          <Text style={styles.metaText}>UPDATED: {fmtDate(interaction.updated_at)}</Text>
        </View>
        <TouchableOpacity style={styles.dotsButton} onPress={onAction}>
          <Text style={styles.dots}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded View */}
      {expanded && (
        <View style={styles.expandedBox}>
          <View style={styles.tabContent}>
            <Text style={styles.detailText}>Customer: {customerName}</Text>
            <Text style={styles.detailText}>Assigned To: {assignedToName}</Text>
            <Text style={styles.detailText}>Type: {interactionType}</Text>
            <Text style={styles.detailText}>Status: {status}</Text>
            <Text style={styles.detailText}>Priority: {priority}</Text>
            <Text style={styles.detailText}>Products: {interaction.products?.length || 0}</Text>
            <Text style={styles.detailText}>Notes: {interaction.notes?.length || 0}</Text>
          </View>
        </View>
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
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderContent: {
    flex: 1,
    paddingRight: 16,
  },
  customerName: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  assignedTo: {
    color: colors.subtext,
    fontSize: 13,
  },
  cardTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  description: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardMetaInfo: {
    flex: 1,
  },
  metaText: {
    color: colors.subtext,
    fontSize: 12,
    marginBottom: 2,
  },
  dotsButton: {
    padding: 4,
  },
  dots: {
    fontSize: 20,
    color: colors.subtext,
    fontWeight: "bold",
  },
  expandedBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  tabContent: {
    marginBottom: 4,
  },
  detailText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 6,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default InteractionCard;
