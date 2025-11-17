import { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from './style';


interface DatePickerProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (date: string) => void;
}


export function DataPicker({
  label,
  placeholder,
  value,
  onChangeText
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (value) {
      // Converte YYYY-MM-DD para Date sem problemas de timezone
      const [year, month, day] = value.split('-');
      // Cria a data no timezone local
      const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      setDate(newDate);
    }
  }, [value]);
  
  const getInitialDate = () => {
    if (!value) return new Date();
    const [year, month, day] = value.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const [date, setDate] = useState(getInitialDate());

    const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      setDate(selectedDate);
      
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}`;
      onChangeText(formattedDate);
    }
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      
      <Pressable 
        style={styles.comboboxWrapper}
        onPress={showDatePicker}
      >
        <Text style={[
          styles.input, 
          !value && { color: '#858587' }
        ]}>
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
        <Icon 
          name="calendar-clear-outline" 
          size={25} 
          color="#136F6C" 
          style={styles.iconRight} 
        />
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
      
      <View style={styles.underline} />
    </View>
  );
}