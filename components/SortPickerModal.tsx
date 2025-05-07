import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Button from './ui/Button';
const SortPickerModal = ({
  sortBy,
  setSortBy,
}: {
  sortBy: string;
  setSortBy: (val: string) => void;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSort, setTempSort] = useState(sortBy);
  const options = [
    { key: 'relevance', label: 'За релевантністю' },
    { key: 'price_asc', label: 'Ціна: від дешевих' },
    { key: 'price_desc', label: 'Ціна: від дорогих' },
    { key: 'newest', label: 'Новинки' },
  ];
  return (
    <>
    <Button
      variant="ghost"
      style={{
        paddingVertical: 10,
        paddingHorizontal: 20,
      }}
      onPress={() => setModalVisible(true)}
    >
      {options.find(o => o.key === sortBy)?.label || 'Сортувати'}
    </Button>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Сортування</Text>
          <Picker
            selectedValue={tempSort}
            onValueChange={(itemValue) => setTempSort(itemValue)}
            style={Platform.OS === 'ios' ? undefined : styles.picker}
          >
            {options.map(option => (
              <Picker.Item
                key={option.key}
                label={option.label}
                value={option.key}
                color="#000" 
              />
            ))}
          </Picker>
          <View style={styles.modalButtons}>
            <Button
              variant="ghost"
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                marginRight: 10,
              }}
              onPress={() => setModalVisible(false)}
            >
              Скасувати
            </Button>
            <Button
              variant="primary"
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
              }}
              onPress={() => {
                setSortBy(tempSort);
                setModalVisible(false);
              }}
            >
              Застосувати
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
};
const styles = StyleSheet.create({
  sortButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
});
export default SortPickerModal;
