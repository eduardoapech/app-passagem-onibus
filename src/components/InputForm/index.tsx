import { View, Text, TextInput, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from './style';

    interface InputProps {
        label: string;
        placeholder: string;
        value?: string;
        onChangeText?: (text: string) => void;
        iconName: string;
        onPress?: () => void;
        isCombobox?: boolean;
    }

    export function InputForm({
        label,
        placeholder,
        value,
        onChangeText,
        iconName,
        onPress,
        isCombobox = false
    }: InputProps) {
        const InputComponent = isCombobox ? Pressable : View;

    return (
         <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
        
            <InputComponent 
                style={isCombobox ? styles.comboboxWrapper : styles.inputWrapper}
                onPress={isCombobox ? onPress : undefined}
            >
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#858587"
                    value={value}
                    onChangeText={onChangeText}
                    editable={!isCombobox}
                    pointerEvents={isCombobox ? 'none' : 'auto'}
                />
                <Icon 
                    name={iconName} 
                    size={25} 
                    color="#136F6C" 
                    style={styles.iconRight} 
                />
            </InputComponent>
            
            <View style={styles.underline} />
        </View>
    );
    }