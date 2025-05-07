import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Button from './ui/Button';
const ReviewModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0); 
  return (
    <>
     <TouchableOpacity style={styles.writeReviewButton}
        onPress={() => setModalVisible(true)}
     >
    <Text style={styles.writeReviewText}>Написати відгук</Text>
    </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Відгук</Text>
            <View style={styles.starContainer}>
            {[...Array(5)].map((_, i) => (
              <FontAwesome
                key={i}
                name="star"
                size={28}
                color={i < Math.floor(rating) ? "#facc15" : "#ccc"}
                onPress={() => setRating(i + 1)}
                style={{ marginRight: 5 }}
              />
            ))}
            </View>
            <Pressable
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 10,
                    minHeight: 60,
                    marginBottom: 10,
                    justifyContent: 'center',
                }}
                onPress={() => {}}
            >
                <Text style={{ color: reviewText ? '#222' : '#888' }}>
                    {reviewText || 'Ваш відгук...'}
                </Text>
            </Pressable>
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
                setReviewText('');
                setRating(0);
                setModalVisible(false);
              }}
            >
              Відправити
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
};
const styles = StyleSheet.create({
    writeReviewButton: {
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ddd",
      },
      writeReviewText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#333",
      },
  selectValue: {
    fontSize: 14,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  star: {
    marginRight: 5,
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
    marginBottom: 10,
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
  cancelButton: {
    marginRight: 20,
    padding: 10,
  },
  confirmButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
});
export default ReviewModal;
