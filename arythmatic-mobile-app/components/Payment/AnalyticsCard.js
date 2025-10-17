import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

const AnalyticsCard = ({ title, value, subtitle, icon, color = colors.primary, compact = false }) => {
  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <Text style={[styles.icon, { color }]}>{icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 140,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactCard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  content: {
    flexShrink: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.subtext,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.subtext,
  },
});

export default AnalyticsCard;
