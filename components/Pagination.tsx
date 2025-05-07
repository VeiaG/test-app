import { primaryColor } from '@/config/Colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) {
    return null;
  }
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, 4);
      }
      if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }
      if (start > 2) {
        pageNumbers.push('...');
      }
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };
  return (
    <View style={styles.container}>
      {}
      <TouchableOpacity
        style={[
          styles.navButton,
          currentPage === 1 && styles.disabledButton
        ]}
        disabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
      >
        <Text style={[
          styles.navButtonText,
          currentPage === 1 && styles.disabledButtonText
        ]}>
          ←
        </Text>
      </TouchableOpacity>
      {}
      <View style={styles.pageNumbersContainer}>
        {getPageNumbers().map((page, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pageButton,
              page === currentPage && styles.activePageButton,
              page === '...' && styles.ellipsisButton
            ]}
            disabled={page === '...'}
            onPress={() => typeof page === 'number' && onPageChange(page)}
          >
            <Text style={[
              styles.pageButtonText,
              page === currentPage && styles.activePageButtonText
            ]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {}
      <TouchableOpacity
        style={[
          styles.navButton,
          currentPage === totalPages && styles.disabledButton
        ]}
        disabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
      >
        <Text style={[
          styles.navButtonText,
          currentPage === totalPages && styles.disabledButtonText
        ]}>
          →
        </Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#f2f2f2',
  },
  activePageButton: {
    backgroundColor: primaryColor,
  },
  ellipsisButton: {
    backgroundColor: 'transparent',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activePageButtonText: {
    color: '#fff',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: '#f2f2f2',
  },
  disabledButton: {
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  disabledButtonText: {
    color: '#999',
  },
});
export default Pagination;