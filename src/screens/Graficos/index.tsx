import { View, Text, ScrollView } from "react-native";
import { styles } from "./style";

export const GraficosScreen = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.titleHeader}>
          <Text style={styles.titleText}>
            Estatísticas de Viagens
          </Text>
        </View>
      </View>

      <View style={styles.containerCharts}>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Em breve você poderá visualizar estatísticas das suas viagens aqui
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
