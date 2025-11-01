// components/LumiConsentModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/config';

export default function LumiConsentModal({ visible, onAllow, onDecline }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>LUMI — Emotion by Consent</Text>
          <Text style={styles.body}>
            Would you like me to sense your emotional tone as we talk? I can use AI to help
            understand your mood and respond more personally. You can turn this off anytime.
          </Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.allow]} onPress={onAllow}>
              <Text style={styles.btnText}>🔮 Yes, Sense My Mood</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.decline]} onPress={onDecline}>
              <Text style={styles.btnText}>🚫 No, Just Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    maxWidth: 560,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  body: { color: colors.subtext, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  allow: { backgroundColor: colors.primary, borderColor: colors.primary },
  decline: { backgroundColor: colors.panel, borderColor: colors.border },
  btnText: { color: '#fff', fontWeight: '600' },
});
