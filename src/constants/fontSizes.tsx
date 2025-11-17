export type TamanhoFontePreferencia = 'SMALL' | 'MEDIUM' | 'LARGE';

export interface TamanhosFonte {
  // Tamanhos de texto
  xs: number;      // Extra pequeno
  sm: number;      // Pequeno
  base: number;    // Base/Normal
  md: number;      // Médio
  lg: number;      // Grande
  xl: number;      // Extra grande
  '2xl': number;   // 2x grande
  '3xl': number;   // 3x grande
  '4xl': number;   // 4x grande
  
  // Tamanhos de ícones
  iconXs: number;
  iconSm: number;
  iconMd: number;
  iconLg: number;
  iconXl: number;
  icon2xl: number;
  
  // Espaçamentos proporcionais
  spacingXs: number;
  spacingSm: number;
  spacingMd: number;
  spacingLg: number;
  spacingXl: number;
}

const tamanhosFonte: Record<TamanhoFontePreferencia, TamanhosFonte> = {
  SMALL: {
    xs: 10,
    sm: 11,
    base: 12,
    md: 13,
    lg: 14,
    xl: 16,
    '2xl': 18,
    '3xl': 20,
    '4xl': 22,
    iconXs: 12,
    iconSm: 16,
    iconMd: 20,
    iconLg: 24,
    iconXl: 28,
    icon2xl: 32,
    spacingXs: 4,
    spacingSm: 6,
    spacingMd: 8,
    spacingLg: 12,
    spacingXl: 16,
  },
  MEDIUM: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    iconXs: 14,
    iconSm: 18,
    iconMd: 24,
    iconLg: 28,
    iconXl: 32,
    icon2xl: 40,
    spacingXs: 4,
    spacingSm: 8,
    spacingMd: 12,
    spacingLg: 16,
    spacingXl: 20,
  },
  LARGE: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    '4xl': 36,
    iconXs: 16,
    iconSm: 20,
    iconMd: 28,
    iconLg: 32,
    iconXl: 40,
    icon2xl: 48,
    spacingXs: 6,
    spacingSm: 8,
    spacingMd: 16,
    spacingLg: 20,
    spacingXl: 24,
  },
};

export function getTamanhosFonte(tamanho: TamanhoFontePreferencia): TamanhosFonte {
  return tamanhosFonte[tamanho];
}

export { tamanhosFonte };

