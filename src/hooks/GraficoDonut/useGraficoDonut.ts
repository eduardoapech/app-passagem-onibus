import { useState } from "react";
import { ValorTotalResponse } from '@/src/interfaces/estatistica/response';


export type CategoriaData = ValorTotalResponse;

export interface GraficoData {
  x: string;
  y: number;
}

export const useGraficoDonut = () => {

  const [data, setData] = useState<GraficoData[]>([]);
  const [total, setTotal] = useState(0);

  const transformData = (apiData: ValorTotalResponse[]): void => {
    const dataArray = Array.isArray(apiData) ? apiData : [apiData];
    
    if (!dataArray || dataArray.length === 0) {
      setData([]);
      setTotal(0);
      return;
    }

    // Transforma dados da API para formato do gráfico
    const transformedData = dataArray.map(item => ({
      x: item.categoriaNome,
      y: item.valorTotal
    }));

    const totalAmount = dataArray.reduce((sum, item) => sum + item.valorTotal, 0);

    setData(transformedData);
    setTotal(totalAmount);
  };

  return {
    data,
    total,
    transformData
  };
};