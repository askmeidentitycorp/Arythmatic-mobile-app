// screens/LoginScreen.js
import React, { useEffect } from "react";
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import { colors } from "../constants/config";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/LoginForm";

export default function LoginScreen({ onLogin }) {
  const auth = useAuth();

  // When the internal auth state flips to true, notify the app shell
  useEffect(() => {
    if (auth.loggedIn) {
      typeof onLogin === "function" && onLogin();
    }
  }, [auth.loggedIn, onLogin]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <LoginForm {...auth} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
