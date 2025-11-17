import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { styles } from './style';

interface AlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
}

export const Alert = ({ visible, title, message, onClose, confirmText = "OK" }:AlertProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          
          <View style={styles.body}>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}