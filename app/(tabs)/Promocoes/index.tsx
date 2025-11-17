import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { styles } from './styles';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

export default function PromocoesTab() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Promoções</Text>
      </View>

      {/* Promoção de Desconto Antecipado */}
      <View style={styles.promocaoCard}>
        <View style={styles.promocaoHeader}>
          <View style={styles.promocaoBadge}>
            <Icon name="local-offer" size={24} color="#FFFFFF" />
            <Text style={styles.promocaoBadgeText}>PROMOÇÃO ATIVA</Text>
          </View>
          <View style={styles.promocaoDesconto}>
            <Text style={styles.promocaoDescontoPercentual}>5%</Text>
            <Text style={styles.promocaoDescontoLabel}>OFF</Text>
          </View>
        </View>

        <View style={styles.promocaoContent}>
          <Text style={styles.promocaoTitle}>Desconto para Compra Antecipada</Text>
          <Text style={styles.promocaoDescription}>
            Ganhe 5% de desconto ao comprar sua passagem com 10 dias ou mais de antecedência!
          </Text>

          <View style={styles.promocaoBeneficios}>
            <View style={styles.beneficioItem}>
              <Icon name="check-circle" size={20} color="#10B981" />
              <Text style={styles.beneficioText}>Desconto automático aplicado</Text>
            </View>
            <View style={styles.beneficioItem}>
              <Icon name="check-circle" size={20} color="#10B981" />
              <Text style={styles.beneficioText}>Válido para todas as rotas</Text>
            </View>
            <View style={styles.beneficioItem}>
              <Icon name="check-circle" size={20} color="#10B981" />
              <Text style={styles.beneficioText}>Aplicado no momento do pagamento</Text>
            </View>
          </View>

          <View style={styles.promocaoInfo}>
            <View style={styles.infoItem}>
              <Icon name="calendar-today" size={18} color="#1E40AF" />
              <Text style={styles.infoText}>Mínimo de 10 dias de antecedência</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="attach-money" size={18} color="#1E40AF" />
              <Text style={styles.infoText}>Desconto de 5% no valor total</Text>
            </View>
          </View>

          <Pressable
            style={styles.promocaoButton}
            onPress={() => router.push('/(tabs)/Buscar')}
          >
            <Icon name="search" size={20} color="#FFFFFF" />
            <Text style={styles.promocaoButtonText}>Buscar Passagens</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footerInfo}>
        <Icon name="info" size={16} color="#6B7280" />
        <Text style={styles.footerText}>
          O desconto é aplicado automaticamente durante o checkout quando você compra com 10 ou mais dias de antecedência.
        </Text>
      </View>
    </ScrollView>
  );
}

