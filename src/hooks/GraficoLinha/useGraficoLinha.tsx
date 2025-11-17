import { EvolucaoMensalResponse } from "@/src/interfaces/estatistica/response";
import { useState } from "react";

export interface GraficoLinhaData extends Record<string, unknown> { //Garante compatibilidade
  x: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export const useGraficoLinha = () => {

  const [data, setData] = useState<GraficoLinhaData[]>([]);

  const transformData = (apiData: EvolucaoMensalResponse | EvolucaoMensalResponse[]): void => {
    // Converte para array sempre
    const dataArray = Array.isArray(apiData) ? apiData : [apiData];
    
    if (!dataArray || dataArray.length === 0) {
      setData([]);
      return;
    }

    // Ordena do mais antigo para o mais recente
    const sortedData = [...dataArray].sort((a, b) => 
      new Date(a.periodo).getTime() - new Date(b.periodo).getTime()
    );

    const transformed = sortedData.map(item => ({
      x: formatPeriodo(item.periodo),
      receitas: item.totalReceitas,
      despesas: item.totalDespesas,
      saldo: item.saldo
    }));

    setData(transformed);
  };

  // Formata a data 2025-09-01 para Set/25
  const formatPeriodo = (periodo: string): string => {
    try {
      const date = new Date(periodo);
      const monthNames = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear().toString().slice(2);
      
      return `${month}/${year}`;
    } catch (error) {
      return periodo;
    }
  };

  return {
    data,
    transformData
  };
}