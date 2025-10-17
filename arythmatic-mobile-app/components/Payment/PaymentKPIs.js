import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

export default function PaymentKPIs({ payments, totalCount, title = 'Payments Summary' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.totalCount}>Total Payments: {totalCount}</Text>
      {/* Additional KPI metrics can go here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: colors.panel,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  totalCount: {
    fontSize: 16,
    color: colors.subtext,
  },
});
