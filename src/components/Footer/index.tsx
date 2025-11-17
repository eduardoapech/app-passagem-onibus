import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

type MenuItem = {
  id: string;
  route: string;
  icon: string;
  label: string;
  isCenter?: boolean;
};

export const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  const menuItems: MenuItem[] = [
    { 
      id: 'home', 
      route: '/(tabs)/home',
      icon: 'home',
      label: 'Início'
    },
    { 
      id: 'viagens', 
      route: '/(tabs)/MinhasViagens',
      icon: 'card-travel',
      label: 'Viagens'
    },
    { 
      id: 'buscar', 
      route: '/(tabs)/Buscar',
      icon: 'search',
      label: 'Buscar',
      isCenter: true 
    },
    { 
      id: 'favoritos', 
      route: '/(tabs)/Favoritos',
      icon: 'favorite',
      label: 'Favoritos'
    },
    { 
      id: 'perfil', 
      route: '/(tabs)/Perfil',
      icon: 'person',
      label: 'Perfil'
    },
  ];

  const isActive = (route: string) => {
    return pathname?.includes(route.split('/').pop() || '');
  };

  const handlePress = (item: MenuItem) => {
    router.push(item.route as any);
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footer}>
        <View style={styles.topCurve} />
        
        {menuItems.map((item: MenuItem) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.tab,
              item.isCenter && styles.centerTab,
              isActive(item.route) && styles.activeTab
            ]}
            onPress={() => handlePress(item)}
          >
            <View style={[
              styles.iconContainer,
              item.isCenter && styles.centerIconContainer,
              isActive(item.route) && styles.activeIconContainer
            ]}>
              <Icon 
                name={item.icon as any}
                size={item.isCenter ? tamanhos.iconLg : tamanhos.iconMd}
                color={isActive(item.route) ? cores.primary : cores.textSecondary}
              />
            </View>
            {!item.isCenter && (
              <Text style={[
                styles.label,
                isActive(item.route) && styles.activeLabel
              ]}>
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function getStyles(cores: CoresType, tamanhos: any) {
  return StyleSheet.create({
    footerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    footer: {
      flexDirection: 'row',
      backgroundColor: cores.header,
      borderTopWidth: 1,
      borderTopColor: cores.border,
      paddingTop: tamanhos.spacingSm,
      paddingBottom: tamanhos.spacingLg,
      paddingHorizontal: tamanhos.spacingSm,
      justifyContent: 'space-around',
      alignItems: 'center',
      shadowColor: cores.shadow,
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 10,
    },
    topCurve: {
      position: 'absolute',
      top: -20,
      left: 0,
      right: 0,
      height: 20,
      backgroundColor: cores.header,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: tamanhos.spacingSm,
    },
    centerTab: {
      marginTop: -30,
    },
    activeTab: {
      // Estilos adicionais se necessário
    },
    iconContainer: {
      width: tamanhos.icon2xl,
      height: tamanhos.icon2xl,
      borderRadius: tamanhos.icon2xl / 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      marginBottom: tamanhos.spacingXs,
    },
    centerIconContainer: {
      width: tamanhos.icon2xl + 16,
      height: tamanhos.icon2xl + 16,
      borderRadius: (tamanhos.icon2xl + 16) / 2,
      backgroundColor: cores.primary,
      marginBottom: 0,
      shadowColor: cores.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    activeIconContainer: {
      backgroundColor: cores.primaryLight,
    },
    label: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    activeLabel: {
      color: cores.primary,
      fontWeight: '700',
    },
  });
}
