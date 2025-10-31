// components/Customer/CustomerPagination.js

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/config';

const CustomerPagination = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  hasNext,
  hasPrevious,
  loading = false
}) => {
  // Don't render if no data
  if (!totalCount || totalCount === 0) {
    return null;
  }

  const handlePrevious = () => {
    const targetPage = currentPage - 1;
    console.log('Previous button clicked:', {
      currentPage,
      targetPage,
      hasPrevious,
      loading,
      canNavigate: hasPrevious && currentPage > 1 && !loading
    });
    
    if (hasPrevious && currentPage > 1 && !loading) {
      console.log('Calling onPageChange for previous page:', targetPage);
      onPageChange(targetPage);
    } else {
      console.log('Previous navigation blocked');
    }
  };

  const handleNext = () => {
    const targetPage = currentPage + 1;
    console.log('Next button clicked:', {
      currentPage,
      targetPage,
      totalPages,
      hasNext,
      loading,
      canNavigate: hasNext && currentPage < totalPages && !loading
    });
    
    if (hasNext && currentPage < totalPages && !loading) {
      console.log('Calling onPageChange for next page:', targetPage);
      onPageChange(targetPage);
    } else {
      console.log('Next navigation blocked');
    }
  };

  // Calculate proper display values
  const startItem = ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);
  
  console.log('Rendering pagination:', {
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    loading,
    startItem,
    endItem,
    totalCount
  });
  
  return (
    <View style={styles.paginationContainer}>
      <View style={styles.paginationInfo}>
        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages}
        </Text>
        <Text style={styles.paginationSubtext}>
          Showing {startItem}-{endItem} of {totalCount} items ({pageSize} per page)
        </Text>
      </View>
      
      <View style={styles.paginationButtons}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            (!hasPrevious || currentPage <= 1 || loading) && styles.paginationButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={!hasPrevious || currentPage <= 1 || loading}
        >
          <Text
            style={[
              styles.paginationButtonText,
              (!hasPrevious || currentPage <= 1 || loading) && styles.paginationButtonTextDisabled,
            ]}
          >
            {loading ? 'Loading...' : 'Previous'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.pageIndicator}>
          <Text style={styles.pageNumber}>
            {loading ? '...' : currentPage}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.paginationButton,
            (!hasNext || currentPage >= totalPages || loading) && styles.paginationButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!hasNext || currentPage >= totalPages || loading}
        >
          <Text
            style={[
              styles.paginationButtonText,
              (!hasNext || currentPage >= totalPages || loading) && styles.paginationButtonTextDisabled,
            ]}
          >
            {loading ? 'Loading...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border || '#2a2f3d',
  },
  paginationInfo: {
    flex: 1,
  },
  paginationText: {
    color: colors.text || '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationSubtext: {
    color: colors.subtext || '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paginationButton: {
    backgroundColor: colors.primary || '#6B5CE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
  },
  paginationButtonDisabled: {
    backgroundColor: colors.border || '#2a2f3d',
  },
  paginationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  paginationButtonTextDisabled: {
    color: colors.subtext || '#9ca3af',
  },
  pageIndicator: {
    backgroundColor: colors.panel || '#1a1d29',
    borderWidth: 1,
    borderColor: colors.border || '#2a2f3d',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 40,
  },
  pageNumber: {
    color: colors.text || '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomerPagination;
