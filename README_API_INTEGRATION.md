# Integração com APIs de Ônibus

## Status Atual

Atualmente, **não há uma API pública nacional** que forneça dados completos de todas as companhias de ônibus brasileiras com preços em tempo real. O projeto está usando dados mock enquanto aguarda a disponibilidade de uma API real.

## APIs Disponíveis (Limitadas)

### 1. Voyenbus TOL API
- **Status**: Requer parceria/comercial
- **URL**: https://www.voyenbus.com/pt/tol-api.html
- **Descrição**: API comercial para integração com serviços de mobilidade
- **Como usar**: É necessário entrar em contato para obter credenciais

### 2. SPTrans API Olho Vivo
- **Status**: Disponível (apenas São Paulo)
- **URL**: https://www.sptrans.com.br/desenvolvedores/
- **Descrição**: API para transporte público urbano de São Paulo
- **Limitação**: Apenas transporte público urbano, não interestadual

### 3. APIs de Plataformas Privadas
- **Buser**: https://www.buser.com.br (pode ter API para parceiros)
- **ClickBus**: https://www.clickbus.com.br (pode ter API para parceiros)
- **Busbud**: https://www.busbud.com (API disponível, mas limitada)

## Como Integrar uma API Real

### Passo 1: Configurar Variáveis de Ambiente

Adicione no arquivo `.env`:

```env
EXPO_PUBLIC_BUS_API_ENABLED=true
EXPO_PUBLIC_BUS_API_BASE_URL=https://api.exemplo.com/v1
EXPO_PUBLIC_BUS_API_KEY=sua_chave_api_aqui
```

### Passo 2: Atualizar Configuração

Edite o arquivo `src/services/api/companhias/bus-api-service.ts`:

```typescript
export const defaultBusApiConfig: BusApiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_BUS_API_BASE_URL || '',
  apiKey: process.env.EXPO_PUBLIC_BUS_API_KEY,
  enabled: process.env.EXPO_PUBLIC_BUS_API_ENABLED === 'true',
};
```

### Passo 3: Adaptar Endpoints

Ajuste os endpoints no método `buscarPassagens` e `listarCompanhias` conforme a documentação da API escolhida.

### Passo 4: Testar Integração

Execute o projeto e verifique se os dados estão sendo carregados corretamente da API.

## Estrutura Atual

O projeto está preparado para integração futura:

- ✅ Serviço de API estruturado (`bus-api-service.ts`)
- ✅ Interface clara para diferentes APIs
- ✅ Fallback automático para dados mock
- ✅ Tratamento de erros
- ✅ Configuração flexível

## Fontes de Dados Alternativas

### 1. Web Scraping (Não Recomendado)
- Pode violar termos de uso dos sites
- Requer manutenção constante
- Pode quebrar a qualquer momento

### 2. Parcerias com Companhias
- Contato direto com companhias de ônibus
- Pode fornecer APIs próprias
- Requer negociações comerciais

### 3. Agregadores
- ClickBus, Buser, Busbud
- Podem fornecer APIs para parceiros
- Requer parcerias comerciais

## Recomendações

1. **Curto Prazo**: Continue usando dados mock realistas
2. **Médio Prazo**: Entre em contato com agregadores (Buser, ClickBus) para parcerias
3. **Longo Prazo**: Considere criar sua própria base de dados através de parcerias diretas com companhias

## Atualizações Futuras

Quando uma API estiver disponível:

1. Atualize `bus-api-service.ts` com os endpoints corretos
2. Configure as variáveis de ambiente
3. Teste a integração
4. Remova ou mantenha dados mock como fallback

