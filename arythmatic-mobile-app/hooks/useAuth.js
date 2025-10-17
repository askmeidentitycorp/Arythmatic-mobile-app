// hooks/useAuth.js
import { useState, useRef } from "react";
import { Alert } from "react-native";

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const passwordRef = useRef(null);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleLogin = () => {
    const newErrors = { email: "", password: "" };
    if (!email || !isValidEmail(email))
      newErrors.email = "Please enter a valid email address.";
    if (!password || password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) {
      Alert.alert("Login Failed", "Please fix the highlighted fields.");
      return;
    }
    setLoggedIn(true);
  };

  return {
    loggedIn,
    setLoggedIn,
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
  };
}
