# Passagem Ônibus - Aplicativo de Comparação e Venda de Passagens

## 📋 Visão Geral do Projeto

O Passagem Ônibus é um aplicativo móvel inovador focado na comparação e venda de passagens de ônibus. O objetivo principal é oferecer aos usuários a opção mais econômica e conveniente, integrando cotações automáticas de diversas companhias de ônibus renomadas.

O aplicativo exibe horários, valores e tipos de assento disponíveis, permitindo a compra direta através de um sistema de pagamento online seguro.

## ⭐ Funcionalidades Principais

### 🔍 Busca Inteligente de Passagens
- Busca por origem e destino
- Filtros por data, tipo de assento e número de passageiros
- Comparação automática de preços entre diferentes companhias
- Suporte para viagens de ida e ida/volta

### 💺 Seleção de Assentos
- Visualização do mapa de assentos do ônibus
- Diferentes tipos de assento (Convencional, Semi-leito, Leito, Executivo, Suíte)
- Informações sobre disponibilidade e preços

### 💳 Pagamento Seguro
- Múltiplas formas de pagamento (Cartão de Crédito, Débito, PIX, Boleto)
- Integração com gateway de pagamento seguro
- Confirmação instantânea de reservas

### 📱 Gestão de Viagens
- Histórico completo de viagens
- Códigos de reserva e QR Codes para embarque
- Cancelamento e reembolso

### ⭐ Favoritos e Promoções
- Salvar passagens favoritas
- Acompanhar promoções e ofertas especiais
- Notificações de preços

## 🏗️ Arquitetura do Projeto

### Frontend
- **React Native** com Expo SDK 52
- **TypeScript** para type safety
- **Expo Router** para navegação
- **Axios** para consumo de API
- **AsyncStorage** para persistência local
- **Zustand** para gerenciamento de estado
- **date-fns** para manipulação de datas

### Dependências Principais
- React Native 0.76.5
- Expo ~52.0.0
- React Navigation 7.x
- Expo Vector Icons
- React Native Reanimated
- React Native Gesture Handler

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn
- Expo CLI instalado globalmente (`npm install -g expo-cli`)
- Android Studio (para Android) ou Xcode (para iOS)

### Instalação

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure a URL da API no arquivo `.env`:
   ```env
   EXPO_PUBLIC_API_URL=https://api.passagemonibus.com/api
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npx expo start
   ```

4. Escolha a plataforma:
   - Pressione `a` para abrir no Android
   - Pressione `i` para abrir no iOS
   - Escaneie o QR code com o Expo Go no seu dispositivo móvel

## 📁 Estrutura do Projeto

```
passagem-onibus/
├── app/                    # Rotas do Expo Router
│   ├── (tabs)/            # Telas com navegação por tabs
│   ├── auth/              # Telas de autenticação
│   └── index.tsx          # Tela inicial
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── BuscaPassagem/
│   │   ├── CardPassagem/
│   │   └── Footer/
│   ├── interfaces/        # Tipos TypeScript
│   │   ├── passagem/
│   │   ├── pagamento/
│   │   └── usuario/
│   ├── screens/           # Telas da aplicação
│   │   ├── home/
│   │   ├── Resultados/
│   │   ├── MinhasViagens/
│   │   └── Perfil/
│   ├── services/          # Serviços de API
│   │   └── api/
│   │       ├── passagens/
│   │       ├── pagamento/
│   │       └── viagens/
│   └── hooks/             # Custom hooks
└── assets/               # Imagens e recursos
```

## 🔧 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run web` - Executa na web
- `npm run lint` - Executa o linter

## 📱 Telas Principais

1. **Home** - Tela inicial com busca de passagens
2. **Resultados** - Lista de passagens encontradas com filtros
3. **Detalhes** - Detalhes da passagem e seleção de assentos
4. **Pagamento** - Processo de pagamento seguro
5. **Minhas Viagens** - Histórico de viagens e reservas
6. **Perfil** - Configurações e dados do usuário

## 🔐 Autenticação

O aplicativo utiliza JWT (JSON Web Tokens) para autenticação:
- Login com email e senha
- Registro de novos usuários
- Tokens armazenados de forma segura
- Refresh token para renovação automática

## 🎨 Design

O aplicativo segue um design moderno e intuitivo:
- Cores principais: Azul (#1E40AF) e branco
- Tipografia: Inter e Roboto
- Componentes com sombras e bordas arredondadas
- Interface responsiva e acessível

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Contribuição

Para contribuir com o projeto, entre em contato com a equipe de desenvolvimento.
