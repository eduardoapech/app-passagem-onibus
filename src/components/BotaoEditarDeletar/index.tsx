import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from './style';

interface BotaoDeletarEditarProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const BotaoDeletarEditar = ({ onEdit, onDelete }: BotaoDeletarEditarProps) => {
  return (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.editButton]} 
        onPress={onEdit}
      >
        <Text style={styles.actionButtonText}>Editar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.deleteButton]} 
        onPress={onDelete}
      >
        <Text style={styles.actionButtonText}>Deletar</Text>
      </TouchableOpacity>
    </View>
  );
};