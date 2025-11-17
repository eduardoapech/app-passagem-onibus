import { useCallback, useEffect, useState } from 'react';
import {TransacaoService} from '../../services/api/transacao';
import { useFocusEffect } from 'expo-router';

export const useHistoricoTransacoes = (refreshKey?: number) => {

  const [mes, setMes] = useState("todos");
  const [ano, setAno] = useState(new Date().getFullYear());
  
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  const carregarTransacoes = async () => {
    try {
      setLoading(true);
      const data = await TransacaoService.listarTransacao();
      setTransacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      setTransacoes([]);
    } finally {
      setLoading(false);
    }
  };

  // Carrega transações quando o componente monta ou quando refreshKey muda
  useFocusEffect(
    useCallback(() => {
      carregarTransacoes();
    }, [])
  );

  useEffect(() => {
    carregarTransacoes();
  }, [refreshKey]);
  
  const obterMeses = () => ['Todos','Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Adicione refreshKey como dependência para recarregar quando mudar

    // Calcula anos disponíveis baseado nas transações
    const obterAnosDisponiveis = (transacoes: any[]) => {
        const anoAtual = new Date().getFullYear();
        
        // Se não tem transações, retorna anos padrão
        if (!transacoes || transacoes.length === 0) {
            return [anoAtual - 1, anoAtual, anoAtual + 1];
        }

        // Pega anos únicos das transações
        const anosDasTransacoes = [...new Set(transacoes.map(t => new Date(t.data).getFullYear()))];
        const anosRecentes = [anoAtual - 1, anoAtual, anoAtual + 1];

        // Combina e remove duplicados
        const todosAnos = [...new Set([...anosDasTransacoes, ...anosRecentes])];
        
        // Ordena do mais recente para o mais antigo
        return todosAnos.sort((a, b) => b - a);
    };

    // Filtra transações por mês e ano específicos
     const filtrarTransacoes = (transacoes: any[], mes: string | number, ano: number) => {
        if (!transacoes) return [];
        
        return transacoes.filter(transacao => {
        const data = new Date(transacao.data);
        const anoTransacao = data.getFullYear();
        
        // Se mes for 'todos', retorna todas as transações do ano selecionado
        if (mes === 'todos') {
            return anoTransacao === ano;
        }
        
        // Caso contrário, filtra por mês e ano específicos
        return data.getMonth() + 1 === mes && anoTransacao === ano;
        });
    };



    // Usando as funções separadas
    const meses = obterMeses();
    const anos = obterAnosDisponiveis(transacoes || []);
    const transacoesFiltradas = filtrarTransacoes(transacoes || [], mes, ano);


    return {
        mes, 
        setMes,
        ano, 
        setAno,
        meses,
        anos,
        transacoesFiltradas,
        carregando: loading,
    };

};