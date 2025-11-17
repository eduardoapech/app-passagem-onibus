import { Line, CartesianChart } from "victory-native";
import { useEffect } from "react";
import { useGraficoLinha, GraficoLinhaData  } from "@/src/hooks/GraficoLinha/useGraficoLinha";
import { ActivityIndicator, View,Text } from "react-native";

import { useApi } from "@/src/hooks/useApi";
import { EstatisticaService } from "@/src/services/api/estatisticas";

import { styles } from "./style";
import { EvolucaoMensalResponse } from "@/src/interfaces/estatistica/response";

interface GraficoLinhaProps {
  refreshKey?: number;
}

export const GraficoLinha = ({ refreshKey = 0 }: GraficoLinhaProps) => {
    
  const { data: apiData, loading: apiLoading } = useApi<EvolucaoMensalResponse[]>(
    () => EstatisticaService.listarAnaliseEvolucaoMensal(),
    [],
    [refreshKey]
  );

  const { data: chartData, transformData } = useGraficoLinha();

  // Transforma os dados quando a API retornar
  useEffect(() => {
    if (apiData) {
      transformData(apiData);
    }
  }, [apiData, transformData]);


  // Estados de carregamento
  if (apiLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Carregando evolução mensal...</Text>
      </View>
    );
  }

  // Quando nao encontrar nenhum dado
  if (!chartData || chartData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Nenhum dado encontrado para evolução mensal</Text>
      </View>
    );
  }

  // Cores para as linhas
  const colorScale = {
    receitas: '#4ECDC4',
    despesas: '#FF6B6B'
  };

  // Soma todos os valores 
  const totalReceitas = chartData.reduce((sum, item) => sum + item.receitas, 0);
  const totalDespesas = chartData.reduce((sum, item) => sum + item.despesas, 0);

    return (
      <View style={styles.container}>
      <Text style={styles.title}>Evolução Mensal - Receitas vs Despesas</Text>
      
      {/* Gráfico */}
      <View style={{ height: 250 }}>
        <CartesianChart<GraficoLinhaData, "x", "receitas" | "despesas">
          data={chartData}
          xKey="x"
          yKeys={["receitas", "despesas"]}
          domainPadding={{ left: 30, right: 30, top: 30 }}
        >
          {({ points }) => (
            <>
              <Line 
                points={points.receitas} 
                color={colorScale.receitas}
                strokeWidth={3}
                curveType="linear"
              />
              <Line 
                points={points.despesas} 
                color={colorScale.despesas}
                strokeWidth={3}
                curveType="linear"
              />
            </>
          )}
        </CartesianChart>
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]} />
          <Text style={styles.legendText}>Receitas: R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.legendText}>Despesas: R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        </View>
      </View>

      {/* Tabela */}
      <View style={styles.table}>
        <Text style={styles.tableTitle}>Detalhamento por Mês</Text>
        
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Mês</Text>
          <Text style={styles.headerCell}>Receitas</Text>
          <Text style={styles.headerCell}>Despesas</Text>
          <Text style={styles.headerCell}>Saldo</Text>
        </View>

        {chartData.map((item, index) => (
          <View key={index} style={[
            styles.tableRow,
            index % 2 === 0 ? styles.evenRow : styles.oddRow
          ]}>
            <Text style={styles.cellMonth}>{item.x}</Text>
            <Text style={styles.cellReceita}>
              R$ {item.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.cellDespesa}>
              R$ {item.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={[
              styles.cellSaldo,
              item.saldo >= 0 ? styles.saldoPositivo : styles.saldoNegativo
            ]}>
              R$ {item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}