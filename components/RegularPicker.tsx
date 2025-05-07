import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from './ui/Button';
const RegularPicker = ({
  value,
  setValue,
  options,
  buttonText,
}: {
  value: string;
  setValue: (val: string) => void;
  options: { value: string; label: string }[];
  buttonText?: string;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  return (
    <>
      <TouchableOpacity
        style={styles.selectTrigger}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectValue}>
          {buttonText || 'Вибрати'} 
        </Text>
         <Ionicons name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Вибір</Text>
          <Picker
            selectedValue={tempValue}
            onValueChange={(itemValue) => setTempValue(itemValue)}
            style={Platform.OS === 'ios' ? undefined : styles.picker}
          >
            {options.map(option => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
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
                setValue(tempValue);
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
  selectTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  selectValue: {
    fontSize: 14,
    color: '#374151',
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
export default RegularPicker;
