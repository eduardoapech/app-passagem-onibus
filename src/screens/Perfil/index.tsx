import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthService } from "@/src/services/api/storage";
import { Usuario } from "@/src/interfaces/usuario";
import Icon from "@expo/vector-icons/MaterialIcons";
import { useTema } from "@/src/hooks/useTema";
import { useTamanhoFonte } from "@/src/hooks/useTamanhoFonte";
import { CoresType } from "@/src/constants/colors";
import version from "@/app.json";

export const PerfilScreen = () => {
  const router = useRouter();
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  useEffect(() => {
    const loadUser = async () => {
      const user = await AuthService.getUser();
      setUsuario(user);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AuthService.logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const menuItems = [
    {
      id: "dados",
      title: "Meus Dados",
      icon: "person",
      onPress: () => router.push("/EditarPerfil" as any),
    },
    {
      id: "pagamentos",
      title: "Formas de Pagamento",
      icon: "payment",
      onPress: () => router.push("/Pagamentos" as any),
    },
    {
      id: "preferencias",
      title: "Preferências",
      icon: "settings",
      onPress: () => router.push("/Preferencias" as any),
    },
    {
      id: "ajuda",
      title: "Central de Ajuda",
      icon: "help",
      onPress: () => router.push("/(tabs)/Ajuda" as any),
    },
    {
      id: "sobre",
      title: "Sobre o App",
      icon: "info",
      onPress: () => router.push("/Sobre" as any),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Icon name="person" size={tamanhos.icon2xl} color={cores.primary} />
        </View>
        <Text style={styles.userName}>{usuario?.nome || "Usuário"}</Text>
        <Text style={styles.userEmail}>{usuario?.email || ""}</Text>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <Pressable
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon as any} size={tamanhos.iconMd} color={cores.primary} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Icon name="chevron-right" size={tamanhos.iconMd} color={cores.textSecondary} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={tamanhos.iconMd} color={cores.error} />
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Versão {version.expo.version}</Text>
      </View>
    </ScrollView>
  );
};

function getStyles(cores: CoresType, tamanhos: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: cores.background,
    },
    header: {
      paddingHorizontal: tamanhos.spacingLg,
      paddingTop: 60,
      paddingBottom: tamanhos.spacingLg,
      backgroundColor: cores.header,
      borderBottomWidth: 1,
      borderBottomColor: cores.border,
    },
    headerTitle: {
      fontSize: tamanhos['4xl'],
      fontWeight: "700",
      color: cores.text,
    },
    profileSection: {
      alignItems: "center",
      paddingVertical: tamanhos.spacingXl * 1.6,
      backgroundColor: cores.backgroundCard,
      marginTop: tamanhos.spacingLg,
      marginHorizontal: tamanhos.spacingLg,
      borderRadius: 16,
      shadowColor: cores.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    avatar: {
      width: tamanhos.icon2xl * 3,
      height: tamanhos.icon2xl * 3,
      borderRadius: (tamanhos.icon2xl * 3) / 2,
      backgroundColor: cores.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: tamanhos.spacingLg,
      borderWidth: 3,
      borderColor: cores.primary,
    },
    userName: {
      fontSize: tamanhos['2xl'],
      fontWeight: "700",
      color: cores.text,
      marginBottom: tamanhos.spacingXs,
    },
    userEmail: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
    },
    menuSection: {
      marginTop: tamanhos.spacingXl * 1.2,
      marginHorizontal: tamanhos.spacingLg,
      backgroundColor: cores.backgroundCard,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: cores.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: tamanhos.spacingLg,
      borderBottomWidth: 1,
      borderBottomColor: cores.border,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: tamanhos.spacingLg,
    },
    menuIconContainer: {
      width: tamanhos.icon2xl,
      height: tamanhos.icon2xl,
      borderRadius: tamanhos.icon2xl / 2,
      backgroundColor: cores.primaryLight,
      justifyContent: "center",
      alignItems: "center",
    },
    menuItemText: {
      fontSize: tamanhos.md,
      fontWeight: "600",
      color: cores.text,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: tamanhos.spacingXl * 1.2,
      marginHorizontal: tamanhos.spacingLg,
      padding: tamanhos.spacingLg,
      backgroundColor: cores.errorLight,
      borderRadius: 12,
      gap: tamanhos.spacingSm,
    },
    logoutText: {
      fontSize: tamanhos.md,
      fontWeight: "600",
      color: cores.error,
    },
    footer: {
      alignItems: "center",
      paddingVertical: tamanhos.spacingXl * 1.2,
    },
    footerText: {
      fontSize: tamanhos.xs,
      color: cores.textTertiary,
      minWidth: "100%",
      textAlign: "center",
    },
  });
}
