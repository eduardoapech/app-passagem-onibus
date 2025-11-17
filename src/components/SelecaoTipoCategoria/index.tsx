import { Pressable, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CategoriaTipo } from '@/src/enums/categoriaTipo';
import { styles } from './style';


interface TipoCategoriaProps {
  tipoTransacao: CategoriaTipo;
  onTipoChange: (tipo: CategoriaTipo) => void;
}

export function SelecaoTipoCategoria ({
  tipoTransacao,
  onTipoChange
}:  TipoCategoriaProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Tipo de Transação</Text>
      <View style={styles.checkboxGroup}>
        <Pressable 
          style={[
            styles.checkboxItem, 
            tipoTransacao === CategoriaTipo.RECEITA && styles.checkboxItemSelected
          ]}
          onPress={() => onTipoChange(CategoriaTipo.RECEITA)}
        >
          <View style={[
            styles.checkboxCircle,
            tipoTransacao === CategoriaTipo.RECEITA && styles.checkboxCircleSelected
          ]}>
            <Icon 
              name="checkmark" 
              size={16} 
              color="#FFFFFF" 
              style={tipoTransacao === CategoriaTipo.RECEITA ? styles.checkIconSelected : styles.checkIcon}
            />
          </View>
          <Text style={styles.checkboxText}>Receita</Text>
        </Pressable>

        <Pressable 
          style={[
            styles.checkboxItem, 
            tipoTransacao === CategoriaTipo.DESPESA && styles.checkboxItemSelected
          ]}
          onPress={() => onTipoChange(CategoriaTipo.DESPESA)}
        >
          <View style={[
            styles.checkboxCircle,
            tipoTransacao === CategoriaTipo.DESPESA && styles.checkboxCircleSelected
          ]}>
            <Icon 
              name="checkmark" 
              size={16} 
              color="#FFFFFF" 
              style={tipoTransacao === CategoriaTipo.DESPESA ? styles.checkIconSelected : styles.checkIcon}
            />
          </View>
          <Text style={styles.checkboxText}>Despesa</Text>
        </Pressable>
      </View>
    </View>
  );
};