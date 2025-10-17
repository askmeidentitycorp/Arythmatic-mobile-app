import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/config';

export default function ExportButton({ onExport, loading }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onExport} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Export</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
