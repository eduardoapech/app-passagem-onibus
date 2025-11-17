import { Pie, PolarChart } from "victory-native";

import { useEffect } from "react";
import { View, Text } from "react-native";
import {styles} from "./style";

import { useGraficoDonut } from "@/src/hooks/GraficoDonut/useGraficoDonut";
import { useApi } from "@/src/hooks/useApi";

import { EstatisticaService } from "@/src/services/api/estatisticas";
import { ValorTotalResponse } from "@/src/interfaces/estatistica/response";


interface GraficoDonutProps {
  refreshKey?: number;
}

export const GraficoDonut = ({ refreshKey = 0 }: GraficoDonutProps) =>{

     const { data: apiData, loading: apiLoading } = useApi<ValorTotalResponse[]>(
        () => EstatisticaService.listarGastosPorCategoria(),
        [], // initialData como array vazio
        [refreshKey]
    );

    // Hook para transformar dados do gráfico
    const { data: chartData, total, transformData } = useGraficoDonut();

    // Transforma os dados quando a API retornar
    useEffect(() => {
        if (apiData) {
            const arrayData = Array.isArray(apiData) ? apiData : [apiData];
            transformData(arrayData);
        }
    }, [apiData, transformData]);

    // Cores para o gráfico
    const colorScale = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFEAA7', 
        '#A29BFE', '#FD79A8', '#00CEC9', '#FDCB6E'
    ];

    // Converter os dados do hook para o formato do Victory Native
    const victoryData = chartData.map((item, index) => ({
        value: item.y, // categoria valor 
        label: item.x, // categoria nome
        color: colorScale[index % colorScale.length] // cor correspondente
    }));

    if (chartData.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>Nenhum gasto encontrado</Text>
            </View>
        );
    }

    return(

         <View style={styles.container}>
            <Text style={styles.title}>Gastos por Categoria</Text>
      
            <Text style={styles.totalText}>
                Total: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
      
            <View style={{ height: 250, width:250 }}>
                <PolarChart
                    data={victoryData}
                    colorKey="color"
                    valueKey="value"
                    labelKey="label"
                >
                    <Pie.Chart innerRadius={80} />
                </PolarChart>
            </View>

            <View style={styles.legend}>
                {chartData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View 
                            style={[
                                styles.legendColor, 
                                { backgroundColor: colorScale[index % colorScale.length] }
                            ]} 
                        />
                        <Text style={styles.legendText}>
                            {item.x}: R$ {item.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
  );
};