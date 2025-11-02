// components/Product/ProductCard.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { colors } from '../../constants/config';

const Badge = ({ text, tone = "good" }) => {
  const bg = tone === "good" ? "rgba(49,199,106,0.12)" : tone === "warn" ? "rgba(244,183,64,0.15)" : colors.panel;
  const fg = tone === "good" ? "#31C76A" : tone === "warn" ? "#F4B740" : colors.subtext;
  const border = tone === "good" ? "#31C76A" : tone === "warn" ? "#F4B740" : colors.border;
  
  return (
    <View style={{ 
      backgroundColor: bg, 
      paddingHorizontal: 8, 
      paddingVertical: 4, 
      borderRadius: 999,
      borderWidth: 1,
      borderColor: border
    }}>
      <Text style={{ color: fg, fontSize: 11, fontWeight: "700" }}>{text}</Text>
    </View>
  );
};

const formatMoney = (value, ccy = "USD") => {
  // Handle null, undefined, or empty string
  if (value === null || value === undefined || value === '') {
    return `${ccy} 0.00`;
  }

  // Convert string to number if needed
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if conversion was successful
  if (isNaN(numValue)) {
    return `${ccy} 0.00`;
  }

  try {
    return new Intl.NumberFormat(undefined, { 
      style: "currency", 
      currency: ccy 
    }).format(numValue);
  } catch {
    return `${ccy} ${numValue.toFixed(2)}`;
  }
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return "—";
  }
};

const ProductCard = ({ product, onAction }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Extract data with multiple fallback options
  const label = product.label || product.name || "Unnamed Product";
  const description = product.description || "No description available";
  
  const productType = (product.productType || product.product_type || "digital").toLowerCase();
  const displayProductType = productType.charAt(0).toUpperCase() + productType.slice(1);
  const isActive = product.isActive !== undefined ? product.isActive : product.is_active !== false;
  
  let price = 0;
  let currency = "USD";
  if (product.prices && product.prices.length > 0) {
    const priceObj = product.prices[0];
    price = priceObj.price || priceObj.amount || 0;
    currency = priceObj.currency || "USD";
  } else if (product.price !== undefined) {
    price = product.price;
    currency = product.currency || "USD";
  }

  const sku = product.sku || "—";
  const category = product.category || "General";
  const createdAt = product.created_at || product.createdAt;

  const actions = [
    'View Details',
    'Edit Product',
    'Duplicate',
    'Manage Pricing',
    'Manage Notes',
    'Audit History',
    isActive ? 'Deactivate' : 'Activate',
    'Delete',
  ];

  const handlePressAction = (action) => {
    setMenuOpen(false);
    onAction?.(product, action);
  };

  return (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{label}</Text>
          <View style={styles.productMeta}>
            <Badge text={displayProductType} />
            <Badge text={isActive ? "Active" : "Inactive"} tone={isActive ? "good" : "warn"} />
          </View>
        </View>
        <TouchableOpacity
          style={styles.dotsButton}
          onPress={() => setMenuOpen(!menuOpen)}
        >
          <Text style={styles.dotsText}>⋮</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.productDescription} numberOfLines={2}>
        {description}
      </Text>
      
      <View style={styles.productDetails}>
        <View style={styles.productDetail}>
          <Text style={styles.productDetailLabel}>SKU:</Text>
          <Text style={styles.productDetailValue}>{sku}</Text>
        </View>
        <View style={styles.productDetail}>
          <Text style={styles.productDetailLabel}>Category:</Text>
          <Text style={styles.productDetailValue}>{category}</Text>
        </View>
        <View style={styles.productDetail}>
          <Text style={styles.productDetailLabel}>Price:</Text>
          <Text style={[styles.productDetailValue, styles.priceText]}>
            {formatMoney(price, currency)}
          </Text>
        </View>
        <View style={styles.productDetail}>
          <Text style={styles.productDetailLabel}>Created:</Text>
          <Text style={styles.productDetailValue}>{fmtDate(createdAt)}</Text>
        </View>
      </View>

      {menuOpen && (
        <View style={styles.actionsMenu}>
          {actions.map((a) => (
            <TouchableOpacity key={a} style={styles.actionItem} onPress={() => handlePressAction(a)}>
              <Text style={[styles.actionText, (a === 'Delete' || a === 'Deactivate') && { color: '#ff6b6b' }]}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  productName: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  productDescription: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  productDetails: {
    gap: 6,
  },
  productDetail: {
    flexDirection: "row",
    alignItems: 'center',
    paddingVertical: 2,
  },
  productDetailLabel: {
    color: colors.subtext,
    fontSize: 12,
    width: 80,
    fontWeight: '600',
  },
  productDetailValue: {
    color: colors.text,
    fontSize: 12,
    flex: 1,
  },
  priceText: {
    fontWeight: '700',
    color: colors.primary,
    fontSize: 13,
  },
  dotsButton: {
    padding: 4,
  },
  dotsText: { 
    fontSize: 20, 
    color: colors.subtext 
  },
  actionsMenu: {
    position: 'absolute',
    right: 14,
    top: 38,
    backgroundColor: colors.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    zIndex: 999,
    elevation: 8,
    minWidth: 160,
  },
  actionItem: {
    paddingVertical: 8,
  },
  actionText: { color: colors.text, fontSize: 14 },
});

export default ProductCard;
