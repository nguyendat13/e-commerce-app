import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onTrackOrder: () => void;
}

const OrderSuccessModal: React.FC<Props> = ({ visible, onClose, onTrackOrder }) => {
  const navigation = useNavigation<any>();
const [orderSuccessVisible, setOrderSuccessVisible] = React.useState(false);
const [lastOrderId, setLastOrderId] = React.useState<string | null>(null);
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="check-circle" size={48} color="green" />
          </View>
          <Text style={styles.title}>Chúc mừng!</Text>
          <Text style={styles.subtitle}>Đơn hàng của bạn đã được đặt thành công.</Text>

          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => {
              onClose();
              onTrackOrder();
            }}
          >
            <Text style={styles.trackButtonText}>Theo dõi đơn hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default OrderSuccessModal;

const styles = StyleSheet.create({
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 10,
  },
  iconCircle: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  trackButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  trackButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
