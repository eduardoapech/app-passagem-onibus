import { Pressable, Text, ActivityIndicator } from 'react-native';
import { styles } from './style';

interface BotaoSalvarProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
}

export function BotaoSalvar({ 
  onPress, 
  loading = false, 
  disabled = false,
  title = "Salvar Transação" 
}: BotaoSalvarProps) {
  return (
    <Pressable 
      style={[
        styles.saveButton, 
        (loading || disabled) && styles.saveButtonDisabled
      ]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.saveButtonText}>{title}</Text>
      )}
    </Pressable>
  );
}