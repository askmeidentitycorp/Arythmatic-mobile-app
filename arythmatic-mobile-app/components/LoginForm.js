// components/LoginForm.js
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import styles from "../styles/loginStyles";
import { colors } from "../constants/config";

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  showPassword,
  setShowPassword,
  errors,
  setErrors,
  passwordRef,
  handleLogin,
}) {
  const loginDisabled =
    !email || !password || !!errors.email || !!errors.password;

  return (
    <View style={styles.loginInner}>
      

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8B93A6"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (errors.email) setErrors((e) => ({ ...e, email: "" }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Password */}
      <View style={styles.passwordContainer}>
        <TextInput
          ref={passwordRef}
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#8B93A6"
          secureTextEntry={showPassword}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors((e) => ({ ...e, password: "" }));
          }}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
          <Text style={styles.showPasswordText}>
            {showPassword ? "Show" : "Hide"}
          </Text>
        </TouchableOpacity>
      </View>
      {!!errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      {/* Options */}
      <View style={styles.optionsRow}>
        <View style={styles.rememberMe}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            thumbColor={rememberMe ? colors.primary : "#aaa"}
          />
          <Text style={styles.rememberMeText}>Remember me</Text>
        </View>

        <TouchableOpacity
          onPress={() => alert("Forgot Password flow goes here")}
        >
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.button, loginDisabled && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loginDisabled}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
