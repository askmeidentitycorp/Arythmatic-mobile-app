// screens/InteractionScreen.js
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { colors } from '../constants/config';

// Import hooks and components
import CustomerPagination from '../components/Customer/CustomerPagination';
import DarkPicker from '../components/Customer/DarkPicker';
import InteractionCard from '../components/Interaction/InteractionCard';
import InteractionHeader from '../components/Interaction/InteractionHeader';
import InteractionKPIs from '../components/Interaction/InteractionKPIs';
import InteractionSearchAndFilters from '../components/Interaction/InteractionSearchAndFilters';
import { useInteractionMutations, useInteractions } from '../hooks/useInteractions';
import { customerService } from '../services/customerService';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LabeledInput = ({ label, value, onChangeText, placeholder, multiline, ...rest }) => {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9aa6bf"
        style={[styles.input, multiline && { height: 100, textAlignVertical: "top" }]}
        multiline={multiline}
        {...rest}
      />
    </View>
  );
};

export default function InteractionScreen({ navigation, onBack, initialRepId, initialRepName, initialCustomerId, initialCustomerName }) {
  const [nameCache, setNameCache] = useState({});
  const fetchingIdsRef = React.useRef(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    interaction_type: '',
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    assignedTo: "",
    interactionType: "",
    status: "",
    priority: "",
    scheduledDate: "",
    followUpDate: "",
    description: "",
  });

  // Notes/Product management modals
  const [notesModal, setNotesModal] = useState({ open: false, interaction: null, newNote: "" });
  const [productsModal, setProductsModal] = useState({ open: false, interaction: null, items: [] });
  const [openActionsId, setOpenActionsId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [repFilter, setRepFilter] = useState(null);
  const [customerFilter, setCustomerFilter] = useState(null);

  const [searchParams, setSearchParams] = useState({});

  // Set rep/customer filter from props
  useEffect(() => {
    if (initialRepId && initialRepName) {
      setRepFilter({ id: initialRepId, name: initialRepName });
      setForm(prev => ({ ...prev, assignedTo: initialRepName }));
    }
    if (initialCustomerId && initialCustomerName) {
      setCustomerFilter({ id: initialCustomerId, name: initialCustomerName });
      setForm(prev => ({ ...prev, customer: initialCustomerName }));
    }
  }, [initialRepId, initialRepName, initialCustomerId, initialCustomerName]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      let params = {
        search: searchQuery,
        ...filters,
      };
      
      // Add rep/customer filter if active
      if (repFilter) params.assigned_to = repFilter.id;
      if (customerFilter) params.customer = customerFilter.id;
      
      setSearchParams(params);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, repFilter]);

  // API hooks
  const { 
    interactions, 
    loading, 
    error, 
    pagination,
    refresh,
    goToPage,
    hasMore 
  } = useInteractions(searchParams, 10, true);

  const { 
    createInteraction,
    updateInteraction, 
    deleteInteraction 
  } = useInteractionMutations();

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      status: '',
      priority: '',
      interaction_type: '',
    });
  };

  const handleClearRepFilter = () => {
    setRepFilter(null);
  };

  const handleInteractionAction = async (interaction, action) => {
    switch (action) {
      case "View Details":
        Alert.alert('Interaction Details', `Customer: ${interaction.customer_details?.displayName || interaction.customer}\nAssigned: ${interaction.assigned_to_name || interaction.assignedTo || 'Unassigned'}\nStatus: ${interaction.status}`);
        break;
      case "Edit Interaction":
        setForm({
          customer: interaction.customer || "",
          assignedTo: interaction.assignedTo || interaction.assigned_to_name || "",
          interactionType: interaction.interactionType || interaction.interaction_type || "",
          status: interaction.status || "",
          priority: interaction.priority || "",
          scheduledDate: interaction.scheduledDate || interaction.scheduled_date || "",
          followUpDate: interaction.followUpDate || interaction.follow_up_date || "",
          description: interaction.description || "",
        });
        setShowAdd(true);
        break;

      case "Create Invoice":
        if (navigation?.navigateToInvoices) {
          const cid = interaction.customer_details?.id || interaction.customer_id;
          const cname = interaction.customer_details?.displayName || interaction.customer;
          navigation.navigateToInvoices({ customerId: cid, customerName: cname, from: 'Interactions' });
        }
        break;

      case "Duplicate":
        try {
          const dup = { ...interaction, id: undefined, status: interaction.status || 'new' };
          await createInteraction(dup, true);
          refresh();
          Alert.alert('Success', 'Interaction duplicated');
        } catch (e) {
          Alert.alert('Error', 'Failed to duplicate');
        }
        break;

      case "Manage Notes":
        setNotesModal({ open: true, interaction, newNote: "" });
        break;
      case "Manage Products":
        setProductsModal({ open: true, interaction, items: interaction.products || [] });
        break;
      case "Status History":
      case "Audit History":
        Alert.alert(action, 'Not implemented yet');
        break;

      case "Mark as New":
      case "Mark as In Progress":
      case "Mark as Completed":
        const statusMap = {
          "Mark as New": "new",
          "Mark as In Progress": "in_progress",
          "Mark as Completed": "completed",
        };
        try {
          await updateInteraction(interaction.id, { status: statusMap[action] }, false, true);
          refresh();
          Alert.alert("Success", `Interaction marked as ${statusMap[action].replace('_', ' ')}`);
        } catch (error) {
          Alert.alert("Error", "Failed to update interaction status");
        }
        break;

      case "Delete":
        Alert.alert(
          "Confirm Delete",
          `Delete interaction with ${interaction.customer || 'this customer'}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteInteraction(interaction.id, true);
                  refresh();
                  Alert.alert("Success", "Interaction deleted successfully");
                } catch (error) {
                  Alert.alert("Error", "Failed to delete interaction");
                }
              },
            },
          ]
        );
        break;

      default:
        Alert.alert("Action", `${action} clicked for interaction`);
    }
    setOpenActionsId(null);
  };

  const handleAddInteraction = () => {
    setForm({
      customer: "",
      assignedTo: repFilter ? repFilter.name : "",
      interactionType: "",
      status: "",
      priority: "",
      scheduledDate: "",
      followUpDate: "",
      description: "",
    });
    setShowAdd(true);
  };

  const onSubmitAdd = async () => {
    const required = ["customer", "status"];
    const missing = required.filter((key) => !String(form[key] || "").trim());
    if (missing.length) {
      Alert.alert("Missing fields", `Please fill: ${missing.join(", ")}`);
      return;
    }

    const interactionData = {
      customer: form.customer.trim(),
      assigned_to: form.assignedTo,
      interaction_type: form.interactionType,
      status: form.status.toLowerCase(),
      priority: form.priority.toLowerCase(),
      scheduled_date: form.scheduledDate || null,
      follow_up_date: form.followUpDate || null,
      description: form.description.trim(),
    };

    try {
      await createInteraction(interactionData, true);
      setShowAdd(false);
      setForm({
        customer: "",
        assignedTo: "",
        interactionType: "",
        status: "",
        priority: "",
        scheduledDate: "",
        followUpDate: "",
        description: "",
      });
      refresh();
      Alert.alert("Success", "Interaction created successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to create interaction");
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const pageSize = 200;
      let page = 1;
      let rows = [];
      while (true) {
        const res = await interactionService.getAll({ ...searchParams, page, page_size: pageSize });
        const list = res?.results || res || [];
        rows = rows.concat(list);
        if (!res?.next || list.length === 0) break;
        page += 1;
      }
      const headers = ['id','customer','assigned_to','interaction_type','status','priority','scheduled_date'];
      const csv = [headers.join(',')].concat(
        rows.map(r => headers.map(h => JSON.stringify((r[h] ?? '').toString())).join(','))
      ).join('\n');
      const { Platform, Share } = await import('react-native');
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.setAttribute('download', 'interactions.csv');
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        await Share.share({ title: 'Interactions CSV', message: csv });
      }
    } catch (e) {
      Alert.alert('Export Failed', e.message || 'Could not export CSV');
    }
  };

  // Metrics
  const metrics = useInteractionMetrics();

  // Loading state
  if (loading && interactions.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading interactions...</Text>
      </View>
    );
  }

  // Error state
  if (error && interactions.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <InteractionHeader 
          onAddPress={handleAddInteraction}
          onExport={handleExportCSV}
          totalCount={pagination.totalCount}
          repFilter={repFilter}
          onClearRepFilter={handleClearRepFilter}
          onBack={onBack}
        />
        
        <InteractionKPIs 
          interactions={interactions}
          totalCount={metrics.totalCount}
          newCount={metrics.newCount}
          inProgressCount={metrics.inProgressCount}
          completedCount={metrics.completedCount}
          cancelledCount={metrics.cancelledCount}
        />

        <InteractionSearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Resolve customer names by id where missing */}
        {interactions.forEach?.(() => {})}
        {/* Interaction Cards */}
        {interactions.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No interactions found</Text>
            <Text style={styles.emptySubText}>Try adjusting your filters or create a new interaction</Text>
          </View>
        ) : (
          interactions.map((item) => {
            const expanded = expandedId === item.id;

            // Resolve customer name by id
            const cid = item?.customer_details?.id 
              || item?.customer_id 
              || (typeof item?.customer === 'string' ? item.customer : null);
            if (cid && !nameCache[cid] && !fetchingIdsRef.current.has(cid)) {
              fetchingIdsRef.current.add(cid);
              customerService.getById(cid)
                .then((resp) => {
                  const c = resp?.data || resp;
                  const dn = c?.displayName || c?.name || c?.full_name || c?.email;
                  if (dn) setNameCache(prev => ({ ...prev, [cid]: dn }));
                })
                .finally(() => fetchingIdsRef.current.delete(cid));
            }
            const interactionForRender = (cid && nameCache[cid])
              ? { ...item, customer_details: { ...(item.customer_details || {}), displayName: nameCache[cid] } }
              : item;
            
            return (
              <View key={item.id}>
                <InteractionCard
                  interaction={interactionForRender}
                  expanded={expanded}
                  onToggle={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setExpandedId(expanded ? null : item.id);
                  }}
                  onAction={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setOpenActionsId(openActionsId === item.id ? null : item.id);
                  }}
                />
                
                {/* Actions Menu */}
                {openActionsId === item.id && (
                  <View style={styles.actionsMenu}>
                    {[
                      "View Details",
                      "Edit Interaction",
                      "Create Invoice",
                      "Duplicate",
                      "Manage Notes",
                      "Manage Products",
                      "Status History",
                      "Audit History",
                      "Mark as New",
                      "Mark as In Progress", 
                      "Mark as Completed",
                      "Delete",
                    ].map((action, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.actionBtn}
                        onPress={() => handleInteractionAction(item, action)}
                      >
                        <Text style={[
                          styles.actionText, 
                          action === "Delete" && { color: "#ff6b6b" }
                        ]}>
                          {action}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}

       <CustomerPagination
  currentPage={pagination.currentPage}
  totalPages={pagination.totalPages}
  totalCount={pagination.totalCount}
  pageSize={20}
  hasNext={pagination.hasNext}
  hasPrevious={pagination.hasPrevious}
  onPageChange={goToPage}
  loading={loading}
/>
      </ScrollView>
      
      {/* Manage Notes Modal */}
      <Modal visible={notesModal.open} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manage Notes</Text>
                <TouchableOpacity onPress={() => setNotesModal({ open: false, interaction: null, newNote: "" })}>
                  <Text style={styles.closeX}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ padding: 14 }}>
                {(notesModal.interaction?.notes || []).map((n, i) => (
                  <Text key={i} style={[styles.detailText, { marginBottom: 8 }]}>
                    • {n.note || n}
                  </Text>
                ))}
                <LabeledInput
                  label="Add a note"
                  value={notesModal.newNote}
                  onChangeText={(v) => setNotesModal((m) => ({ ...m, newNote: v }))}
                  placeholder="Write a note..."
                  multiline
                />
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.btnGhost} onPress={() => setNotesModal({ open: false, interaction: null, newNote: "" })}>
                  <Text style={styles.btnGhostText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={async () => {
                    try {
                      const currNotes = notesModal.interaction?.notes || [];
                      const updated = notesModal.newNote
                        ? [...currNotes, { note: notesModal.newNote, created_at: new Date().toISOString() }]
                        : currNotes;
                      await updateInteraction(notesModal.interaction.id, { notes: updated }, false, true);
                      setNotesModal({ open: false, interaction: null, newNote: "" });
                      refresh();
                    } catch (e) {
                      Alert.alert('Error', 'Failed to save notes');
                    }
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Manage Products Modal */}
      <Modal visible={productsModal.open} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manage Products</Text>
                <TouchableOpacity onPress={() => setProductsModal({ open: false, interaction: null, items: [] })}>
                  <Text style={styles.closeX}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ padding: 14 }}>
                {(productsModal.items || []).map((p, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[styles.detailText, { flex: 1 }]}>• {p.name || p.label || p}</Text>
                    <TouchableOpacity onPress={() => setProductsModal((m) => ({ ...m, items: m.items.filter((_, idx) => idx !== i) }))}>
                      <Text style={{ color: '#ff6b6b', fontWeight: '700' }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <LabeledInput
                  label="Add product name"
                  value={productsModal.pendingName || ''}
                  onChangeText={(v) => setProductsModal((m) => ({ ...m, pendingName: v }))}
                  placeholder="Product name / SKU"
                />
                <TouchableOpacity
                  style={[styles.btnPrimary, { alignSelf: 'flex-start', marginTop: 8 }]}
                  onPress={() => {
                    if (!productsModal.pendingName?.trim()) return;
                    setProductsModal((m) => ({ ...m, items: [...m.items, { name: m.pendingName.trim() }], pendingName: '' }));
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Add</Text>
                </TouchableOpacity>
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.btnGhost} onPress={() => setProductsModal({ open: false, interaction: null, items: [] })}>
                  <Text style={styles.btnGhostText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={async () => {
                    try {
                      await updateInteraction(productsModal.interaction.id, { products: productsModal.items }, false, true);
                      setProductsModal({ open: false, interaction: null, items: [] });
                      refresh();
                    } catch (e) {
                      Alert.alert('Error', 'Failed to save products');
                    }
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Create Interaction Modal */}
      <Modal visible={showAdd} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Interaction</Text>
                <TouchableOpacity onPress={() => setShowAdd(false)}>
                  <Text style={styles.closeX}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 14 }}>
                <LabeledInput 
                  label="Customer *" 
                  value={form.customer} 
                  onChangeText={(v) => setForm((f) => ({ ...f, customer: v }))} 
                  placeholder="Enter customer name" 
                />
                
                <LabeledInput 
                  label="Assigned To" 
                  value={form.assignedTo} 
                  onChangeText={(v) => setForm((f) => ({ ...f, assignedTo: v }))} 
                  placeholder="Enter sales rep name" 
                />
                
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.inputLabel}>Status *</Text>
                  <DarkPicker
                    selectedValue={form.status}
                    onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                    items={[
                      { label: "Select Status", value: "" },
                      { label: "New", value: "new" },
                      { label: "In Progress", value: "in_progress" },
                      { label: "Completed", value: "completed" },
                    ]}
                    placeholder="Select Status"
                  />
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.inputLabel}>Priority</Text>
                  <DarkPicker
                    selectedValue={form.priority}
                    onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                    items={[
                      { label: "Select Priority", value: "" },
                      { label: "Low", value: "low" },
                      { label: "Medium", value: "medium" },
                      { label: "High", value: "high" },
                    ]}
                    placeholder="Select Priority"
                  />
                </View>

                <LabeledInput 
                  label="Description" 
                  value={form.description} 
                  onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} 
                  placeholder="Enter interaction description..." 
                  multiline 
                />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.btnGhost} onPress={() => setShowAdd(false)}>
                  <Text style={styles.btnGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary} onPress={onSubmitAdd}>
                  <Text style={styles.btnPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.bg, 
    paddingHorizontal: 12 
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubText: {
    color: colors.subtext,
    fontSize: 14,
    textAlign: "center",
  },
  actionsMenu: {
    backgroundColor: colors.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: -8,
    marginBottom: 12,
    marginHorizontal: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: "80%",
  },
  modalHeader: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
    flex: 1,
  },
  closeX: {
    color: colors.subtext,
    fontSize: 18,
    paddingHorizontal: 6,
  },
  modalFooter: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  btnGhost: {
    backgroundColor: colors.panel,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnGhostText: {
    color: colors.text,
    fontWeight: "700",
    textAlign: "center",
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "800",
  },
  inputLabel: {
    color: colors.subtext,
    marginBottom: 6,
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.panel,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
});
