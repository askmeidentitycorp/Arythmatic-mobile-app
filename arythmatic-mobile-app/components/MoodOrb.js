// components/MoodOrb.js
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { emotionColors } from '../constants/lumi';

export default function MoodOrb({ emotion = 'neutral', listening = false, size = 16, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (listening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.2, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 900, useNativeDriver: false }),
        ])
      ).start();
    } else {
      scale.stopAnimation();
      glow.stopAnimation();
      scale.setValue(1);
      glow.setValue(0);
    }
  }, [listening]);

  const color = emotionColors[emotion] || emotionColors.neutral;
  const shadow = glow.interpolate({ inputRange: [0,1], outputRange: [0,8] });

  const Orb = (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size, height: size, borderRadius: size/2,
          backgroundColor: color,
          transform: [{ scale }],
          shadowColor: color,
          shadowOpacity: 0.9,
          shadowRadius: shadow,
          shadowOffset: { width: 0, height: 0 },
          elevation: listening ? 6 : 2,
        }
      ]}
    />
  );

  if (onPress) return <TouchableOpacity onPress={onPress}>{Orb}</TouchableOpacity>;
  return <View>{Orb}</View>;
}

const styles = StyleSheet.create({
  orb: {
  },
});
