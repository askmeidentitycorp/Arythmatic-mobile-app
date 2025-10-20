import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

// Fixed formatCurrency with type checking and conversion
const formatCurrency = (amount, currency) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return `${currency || 'USD'} 0.00`;
  }
  return `${currency || 'USD'} ${numAmount.toFixed(2)}`;
};

const getStatusColor = (status) => {
  switch(status) {
    case 'Completed': return colors.good;
    case 'Pending': return colors.warn;
    case 'Refunded': return colors.primary;
    case 'Voided': return colors.bad;
    default: return colors.text;
  }
};

export default function PaymentCard({ payment, onAction, onToggle, expanded, onNavigateToDetails }) {
  // Add safety checks for payment object
  if (!payment) {
    return null;
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onToggle} style={styles.header}>
        <View style={styles.main}>
          <Text style={styles.amount}>
            {formatCurrency(payment.amount, payment.currency)}
          </Text>
          <Text style={styles.method}>{payment.paymentmethod || 'N/A'}</Text>
          <Text style={[styles.status, { color: getStatusColor(payment.status) }]}>
            {payment.status || 'Unknown'}
          </Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigateToDetails?.(payment.id)}>
            <Text style={styles.actionText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onAction?.(payment, 'Edit')}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onAction?.(payment, 'Process Payment')}>
            <Text style={styles.actionText}>Process</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onAction?.(payment, 'Refund')}>
            <Text style={[styles.actionText, { color: colors.warn }]}>Refund</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onAction?.(payment, 'Delete')}>
            <Text style={[styles.actionText, { color: colors.bad }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  main: {
    flex: 1,
  },
  amount: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.text,
  },
  method: {
    fontSize: 14,
    color: colors.subtext,
    marginTop: 4,
  },
  status: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
  expandIcon: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.bg,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
  },
});
