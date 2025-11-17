import { Pressable, View, Text, Keyboard, TouchableOpacity } from "react-native";
import { styles } from "./style";
import Icon from 'react-native-vector-icons/Ionicons';
import Octicon from 'react-native-vector-icons/Octicons';
import { useNavigation } from '../../constants/router';


 

export const ConfiguracaoScreen = () => {
    const navigation = useNavigation();

    return(
        <Pressable style={styles.container} onPress={Keyboard.dismiss}>
            <View style={styles.header}>
                <View style={styles.titleHeader}>
                    <Text style={styles.titleText}>
                        Configurações
                    </Text>
                </View>
            </View>

            <View style={styles.containerOpcoes}>

                <TouchableOpacity style={styles.opcoes} onPress={navigation.perfil}>
                    <View style={styles.quadrado}>
                        <Icon name="person" size={150} color="#136F6C" />
                    </View>
                    <Text style={styles.opcoesText}>Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.opcoes} onPress={navigation.metas}>
                    <View style={styles.quadrado}>
                        <Octicon name="goal" size={150} color="#136F6C" />
                    </View>
                    <Text style={styles.opcoesText}>Metas</Text>
                </TouchableOpacity>
            </View>

        </Pressable>
    );
}