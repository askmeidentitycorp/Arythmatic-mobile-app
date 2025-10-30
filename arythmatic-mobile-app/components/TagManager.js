// components/TagManager.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { colors } from '../constants/config';
import tagService from '../services/tagService';
import entityTagService from '../services/entityTagService';

/**
 * TagManager Component
 * Modal for assigning/removing tags to/from entities
 * 
 * @param {boolean} visible - Modal visibility
 * @param {function} onClose - Close handler
 * @param {string} entityType - "Customer" | "Product" | "Interaction"
 * @param {string} entityId - Entity UUID
 * @param {string} entityName - Entity display name
 */

export default function TagManager({ visible, onClose, entityType, entityId, entityName }) {
  const [allTags, setAllTags] = useState([]);
  const [assignedTags, setAssignedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);

  // Fetch tags on mount
  useEffect(() => {
    if (visible) {
      fetchTags();
      fetchAssignedTags();
    }
  }, [visible, entityId]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await tagService.getAll({ search: searchQuery });
      setAllTags(response.results || response || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      Alert.alert('Error', 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTags = async () => {
    try {
      const response = await entityTagService.getTagsForEntity(entityType, entityId);
      setAssignedTags((response.results || response || []).map(et => et.tag));
    } catch (error) {
      console.error('Error fetching assigned tags:', error);
    }
  };

  const handleToggleTag = async (tag) => {
    const isAssigned = assignedTags.some(t => t.id === tag.id || t === tag.id);

    try {
      if (isAssigned) {
        // Find and remove
        const entityTag = await entityTagService.getTagsForEntity(entityType, entityId);
        const assignment = (entityTag.results || entityTag || []).find(
          et => (et.tag?.id || et.tag) === tag.id
        );
        
        if (assignment) {
          await entityTagService.removeTag(assignment.id);
          setAssignedTags(prev => prev.filter(t => (t.id || t) !== tag.id));
          Alert.alert('Success', `Removed tag "${tag.name}"`);
        }
      } else {
        // Assign
        await entityTagService.assignTag({
          tag: tag.id,
          entity_type: entityType,
          entity_id: entityId,
        });
        setAssignedTags(prev => [...prev, tag]);
        Alert.alert('Success', `Assigned tag "${tag.name}"`);
      }
    } catch (error) {
      console.error('Error toggling tag:', error);
      Alert.alert('Error', error.message || 'Failed to update tag');
    }
  };

  const handleCreateTag = () => {
    Alert.prompt(
      'Create New Tag',
      'Enter tag name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (tagName) => {
            if (!tagName || !tagName.trim()) return;
            
            try {
              setCreating(true);
              const newTag = await tagService.create({
                name: tagName.trim(),
                category: entityType,
                color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
              });
              
              setAllTags(prev => [newTag, ...prev]);
              Alert.alert('Success', `Tag "${tagName}" created!`);
            } catch (error) {
              console.error('Error creating tag:', error);
              Alert.alert('Error', 'Failed to create tag');
            } finally {
              setCreating(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const isTagAssigned = (tag) => {
    return assignedTags.some(t => (t.id || t) === tag.id);
  };

  const renderTag = ({ item: tag }) => {
    const assigned = isTagAssigned(tag);

    return (
      <TouchableOpacity
        style={[styles.tagItem, assigned && styles.tagItemAssigned]}
        onPress={() => handleToggleTag(tag)}
      >
        <View style={[styles.tagColor, { backgroundColor: tag.color || colors.primary }]} />
        <View style={styles.tagInfo}>
          <Text style={styles.tagName}>{tag.name}</Text>
          {tag.category && (
            <Text style={styles.tagCategory}>{tag.category}</Text>
          )}
        </View>
        <Text style={[styles.tagStatus, assigned && styles.tagStatusAssigned]}>
          {assigned ? '✓' : '+'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Manage Tags</Text>
              <Text style={styles.subtitle}>{entityName}</Text>
              <Text style={styles.entityType}>{entityType}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search & Create */}
          <View style={styles.actions}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search tags..."
              placeholderTextColor={colors.subtext}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                fetchTags();
              }}
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateTag}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.createButtonText}>+ New</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Tags List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading tags...</Text>
            </View>
          ) : (
            <FlatList
              data={allTags}
              renderItem={renderTag}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.tagsList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No tags found</Text>
                  <TouchableOpacity onPress={handleCreateTag} style={styles.emptyButton}>
                    <Text style={styles.emptyButtonText}>Create First Tag</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}

          {/* Assigned Count */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {assignedTags.length} tag{assignedTags.length !== 1 ? 's' : ''} assigned
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 2,
  },
  entityType: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: colors.subtext,
    fontSize: 14,
  },
  tagsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagItemAssigned: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  tagColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  tagCategory: {
    fontSize: 12,
    color: colors.subtext,
  },
  tagStatus: {
    fontSize: 20,
    color: colors.subtext,
    fontWeight: '600',
  },
  tagStatusAssigned: {
    color: colors.primary,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'center',
  },
});
