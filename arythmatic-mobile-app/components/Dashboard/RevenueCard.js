// components/Dashboard/RevenueCard.js
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/config';

const currencySymbol = (code) => ({ USD: '$', INR: '₹', EUR: '€' }[code] || code);

export default function RevenueCard({ liveRates, formatCurrency, onRefreshRates }) {
  const [showDetails, setShowDetails] = useState(true);

  const totalText = useMemo(() => {
    if (!liveRates) return formatCurrency(0);
    return formatCurrency(liveRates.totalConverted, liveRates.target);
  }, [liveRates, formatCurrency]);

  if (!liveRates) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Total Revenue (Converted)</Text>
      <Text style={styles.total}>{totalText}</Text>

      <View style={styles.convertBox}>
        <View style={styles.convertHeader}>
          <Text style={styles.convertTitle}>Converted to {liveRates.target}</Text>
          <TouchableOpacity style={styles.liveBtn} onPress={onRefreshRates}>
            <Text style={styles.liveBtnText}>Live Rates</Text>
          </TouchableOpacity>
        </View>

        {liveRates.details.map((d, idx) => (
          <View key={`${d.from}-${idx}`} style={styles.row}>
            <Text style={styles.rowText}>
              {currencySymbol(d.from)}{Math.round(d.amount).toLocaleString()}  →  {currencySymbol(d.to)}{Math.round(d.converted).toLocaleString()}  (Rate: {Number(d.rate).toFixed(4)})
            </Text>
          </View>
        ))}

        <Text style={styles.updated}>Last updated: {new Date(liveRates.lastUpdated).toLocaleTimeString()}</Text>
      </View>

      <View style={styles.originalHeader}>
        <Text style={styles.originalTitle}>Original Amounts</Text>
        <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
          <Text style={styles.toggleText}>{showDetails ? 'Hide Details' : 'Show Details'}</Text>
        </TouchableOpacity>
      </View>

      {showDetails && (
        <View style={styles.origList}>
          {liveRates.original.map((o, idx) => (
            <View key={`${o.currency}-${idx}`} style={styles.origRow}>
              <Text style={styles.origLabel}>{o.currency}:</Text>
              <Text style={styles.origValue}>
                {currencySymbol(o.currency)}{Math.round(o.amount).toLocaleString()}
              </Text>
            </View>
          ))}
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  total: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  convertBox: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  convertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  convertTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  liveBtn: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  liveBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  row: { paddingVertical: 4 },
  rowText: { color: colors.text, fontSize: 12 },
  updated: { color: colors.subtext, fontSize: 11, marginTop: 8, textAlign: 'right' },
  originalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  originalTitle: { color: colors.subtext, fontSize: 12, fontWeight: '600' },
  toggleText: { color: colors.text, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  origList: { marginTop: 4 },
  origRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  origLabel: { color: colors.subtext, fontSize: 12 },
  origValue: { color: colors.text, fontSize: 12, fontWeight: '600' },
});
