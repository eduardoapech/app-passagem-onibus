import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PassagemService } from "@/src/services/api/passagens";
import { Passagem, Poltrona, Cidade, PassagemResumo } from "@/src/interfaces/passagem";
import Icon from "@expo/vector-icons/MaterialIcons";
import { format } from "date-fns";
import { calcularDescontoPromocao } from '@/src/utils/calcularDescontoPromocao';
import { ptBR } from "date-fns/locale";
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

// Mapeamento de ícones para garantir que apenas ícones válidos sejam usados
const getValidIcon = (iconName: string): string => {
  const iconMap: { [key: string]: string } = {
    ac: "ac-unit",
    plug: "power",
    bathroom: "wc",
    wifi: "wifi",
    "ac-unit": "ac-unit",
    power: "power",
    wc: "wc",
  };

  return iconMap[iconName.toLowerCase()] || "info";
};

export const DetalhesPassagemScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const [passagem, setPassagem] = useState<Passagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [poltronasSelecionadas, setPoltronasSelecionadas] = useState<number[]>(
    []
  );
  const currentPassagemIdRef = useRef<string>("");
  const isLoadingRef = useRef(false);

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  // Extrair valores dos parâmetros de forma estável
  const passagemId = useMemo(() => {
    const id = (params.passagemId as string) || "";
    return id;
  }, [params.passagemId]);

  const passageiros = useMemo(() => {
    return parseInt(params.passageiros as string) || 1;
  }, [params.passageiros]);

  // Extrair origem e destino dos parâmetros
  const origemParam = useMemo(() => {
    return (params.origem as string) || "";
  }, [params.origem]);

  const destinoParam = useMemo(() => {
    return (params.destino as string) || "";
  }, [params.destino]);

  // Parse das cidades
  const origem = useMemo(() => {
    if (!origemParam) return null;
    try {
      return JSON.parse(origemParam) as Cidade;
    } catch {
      return null;
    }
  }, [origemParam]);

  const destino = useMemo(() => {
    if (!destinoParam) return null;
    try {
      return JSON.parse(destinoParam) as Cidade;
    } catch {
      return null;
    }
  }, [destinoParam]);

  // Extrair informações da passagem resumo dos parâmetros
  const passagemInfoParam = useMemo(() => {
    return (params.passagemInfo as string) || "";
  }, [params.passagemInfo]);

  const passagemResumo = useMemo(() => {
    if (!passagemInfoParam) return undefined;
    try {
      return JSON.parse(passagemInfoParam) as Partial<PassagemResumo>;
    } catch {
      return undefined;
    }
  }, [passagemInfoParam]);

  // Carregar detalhes da passagem apenas uma vez
  useEffect(() => {
    // Evitar carregamento se não houver ID ou se já estiver carregando
    if (!passagemId || passagemId === currentPassagemIdRef.current) {
      if (!passagemId) {
        setLoading(false);
      }
      return;
    }

    // Evitar múltiplos carregamentos simultâneos
    if (isLoadingRef.current) {
      return;
    }

    // Marcar que estamos carregando
    currentPassagemIdRef.current = passagemId;
    isLoadingRef.current = true;
    let isCancelled = false;

    const carregarDetalhes = async () => {
      try {
        setLoading(true);
        const detalhes = await PassagemService.obterDetalhes(
          passagemId,
          origem,
          destino,
          passagemResumo
        );

        // Verificar se ainda estamos carregando a mesma passagem
        if (!isCancelled && currentPassagemIdRef.current === passagemId) {
          setPassagem(detalhes);
          setPoltronasSelecionadas([]); // Limpar seleções anteriores
        }
      } catch (error: any) {
        console.error("Erro ao carregar detalhes:", error);
        if (!isCancelled && currentPassagemIdRef.current === passagemId) {
          Alert.alert(
            "Erro",
            "Não foi possível carregar os detalhes da passagem"
          );
        }
      } finally {
        if (!isCancelled && currentPassagemIdRef.current === passagemId) {
          setLoading(false);
          isLoadingRef.current = false;
        }
      }
    };

    carregarDetalhes();

    return () => {
      isCancelled = true;
      isLoadingRef.current = false;
    };
  }, [passagemId, origem, destino, passagemResumo]);

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(preco);
  };

  const formatarTipoAssento = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      CONVENCIONAL: "Convencional",
      SEMI_LEITO: "Semi-leito",
      LEITO: "Leito",
      EXECUTIVO: "Executivo",
      SUITE: "Suíte",
    };
    return tipos[tipo] || tipo;
  };

  const togglePoltrona = useCallback(
    (numero: number) => {
      setPoltronasSelecionadas((prev) => {
        if (prev.includes(numero)) {
          // Desmarcar poltrona
          return prev.filter((p) => p !== numero);
        } else {
          // Verificar se já selecionou o máximo de poltronas permitidas
          if (prev.length >= passageiros) {
            Alert.alert(
              "Atenção",
              `Você pode selecionar até ${passageiros} poltrona(s) para ${passageiros} passageiro(s). Desmarque uma poltrona para selecionar outra.`
            );
            return prev;
          }
          // Adicionar nova poltrona
          return [...prev, numero];
        }
      });
    },
    [passageiros]
  );

  const precoTotal = useMemo(() => {
    if (!passagem) return 0;
    // Calcular baseado no número de poltronas selecionadas (ou passageiros se nenhuma selecionada)
    const numPoltronas = poltronasSelecionadas.length || passageiros;
    if (numPoltronas === 0) return 0;
    
    let total = passagem.preco * numPoltronas;

    // Adicionar preço adicional das poltronas selecionadas
    poltronasSelecionadas.forEach((numero) => {
      const poltrona = passagem.poltronas?.find((p) => p.numero === numero);
      if (poltrona?.precoAdicional) {
        total += poltrona.precoAdicional;
      }
    });

    return total;
  }, [passagem, poltronasSelecionadas, passageiros]);

  // Calcular desconto de promoção (5% para compras com 10+ dias de antecedência)
  const descontoPromocao = useMemo(() => {
    return calcularDescontoPromocao(passagem?.dataPartida, precoTotal);
  }, [passagem?.dataPartida, precoTotal]);

  // Valor total com desconto aplicado
  const precoTotalComDesconto = useMemo(() => {
    return precoTotal - descontoPromocao.valorDesconto;
  }, [precoTotal, descontoPromocao.valorDesconto]);

  const handleContinuar = useCallback(() => {
    if (poltronasSelecionadas.length !== passageiros) {
      Alert.alert("Atenção", `Selecione exatamente ${passageiros} poltrona(s) para ${passageiros} passageiro(s)`);
      return;
    }

    if (!passagem) {
      Alert.alert("Erro", "Dados da passagem não disponíveis");
      return;
    }

    // Obter parâmetros de tipoViagem, dataIda e dataVolta dos params
    const tipoViagem = (params.tipoViagem as string) || 'IDA';
    const dataIda = (params.dataIda as string) || '';
    const dataVolta = (params.dataVolta as string) || '';

    router.push({
      pathname: "/CheckoutPagamento",
      params: {
        passagemId: passagem.id,
        poltronas: JSON.stringify(poltronasSelecionadas),
        passageiros: passageiros.toString(),
        valorTotal: precoTotal.toString(),
        origem: origemParam || "",
        destino: destinoParam || "",
        tipoViagem: tipoViagem,
        dataIda: dataIda,
        dataVolta: dataVolta,
      },
    } as any);
  }, [
    passagem,
    poltronasSelecionadas,
    precoTotal,
    router,
    origemParam,
    destinoParam,
    params.tipoViagem,
    params.dataIda,
    params.dataVolta,
  ]);

  const renderPoltrona = useCallback(
    (poltrona: Poltrona) => {
      const selecionada = poltronasSelecionadas.includes(poltrona.numero);
      const disponivel = poltrona.disponivel;

      return (
        <Pressable
          style={[
            styles.poltrona,
            !disponivel && styles.poltronaOcupada,
            selecionada && styles.poltronaSelecionada,
            poltrona.preferencial && styles.poltronaPreferencial,
          ]}
          onPress={() => disponivel && togglePoltrona(poltrona.numero)}
          disabled={!disponivel}
        >
          <Text
            style={[
              styles.poltronaNumero,
              !disponivel && styles.poltronaNumeroOcupada,
              selecionada && styles.poltronaNumeroSelecionada,
            ]}
          >
            {poltrona.numero}
          </Text>
          {poltrona.janela && (
            <View style={styles.janelaIcon}>
              <Icon name="wb-sunny" size={12} color={cores.warning} />
            </View>
          )}
        </Pressable>
      );
    },
    [poltronasSelecionadas, togglePoltrona]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={cores.primary} />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!passagem) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="error-outline" size={tamanhos.icon2xl + 16} color={cores.textTertiary} />
        <Text style={styles.emptyText}>Passagem não encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-back" size={tamanhos.iconMd} color={cores.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Detalhes da Passagem</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Banner de Promoção */}
      {descontoPromocao.temDesconto && (
        <View style={styles.promocaoBanner}>
          <View style={styles.promocaoBannerContent}>
            <Icon name="local-offer" size={tamanhos.iconMd} color="#FFFFFF" />
            <View style={styles.promocaoBannerText}>
              <Text style={styles.promocaoBannerTitle}>
                🎉 Promoção Disponível!
              </Text>
              <Text style={styles.promocaoBannerSubtitle}>
                Ganhe {descontoPromocao.percentual}% de desconto por comprar com {descontoPromocao.diasAntecedencia} dias de antecedência
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.infoCard}>
        <View style={styles.companhiaHeader}>
          <Text style={styles.companhiaNome} numberOfLines={2}>
            {passagem.companhia.nome}
          </Text>
          {passagem.companhia.avaliacao > 0 && (
            <View style={styles.avaliacao}>
              <Icon name="star" size={tamanhos.iconSm} color={cores.warning} />
              <Text style={styles.avaliacaoText}>
                {passagem.companhia.avaliacao.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.rotaContainer}>
          <View style={styles.rotaItem}>
            <Text style={styles.rotaCidade} numberOfLines={2}>{passagem.origem.nome}</Text>
            <Text style={styles.rotaEstado} numberOfLines={2}>{passagem.origem.estado}</Text>
            <Text style={styles.rotaHorario}>{passagem.horarioPartida}</Text>
            <Text style={styles.rotaData}>
              {format(new Date(passagem.dataPartida), "dd 'de' MMM", {
                locale: ptBR,
              })}
            </Text>
          </View>

          <View style={styles.rotaLinha}>
            <View style={styles.rotaLinhaPonto} />
            <View style={styles.rotaLinhaTraco} />
            <View style={styles.rotaLinhaPonto} />
          </View>

          <View style={styles.rotaItem}>
            <Text style={styles.rotaCidade} numberOfLines={2}>
              {passagem.destino.nome}
            </Text>
            <Text style={styles.rotaEstado} numberOfLines={2}>
              {passagem.destino.estado}
            </Text>
            <Text style={styles.rotaHorario}>{passagem.horarioChegada}</Text>
            <Text style={styles.rotaData}>
              {format(new Date(passagem.dataChegada), "dd 'de' MMM", {
                locale: ptBR,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="schedule" size={tamanhos.iconSm} color={cores.textSecondary} />
            <Text style={styles.infoText}>Duração: {passagem.duracao}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="event-seat" size={tamanhos.iconSm} color={cores.textSecondary} />
            <Text style={styles.infoText}>
              {formatarTipoAssento(passagem.tipoAssento)}
            </Text>
          </View>
        </View>

        {passagem.servicos && passagem.servicos.length > 0 && (
          <View style={styles.servicosContainer}>
            <Text style={styles.servicosTitle}>Serviços inclusos:</Text>
            <View style={styles.servicosList}>
              {passagem.servicos.map((servico) => (
                <View key={servico.id} style={styles.servicoItem}>
                  <Icon
                    name={getValidIcon(servico.icone) as any}
                    size={16}
                    color="#10B981"
                  />
                  <Text style={styles.servicoText}>{servico.nome}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.secaoContainer}>
        <Text style={styles.secaoTitle}>Selecione as Poltronas</Text>
        <Text style={styles.secaoSubtitle}>
          {poltronasSelecionadas.length} de {passageiros} poltrona(s) selecionada(s)
        </Text>
        <Text style={[styles.secaoSubtitle, { color: cores.textSecondary, fontSize: tamanhos.xs, marginTop: tamanhos.spacingXs }]}>
          Selecione {passageiros} poltrona(s) para {passageiros} passageiro(s)
        </Text>

        <View style={styles.legenda}>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, styles.poltronaDisponivel]} />
            <Text style={styles.legendaText}>Disponível</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, styles.poltronaOcupada]} />
            <Text style={styles.legendaText}>Ocupada</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, styles.poltronaSelecionada]} />
            <Text style={styles.legendaText}>Selecionada</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, styles.poltronaPreferencial]} />
            <Text style={styles.legendaText}>Preferencial</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor]}>
              <Icon name="wb-sunny" size={12} color={cores.warning} />
            </View>
            <Text style={styles.legendaText}>Janela</Text>
          </View>
        </View>

        {passagem.poltronas && passagem.poltronas.length > 0 ? (
          <View style={styles.poltronasContainer}>
            <View style={styles.poltronasGrid}>
              {passagem.poltronas.map((poltrona, index) => (
                <View key={`poltrona-${poltrona.numero}-${index}`}>
                  {renderPoltrona(poltrona)}
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyPoltronas}>
            <Text style={styles.emptyPoltronasText}>
              Poltronas não disponíveis
            </Text>
          </View>
        )}
      </View>

      <View style={styles.resumoContainer}>
        <View style={styles.resumoRow}>
          <Text style={styles.resumoLabel} numberOfLines={1}>Passagem(s)</Text>
          <Text style={styles.resumoValue} numberOfLines={1}>
            {formatarPreco(passagem.preco)} x {poltronasSelecionadas.length || passageiros}
          </Text>
        </View>
        {poltronasSelecionadas.length > 0 && (
          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel} numberOfLines={1}>Poltronas selecionadas</Text>
            <Text style={styles.resumoValue} numberOfLines={2}>
              {poltronasSelecionadas.join(", ")}
            </Text>
          </View>
        )}
        {(() => {
          const valorAdicional = poltronasSelecionadas.reduce((total, numero) => {
            const poltrona = passagem.poltronas?.find((p) => p.numero === numero);
            return total + (poltrona?.precoAdicional || 0);
          }, 0);
          
          if (valorAdicional > 0) {
            return (
              <View style={styles.resumoRow}>
                <Text style={styles.resumoLabel} numberOfLines={1}>Preferencial</Text>
                <Text style={styles.resumoValue} numberOfLines={1}>
                  {formatarPreco(valorAdicional)}
                </Text>
              </View>
            );
          }
          return null;
        })()}
        {descontoPromocao.temDesconto && (
          <View style={styles.resumoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumoLabel} numberOfLines={1}>
                Promoção: {descontoPromocao.percentual}% de desconto
              </Text>
              <Text style={[styles.resumoValue, { color: '#10B981', fontWeight: '700' }]} numberOfLines={1}>
                - {formatarPreco(descontoPromocao.valorDesconto)}
              </Text>
              <Text style={[styles.resumoLabel, { fontSize: tamanhos.xs, marginTop: tamanhos.spacingXs / 2, color: cores.success }]}>
                Compra antecipada de {descontoPromocao.diasAntecedencia} dias
              </Text>
            </View>
          </View>
        )}
        <View style={styles.resumoRowTotal}>
          <Text style={styles.resumoLabelTotal} numberOfLines={1}>Total</Text>
          <Text style={styles.resumoValueTotal} numberOfLines={1}>
            {formatarPreco(precoTotalComDesconto)}
          </Text>
        </View>
        {descontoPromocao.temDesconto && (
          <Text style={[styles.resumoLabel, { fontSize: tamanhos.xs, marginTop: tamanhos.spacingXs, color: cores.textSecondary, textAlign: 'center' }]}>
            Valor original: {formatarPreco(precoTotal)}
          </Text>
        )}
      </View>

      <Pressable
        style={[
          styles.continuarButton,
          poltronasSelecionadas.length !== passageiros &&
            styles.continuarButtonDisabled,
        ]}
        onPress={handleContinuar}
        disabled={poltronasSelecionadas.length !== passageiros}
      >
        <Text style={styles.continuarButtonText}>
          Continuar para Pagamento - {formatarPreco(precoTotalComDesconto)}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

function getStyles(cores: CoresType, tamanhos: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: cores.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: cores.background,
    },
    loadingText: {
      marginTop: tamanhos.spacingLg,
      fontSize: tamanhos.md,
      color: cores.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: tamanhos.spacingXl * 2,
      backgroundColor: cores.background,
    },
    emptyText: {
      marginTop: tamanhos.spacingLg,
      fontSize: tamanhos.lg,
      fontWeight: "600",
      color: cores.text,
      textAlign: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: tamanhos.spacingLg,
      paddingTop: 60,
      paddingBottom: tamanhos.spacingLg,
      backgroundColor: cores.header,
      borderBottomWidth: 1,
      borderBottomColor: cores.border,
    },
    headerTitle: {
      fontSize: tamanhos.xl,
      fontWeight: "700",
      color: cores.text,
    },
    infoCard: {
      backgroundColor: cores.backgroundCard,
      margin: tamanhos.spacingLg,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    companhiaHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: tamanhos.spacingLg,
    },
    companhiaNome: {
      fontSize: tamanhos['2xl'],
      fontWeight: "700",
      color: cores.text,
      flex: 1,
      flexShrink: 1,
      marginRight: tamanhos.spacingSm,
    },
    avaliacao: {
      flexDirection: "row",
      alignItems: "center",
      gap: tamanhos.spacingXs,
    },
    avaliacaoText: {
      fontSize: tamanhos.sm,
      fontWeight: "600",
      color: cores.warning,
    },
    rotaContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: tamanhos.spacingLg,
    },
    rotaItem: {
      flex: 1,
      alignItems: "center",
    },
    rotaCidade: {
      fontSize: tamanhos.lg,
      fontWeight: "700",
      color: cores.text,
      marginBottom: tamanhos.spacingXs,
      textAlign: "center",
      flexShrink: 1,
    },
    rotaEstado: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      marginBottom: tamanhos.spacingSm,
      textAlign: "center",
      flexShrink: 0,
      minWidth: "100%",
    },
    rotaHorario: {
      fontSize: tamanhos.xl,
      fontWeight: "700",
      color: cores.primary,
      marginBottom: 4,
    },
    rotaData: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
      minWidth: "100%",
      textAlign: "center",
    },
    rotaLinha: {
      width: 60,
      alignItems: "center",
      marginHorizontal: tamanhos.spacingLg,
    },
    rotaLinhaPonto: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: cores.primary,
    },
    rotaLinhaTraco: {
      width: 2,
      height: 40,
      backgroundColor: cores.border,
      marginVertical: tamanhos.spacingXs,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: tamanhos.spacingLg,
      paddingTop: tamanhos.spacingLg,
      borderTopWidth: 1,
      borderTopColor: cores.border,
      flexWrap: "wrap",
      gap: tamanhos.spacingMd,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: tamanhos.spacingSm,
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
    },
    infoText: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      flexShrink: 1,
      minWidth: "100%",
    },
    servicosContainer: {
      marginTop: tamanhos.spacingLg,
      paddingTop: tamanhos.spacingLg,
      borderTopWidth: 1,
      borderTopColor: cores.border,
    },
    servicosTitle: {
      fontSize: tamanhos.sm,
      fontWeight: "600",
      color: cores.text,
      marginBottom: tamanhos.spacingMd,
    },
    servicosList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tamanhos.spacingMd,
    },
    servicoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: tamanhos.spacingSm - 2,
      backgroundColor: cores.successLight,
      paddingHorizontal: tamanhos.spacingSm + 2,
      paddingVertical: tamanhos.spacingSm - 2,
      borderRadius: 8,
      flexShrink: 1,
      minWidth: 0,
    },
    servicoText: {
      fontSize: tamanhos.xs,
      color: cores.success,
      flexShrink: 1,
      minWidth: "20%",
    },
    secaoContainer: {
      backgroundColor: cores.backgroundCard,
      margin: tamanhos.spacingLg,
      marginTop: 0,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    secaoTitle: {
      fontSize: tamanhos.lg,
      fontWeight: "700",
      color: cores.text,
      marginBottom: tamanhos.spacingXs,
    },
    secaoSubtitle: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      marginBottom: tamanhos.spacingLg,
    },
    legenda: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tamanhos.spacingLg,
      marginBottom: tamanhos.spacingLg,
      paddingBottom: tamanhos.spacingLg,
      borderBottomWidth: 1,
      borderBottomColor: cores.border,
    },
    legendaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: tamanhos.spacingSm,
      flexShrink: 1,
      minWidth: 0,
    },
    legendaCor: {
      width: tamanhos.iconMd,
      height: tamanhos.iconMd,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: cores.border,
      justifyContent: "center",
      alignItems: "center",
    },
    legendaText: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
      flexShrink: 1,
      minWidth: "20%",
    },
    poltronasContainer: {
      marginTop: 8,
    },
    poltronasGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "center",
    },
    poltrona: {
      width: 50,
      height: 50,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: cores.border,
      backgroundColor: cores.backgroundCard,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    poltronaDisponivel: {
      backgroundColor: cores.backgroundCard,
      borderColor: cores.border,
      opacity: 0.6,
    },
    poltronaOcupada: {
      backgroundColor: cores.error,
      borderColor: cores.error,
      opacity: 0.6,
    },
    poltronaSelecionada: {
      backgroundColor: cores.primary,
      borderColor: cores.primary,
    },
    poltronaPreferencial: {
      borderColor: cores.warning,
      borderWidth: 3,
    },
    poltronaNumero: {
      fontSize: tamanhos.sm,
      fontWeight: "600",
      color: cores.text,
    },
    poltronaNumeroOcupada: {
      color: "#FFFFFF",
    },
    poltronaNumeroSelecionada: {
      color: "#FFFFFF",
    },
    janelaIcon: {
      position: "absolute",
      top: 2,
      right: 2,
    },
    emptyPoltronas: {
      padding: 40,
      alignItems: "center",
    },
    emptyPoltronasText: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      textAlign: "center",
    },
    resumoContainer: {
      backgroundColor: cores.backgroundCard,
      margin: tamanhos.spacingLg,
      marginTop: 0,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    resumoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: tamanhos.spacingMd,
      flexWrap: "wrap",
    },
    resumoLabel: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
      marginRight: tamanhos.spacingSm,
    },
    resumoValue: {
      fontSize: tamanhos.sm,
      fontWeight: "600",
      color: cores.text,
      flexShrink: 0,
      textAlign: "right",
    },
    resumoRowTotal: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: tamanhos.spacingSm,
      paddingTop: tamanhos.spacingLg,
      borderTopWidth: 2,
      borderTopColor: cores.primary,
    },
    resumoLabelTotal: {
      fontSize: tamanhos.lg,
      fontWeight: "700",
      color: cores.text,
    },
    resumoValueTotal: {
      fontSize: tamanhos.xl,
      fontWeight: "700",
      color: cores.primary,
    },
    continuarButton: {
      backgroundColor: cores.primary,
      margin: tamanhos.spacingLg,
      marginTop: 0,
      borderRadius: 12,
      paddingVertical: tamanhos.spacingLg,
      alignItems: "center",
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    continuarButtonDisabled: {
      backgroundColor: cores.textTertiary,
      opacity: 0.6,
    },
    continuarButtonText: {
      color: "#FFFFFF",
      fontSize: tamanhos.lg,
      fontWeight: "700",
    },
    promocaoBanner: {
      backgroundColor: cores.success,
      marginHorizontal: tamanhos.spacingLg,
      marginTop: tamanhos.spacingLg,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    promocaoBannerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: tamanhos.spacingMd,
    },
    promocaoBannerText: {
      flex: 1,
    },
    promocaoBannerTitle: {
      fontSize: tamanhos.md,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: 4,
    },
    promocaoBannerSubtitle: {
      fontSize: tamanhos.base,
      color: "#FFFFFF",
      opacity: 0.95,
      lineHeight: tamanhos.base + 4,
    },
  });
}
