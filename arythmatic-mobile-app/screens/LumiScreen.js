// screens/LumiScreen.js
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../constants/config';
import { useLumi } from '../contexts/LumiContext';
import MoodOrb from '../components/MoodOrb';
import { emotionColors } from '../constants/lumi';
import { HELPLINES } from '../constants/crisis';

export default function LumiScreen() {
  const { consented, listening, currentEmotion, grantConsent, revokeConsent, chat } = useLumi();
  const [messages, setMessages] = useState([]); // {id, role, text, emotion}
  const [input, setInput] = useState('');
  const [crisisLock, setCrisisLock] = useState(false);
  const scrollRef = useRef(null);

  const bgTint = useMemo(() => {
    const c = emotionColors[currentEmotion?.label] || '#000';
    return c + '20'; // alpha tint
  }, [currentEmotion]);

  const send = async () => {
    const text = input.trim();
    if (!text || crisisLock) return;
    const userMsg = { id: Date.now() + '-u', role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const res = await chat(text);
    if (res.crisis) {
      setCrisisLock(true);
      setMessages(prev => [...prev, { id: Date.now() + '-c', role: 'system', text: 'Crisis detected. Showing helplines.', emotion: null }]);
      return;
    }
    const botMsg = { id: Date.now() + '-b', role: 'assistant', text: res.reply, emotion: res.emotion?.label };
    setMessages(prev => [...prev, botMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: bgTint }]} />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MoodOrb emotion={currentEmotion?.label} listening={listening} size={14} />
          <Text style={styles.title}>LUMI</Text>
        </View>
        {consented ? (
          <TouchableOpacity onPress={revokeConsent} style={styles.modeBtn}>
            <Text style={styles.modeText}>Emotion sensing: ON</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={grantConsent} style={styles.modeBtnOff}>
            <Text style={styles.modeText}>Emotion sensing: OFF</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.chat}>
        {messages.length === 0 && (
          <View style={{ padding: 12 }}>
            <Text style={styles.hi}>Hi, I’m LUMI 🌙 How are you feeling?</Text>
            <Text style={styles.hint}>{consented ? 'I’m listening for tone to respond more personally.' : 'I’ll reply in a neutral, supportive tone.'}</Text>
          </View>
        )}
        {messages.map(m => (
          <View key={m.id} style={[styles.bubble, m.role === 'user' ? styles.user : styles.bot]}>
            {m.emotion && (
              <View style={{ marginBottom: 4 }}>
                <MoodOrb emotion={m.emotion} size={10} />
              </View>
            )}
            <Text style={styles.msgText}>{m.text}</Text>
          </View>
        ))}

        {crisisLock && (
          <View style={styles.crisis}>
            <Text style={styles.crisisTitle}>If you’re in crisis, you’re not alone.</Text>
            {HELPLINES.map((h, i) => (
              <Text key={i} style={styles.crisisLine}>• {h.label}: {h.value}</Text>
            ))}
            <Text style={[styles.crisisLine, { marginTop: 8 }]}>I won’t reply further. Please reach out to a trusted person or a professional now.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.subtext}
          editable={!crisisLock}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={send} style={styles.sendBtn} disabled={crisisLock}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { color: colors.text, fontWeight: '700' },
  modeBtn: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  modeBtnOff: { backgroundColor: '#1f2a40', borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  modeText: { color: colors.text, fontSize: 12 },
  chat: { padding: 12 },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 10, marginVertical: 6 },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  bot: { alignSelf: 'flex-start', backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border },
  msgText: { color: '#fff' },
  hi: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  hint: { color: colors.subtext },
  crisis: { marginTop: 12, padding: 12, backgroundColor: '#44222a', borderRadius: 8, borderWidth: 1, borderColor: '#5b2d36' },
  crisisTitle: { color: '#ffd0d5', fontWeight: '700', marginBottom: 8 },
  crisisLine: { color: '#ffd0d5' },
  inputRow: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.text, paddingHorizontal: 10, paddingVertical: 8 },
  sendBtn: { marginLeft: 8, backgroundColor: colors.primary, paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '700' },
});
