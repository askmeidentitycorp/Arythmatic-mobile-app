// components/Dashboard/ProductCard.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/config';

const ProductCard = React.memo(({ product }) => {
  // Safety checks
  if (!product) {
    return (
      <View style={styles.productCard}>
        <Text style={styles.productName}>No product data</Text>
      </View>
    );
  }

  return (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name || 'Unknown Product'}
        </Text>
        <View style={[
          styles.productTypeBadge,
          product.type === 'Digital' ? styles.digitalBadge : styles.serviceBadge
        ]}>
          <Text style={styles.productTypeText}>
            {product.type || 'Service'}
          </Text>
        </View>
      </View>
      <View style={styles.productFooter}>
        <Text style={styles.productRevenue}>
          {product.revenue || '$0'}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: colors.panel || colors.bg || '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border || '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    color: colors.text || '#000000',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  productTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  digitalBadge: {
    backgroundColor: (colors.primary || '#6B5CE7') + '20',
  },
  serviceBadge: {
    backgroundColor: (colors.warn || '#F4B740') + '20',
  },
  productTypeText: {
    color: colors.text || '#000000',
    fontSize: 10,
    fontWeight: '600',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productRevenue: {
    color: colors.text || '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProductCard;
