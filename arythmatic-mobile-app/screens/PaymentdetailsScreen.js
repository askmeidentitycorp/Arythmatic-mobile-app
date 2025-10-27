// screens/PaymentDetailsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../constants/config";

export default function PaymentDetailsScreen({ route, navigation }) {
  // Get the payment ID from the route parameters
  const paymentId = route?.params?.paymentId || '';
  const [payment, setPayment] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no paymentId is provided, go back
    if (!paymentId) {
      Alert.alert("Error", "No payment ID provided");
      if (navigation && navigation.goBack) {
        navigation.goBack();
      }
      return;
    }

    const loadPayment = async () => {
      try {
        setLoading(true);
        const paymentsJson = await AsyncStorage.getItem("payments");
        if (paymentsJson) {
          const payments = JSON.parse(paymentsJson);
          const foundPayment = payments.find(p => p.id === paymentId);
          if (foundPayment) {
            setPayment(foundPayment);
          } else {
            Alert.alert("Error", "Payment not found");
            if (navigation && navigation.goBack) {
              navigation.goBack();
            }
          }
        }
      } catch (error) {
        console.error("Error loading payment:", error);
        Alert.alert("Error", "Failed to load payment details");
        if (navigation && navigation.goBack) {
          navigation.goBack();
        }
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [paymentId, navigation]);

  const handleProcessRefund = () => {
    setShowRefundModal(true);
  };

  const handleConfirmRefund = (amount, reason, date) => {
    Alert.alert(
      "Refund Processed",
      `Refund of ${amount} for payment ${payment.id} has been processed.`,
      [{ text: "OK", onPress: () => setShowRefundModal(false) }]
    );
  };

  const handleRepayPayment = () => {
    if (payment && payment.isOverdue) {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmPayment = async () => {
    if (!payment) return;
    
    try {
      const paymentsJson = await AsyncStorage.getItem("payments");
      if (paymentsJson) {
        const payments = JSON.parse(paymentsJson);
        const updatedPayments = payments.map(p => 
          p.id === payment.id ? { ...p, status: "Completed", isOverdue: false } : p
        );
        
        await AsyncStorage.setItem("payments", JSON.stringify(updatedPayments));
        setPayment(prev => ({ ...prev, status: "Completed", isOverdue: false }));
        
        Alert.alert(
          "Payment Processed",
          "Payment has been successfully processed.",
          [{ text: "OK", onPress: () => setShowConfirmationModal(false) }]
        );
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      Alert.alert("Error", "Failed to process payment");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Payment not found</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (navigation && navigation.goBack) {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.headerBackButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.headerBackButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Payment Details</Text>
            <View style={[
              styles.statusContainer,
              {
                backgroundColor: payment.isOverdue ? 'rgba(234,67,53,0.15)' : 
                                 payment.status === 'Completed' ? 'rgba(49,199,106,0.12)' : 
                                 'rgba(244,183,64,0.15)',
                borderColor: payment.isOverdue ? '#EA4335' : 
                             payment.status === 'Completed' ? '#31C76A' : 
                             '#F4B740',
              }
            ]}>
              <Text style={[
                styles.statusText,
                {
                  color: payment.isOverdue ? '#EA4335' : 
                        payment.status === 'Completed' ? '#31C76A' : 
                        '#F4B740',
                }
              ]}>
                {payment.isOverdue ? "Overdue" : payment.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>{payment.amountFormatted}</Text>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment ID</Text>
            <Text style={styles.infoValue}>{payment.id}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{payment.date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Method</Text>
            <Text style={styles.infoValue}>{payment.method}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{payment.isOverdue ? "Overdue" : payment.status}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer ID</Text>
            <Text style={styles.infoValue}>{payment.customerId}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer Name</Text>
            <Text style={styles.infoValue}>{payment.customerName}</Text>
          </View>
        </View>

        {/* Invoice Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Invoice Number</Text>
            <Text style={styles.infoValue}>{payment.invoice}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{payment.description}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {payment.isOverdue && (
            <TouchableOpacity 
              style={styles.repayButton}
              onPress={handleRepayPayment}
            >
              <Text style={styles.repayButtonText}>去还款</Text>
            </TouchableOpacity>
          )}
          
          {payment.status === "Completed" && (
            <TouchableOpacity 
              style={styles.refundButton}
              onPress={handleProcessRefund}
            >
              <Text style={styles.refundButtonText}>Process Refund</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Refund Modal */}
      <Modal visible={showRefundModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Process Refund</Text>
              <TouchableOpacity onPress={() => setShowRefundModal(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.refundDetails}>
                <Text style={styles.refundSectionTitle}>Original Payment Details</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment ID</Text>
                  <Text style={styles.detailValue}>{payment.id}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailValue}>{payment.amountFormatted}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{payment.date}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Method</Text>
                  <Text style={styles.detailValue}>{payment.method}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice</Text>
                  <Text style={styles.detailValue}>{payment.invoice}</Text>
                </View>
              </View>

              <View style={styles.refundForm}>
                <Text style={styles.refundSectionTitle}>Refund Details</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Refund Amount</Text>
                  <Text style={styles.inputValue}>{payment.amountFormatted}</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Refund Reason</Text>
                  <Text style={styles.inputValue}>Customer Request</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Refund Date</Text>
                  <Text style={styles.inputValue}>{new Date().toISOString().split('T')[0]}</Text>
                </View>
              </View>

              <View style={styles.refundSummary}>
                <Text style={styles.refundSectionTitle}>Refund Summary</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Original Amount</Text>
                  <Text style={styles.detailValue}>{payment.amountFormatted}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Refund Amount</Text>
                  <Text style={styles.detailValue}>{payment.amountFormatted}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Net Refund</Text>
                  <Text style={styles.detailValue}>{payment.amountFormatted}</Text>
                </View>
              </View>

              <Text style={styles.refundWarning}>
                Note: This action cannot be undone. Once processed, the refund will be initiated.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowRefundModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => handleConfirmRefund(payment.amountFormatted, "Customer Request", new Date().toISOString().split('T')[0])}
              >
                <Text style={styles.confirmButtonText}>Process Refund</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal visible={showConfirmationModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Status</Text>
              <TouchableOpacity onPress={() => setShowConfirmationModal(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.paymentConfirmationContainer}>
                <View style={styles.paymentStatusHeader}>
                  <Text style={styles.paymentStatusTitle}>Payment Status</Text>
                  <View style={styles.statusReceivedContainer}>
                    <Text style={styles.statusReceivedText}>Received</Text>
                  </View>
                </View>

                <View style={styles.paymentAmountContainer}>
                  <Text style={styles.paymentAmountLabel}>Amount</Text>
                  <Text style={styles.paymentAmountValue}>{payment.amountFormatted}</Text>
                </View>

                <View style={styles.paymentDetailsGrid}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Transfer ID</Text>
                    <Text style={styles.detailValue}>TRF-{Math.floor(100000 + Math.random() * 900000)}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Transfer Amount</Text>
                    <Text style={styles.detailValue}>{payment.amountFormatted}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fee</Text>
                    <Text style={styles.detailValue}>Free</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Amount</Text>
                    <Text style={styles.detailValue}>{payment.amountFormatted}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.')}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleConfirmPayment}
              >
                <Text style={styles.confirmButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerBackButton: {
    backgroundColor: colors.panel,
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  headerBackButtonText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 24,
  },
  statusContainer: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  amountLabel: {
    color: colors.subtext,
    fontSize: 16,
    marginBottom: 8,
  },
  amountValue: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  section: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: colors.subtext,
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  descriptionText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  repayButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
  },
  repayButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  refundButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  refundButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 500,
    alignSelf: 'center',
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.panel,
  },
  modalTitle: { 
    fontSize: 18,
    fontWeight: "700", 
    color: colors.text 
  },
  closeX: { 
    fontSize: 24, 
    color: colors.subtext,
    paddingHorizontal: 8,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.panel,
  },
  refundDetails: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.panel,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refundForm: {
    marginBottom: 20,
  },
  refundSummary: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.panel,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refundSectionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
  },
  refundWarning: {
    color: "#ff6b6b",
    fontSize: 14,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    color: colors.text,
    marginBottom: 6,
    fontWeight: "600",
    fontSize: 14,
  },
  inputValue: {
    color: colors.text,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    color: colors.subtext,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    flex: 2,
    textAlign: "right",
  },
  paymentConfirmationContainer: {
    backgroundColor: colors.panel,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentStatusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  paymentStatusTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 18,
  },
  statusReceivedContainer: {
    backgroundColor: "rgba(49,199,106,0.12)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#31C76A",
  },
  statusReceivedText: {
    color: "#31C76A",
    fontWeight: "600",
    fontSize: 14,
  },
  paymentAmountContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  paymentAmountLabel: {
    color: colors.subtext,
    fontSize: 14,
    marginBottom: 4,
  },
  paymentAmountValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  paymentDetailsGrid: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: colors.primary,
    fontWeight: "700",
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    fontWeight: "700",
    color: "#fff",
  },
});