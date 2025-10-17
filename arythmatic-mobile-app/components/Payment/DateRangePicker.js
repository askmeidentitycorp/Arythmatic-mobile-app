import { StyleSheet, Text, TextInput, View } from 'react-native';

const DateRangePicker = ({ startDate, endDate, onDateRangeChange }) => {
  return (
    <View style={styles.container}>
      <Text>Start Date:</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={(text) => onDateRangeChange({ start_date: text, end_date: endDate })}
        placeholder="YYYY-MM-DD"
      />
      <Text>End Date:</Text>
      <TextInput
        style={styles.input}
        value={endDate}
        onChangeText={(text) => onDateRangeChange({ start_date: startDate, end_date: text })}
        placeholder="YYYY-MM-DD"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export default DateRangePicker;
