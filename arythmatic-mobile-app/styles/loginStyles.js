// styles/loginStyles.js
import { StyleSheet } from "react-native";
import { colors } from "../constants/config";

export default StyleSheet.create({
  loginInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 128,
  },
  input: {
    width: "100%",
    backgroundColor: "#152238",
    padding: 16,
    borderRadius: 14,
    color: "#fff",
    marginBottom: 8,
    fontSize: 16,
  },
  errorText: {
    width: "100%",
    color: "#FF8A80",
    marginBottom: 10,
    fontSize: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#152238",
    borderRadius: 14,
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, paddingVertical: 16, color: "#fff", fontSize: 16 },
  showPasswordText: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 28,
    marginTop: 8,
  },
  rememberMe: { flexDirection: "row", alignItems: "center" },
  rememberMeText: { color: "#fff", marginLeft: 8, fontSize: 14 },
  forgotPassword: { color: colors.primary, fontSize: 14 },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
});
