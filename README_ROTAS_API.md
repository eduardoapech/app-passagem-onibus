# API de Cálculo de Rotas

## Visão Geral

O sistema agora suporta cálculo de rotas usando APIs externas para obter distâncias e tempos de viagem precisos baseados em rotas rodoviárias reais, não apenas distância em linha reta.

## APIs Suportadas

### 1. OpenRouteService (Padrão - Gratuito)

**Características:**
- ✅ Gratuito até 2000 requisições/dia
- ✅ Não requer API key para uso básico
- ✅ Cobertura global
- ✅ Calcula rotas rodoviárias reais
- ✅ Fornece distância e tempo de viagem precisos

**Como usar:**
```typescript
// Configuração padrão (já habilitada)
export const defaultRotaApiConfig: RotaApiConfig = {
  provider: 'openrouteservice',
  apiKey: '', // Opcional para uso básico
  enabled: true,
};
```

**Limites:**
- 2000 requisições/dia sem API key
- Com API key: limites maiores (verificar site)

**Obter API Key (opcional):**
1. Acesse: https://openrouteservice.org/dev/#/signup
2. Crie uma conta gratuita
3. Adicione a chave no `.env`:
```env
EXPO_PUBLIC_OPENROUTESERVICE_API_KEY=sua_chave_aqui
```

### 2. Google Maps Distance Matrix API

**Características:**
- ✅ Muito preciso
- ✅ Dados atualizados
- ✅ Suporta trânsito em tempo real
- ❌ Requer API key
- ❌ Tem custos (mas há crédito grátis)

**Como configurar:**
1. Obtenha uma API key do Google Cloud Platform
2. Habilite a Distance Matrix API
3. Adicione no `.env`:
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

4. Atualize a configuração:
```typescript
export const defaultRotaApiConfig: RotaApiConfig = {
  provider: 'google',
  apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  enabled: true,
};
```

**Limites:**
- $200 de crédito grátis/mês
- Após crédito grátis: $5 por 1000 requisições

### 3. Haversine (Fallback)

**Características:**
- ✅ Sempre disponível
- ✅ Não requer API
- ❌ Calcula distância em linha reta
- ❌ Menos preciso para rotas rodoviárias

**Como funciona:**
- Usado automaticamente quando API não está disponível
- Adiciona 25% à distância para aproximar distância rodoviária

## Estrutura do Código

```
src/
├── services/
│   ├── api/
│   │   └── rotas/
│   │       ├── rotas-api-service.ts    # Serviço principal de rotas
│   │       └── index.tsx                # Interface simplificada
│   └── calculadoraDistancia/
│       └── index.tsx                    # Funções de cálculo (com fallback)
```

## Como Usar

### 1. Calcular Rota Entre Cidades

```typescript
import { RotaService } from '@/src/services/api/rotas';
import { Cidade } from '@/src/interfaces/passagem';

const origem: Cidade = { ... };
const destino: Cidade = { ... };

const rota = await RotaService.calcularRota(origem, destino);

console.log(`Distância: ${rota.distanciaKm} km`);
console.log(`Tempo: ${rota.tempoHoras}h ${rota.tempoMinutos}min`);
console.log(`Provider: ${rota.provider}`);
```

### 2. Calcular Rota por Coordenadas

```typescript
import { RotaService } from '@/src/services/api/rotas';

const rota = await RotaService.calcularRotaPorCoordenadas(
  -23.5505,  // lat origem (São Paulo)
  -46.6333,  // lon origem
  -22.9068,  // lat destino (Rio de Janeiro)
  -43.1729   // lon destino
);
```

### 3. Usar Funções de Cálculo de Distância

```typescript
import { calcularDistancia, calcularTempoViagem } from '@/src/services/calculadoraDistancia';

// Tenta usar API primeiro, com fallback para Haversine
const distancia = await calcularDistancia(lat1, lon1, lat2, lon2);
const tempo = await calcularTempoViagem(lat1, lon1, lat2, lon2);
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# OpenRouteService (opcional - para mais requisições)
EXPO_PUBLIC_OPENROUTESERVICE_API_KEY=sua_chave_aqui

# Google Maps (opcional)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

### Configuração da API

Edite `src/services/api/rotas/rotas-api-service.ts`:

```typescript
export const defaultRotaApiConfig: RotaApiConfig = {
  provider: 'openrouteservice', // ou 'google' ou 'haversine'
  apiKey: process.env.EXPO_PUBLIC_OPENROUTESERVICE_API_KEY || '',
  enabled: true, // ou false para desabilitar
};
```

## Fallback Automático

O sistema possui fallback automático:

1. **Tenta usar API configurada** (OpenRouteService ou Google)
2. **Se falhar, usa Haversine** (cálculo em linha reta + 25%)

Isso garante que o sistema sempre funcione, mesmo sem API disponível.

## Diferenças entre APIs

### OpenRouteService
- **Distância**: Baseada em rotas rodoviárias reais
- **Tempo**: Considera velocidade média das estradas
- **Precisão**: Alta para rotas rodoviárias
- **Custo**: Gratuito (até 2000 req/dia)

### Google Maps
- **Distância**: Baseada em rotas rodoviárias reais
- **Tempo**: Considera trânsito em tempo real (opcional)
- **Precisão**: Muito alta
- **Custo**: $5 por 1000 requisições (após crédito grátis)

### Haversine
- **Distância**: Em linha reta (não considera estradas)
- **Tempo**: Estimado (distância * 1.25 / 80 km/h)
- **Precisão**: Baixa para rotas rodoviárias
- **Custo**: Gratuito (sem limites)

## Recomendações

1. **Para desenvolvimento/testes**: Use OpenRouteService (gratuito)
2. **Para produção com baixo volume**: Use OpenRouteService com API key
3. **Para produção com alto volume**: Considere Google Maps (mais preciso)
4. **Para offline/sem internet**: Sistema usa Haversine automaticamente

## Troubleshooting

### Erro: "API de rotas não disponível"
- Verifique se `enabled: true` na configuração
- Verifique sua conexão com a internet
- O sistema usará Haversine como fallback

### Erro: "API Key inválida"
- Verifique se a chave está correta no `.env`
- Para OpenRouteService, a chave é opcional (pode deixar vazio)

### Distâncias muito diferentes
- OpenRouteService e Google Maps calculam rotas reais (mais longas)
- Haversine calcula linha reta (mais curta)
- Isso é esperado - rotas rodoviárias são sempre mais longas

## Atualizações Futuras

Possíveis melhorias:
- [ ] Suporte para outras APIs (Mapbox, HERE, etc.)
- [ ] Cache de rotas calculadas
- [ ] Cálculo de custos de pedágio
- [ ] Suporte para múltiplos waypoints
- [ ] Otimização de rotas (evitar pedágios, etc.)

