import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Modal, TextInput, Alert, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PassagemService } from '@/src/services/api/passagens';
import { PagamentoService } from '@/src/services/api/pagamento';
import { Passagem, Cidade } from '@/src/interfaces/passagem';
import { MetodoPagamento, DadosPagamento, Passageiro } from '@/src/interfaces/pagamento';
import Icon from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { calcularDescontoPromocao } from '@/src/utils/calcularDescontoPromocao';
import { ptBR } from 'date-fns/locale';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

export const CheckoutPagamentoScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const [passagem, setPassagem] = useState<Passagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [poltronas, setPoltronas] = useState<number[]>([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>(MetodoPagamento.CARTAO_CREDITO);
  const [showModalPagamento, setShowModalPagamento] = useState(false);
  const [showModalPix, setShowModalPix] = useState(false);
  const [qrCodePix, setQrCodePix] = useState('');

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);
  
  // Dados do pagamento
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeTitular, setNomeTitular] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [cpf, setCpf] = useState('');
  
  // Dados dos passageiros
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [numPassageiros, setNumPassageiros] = useState(1);

  // Ref para rastrear se já carregamos os dados iniciais
  const dadosCarregadosRef = useRef<string>('');

  // Extrair valores específicos dos params para evitar re-renders infinitos
  const passagemId = params.passagemId as string;
  const poltronasParam = params.poltronas as string;
  const valorTotalParam = params.valorTotal as string;
  const numPassageirosParam = params.passageiros as string;
  const origemParam = params.origem as string;
  const destinoParam = params.destino as string;
  const tipoViagemParam = (params.tipoViagem as string) || 'IDA';
  const dataIdaParam = params.dataIda as string;
  const dataVoltaParam = params.dataVolta as string;

  // Parse das cidades
  const origem = origemParam ? (() => {
    try {
      return JSON.parse(origemParam) as Cidade;
    } catch {
      return null;
    }
  })() : null;

  const destino = destinoParam ? (() => {
    try {
      return JSON.parse(destinoParam) as Cidade;
    } catch {
      return null;
    }
  })() : null;

  // Criar uma chave única para os dados carregados
  const dadosKey = `${passagemId}-${poltronasParam}-${valorTotalParam}-${numPassageirosParam}`;

  useEffect(() => {
    // Evitar recarregar se os dados já foram carregados com os mesmos parâmetros
    if (!passagemId || dadosCarregadosRef.current === dadosKey) {
      if (!passagemId) {
        setLoading(false);
      }
      return;
    }

    const carregarDados = async () => {
      try {
        setLoading(true);
        const poltronasArray = poltronasParam ? JSON.parse(poltronasParam) : [];
        const valorTotal = parseFloat(valorTotalParam) || 0;
        const numPassageiros = parseInt(numPassageirosParam) || 1;

        setPoltronas(poltronasArray);
        setValorTotal(valorTotal);
        setNumPassageiros(numPassageiros);

        const detalhes = await PassagemService.obterDetalhes(passagemId, origem, destino);
        setPassagem(detalhes);

        // Inicializar dados dos passageiros
        const passageirosIniciais: Passageiro[] = Array.from({ length: numPassageiros }, (_, i) => ({
          nome: '',
          cpf: '',
          dataNascimento: new Date(),
          telefone: '',
          email: '',
          tipo: 'ADULTO' as const,
          poltrona: poltronasArray[i] || undefined,
        }));
        setPassageiros(passageirosIniciais);

        // Marcar que os dados foram carregados
        dadosCarregadosRef.current = dadosKey;
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados da compra');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [passagemId, poltronasParam, valorTotalParam, numPassageirosParam]);

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  // Calcular desconto de promoção (5% para compras com 10+ dias de antecedência)
  const descontoPromocao = useMemo(() => {
    return calcularDescontoPromocao(passagem?.dataPartida, valorTotal);
  }, [passagem?.dataPartida, valorTotal]);

  // Valor total com desconto aplicado
  const valorTotalComDesconto = useMemo(() => {
    return valorTotal - descontoPromocao.valorDesconto;
  }, [valorTotal, descontoPromocao.valorDesconto]);

  const handleFinalizarCompra = async () => {
    // Validar dados dos passageiros
    for (let i = 0; i < passageiros.length; i++) {
      const p = passageiros[i];
      if (!p.nome || !p.cpf || !p.email || !p.telefone) {
        Alert.alert('Atenção', `Preencha todos os dados do passageiro ${i + 1}`);
        return;
      }
    }

    // Validar dados de pagamento (modo teste - validação simplificada)
    if (metodoPagamento === MetodoPagamento.CARTAO_CREDITO || metodoPagamento === MetodoPagamento.CARTAO_DEBITO) {
      // Em modo teste, apenas verificar se tem algum dado (não precisa ser completo)
      if (!numeroCartao && !nomeTitular) {
        Alert.alert('Atenção', 'Preencha pelo menos alguns dados do cartão (modo teste)');
        return;
      }
    }

    try {
      setProcessando(true);

      if (!passagem) {
        Alert.alert('Erro', 'Dados da passagem não encontrados');
        return;
      }

      // Buscar usuário logado
      const { AuthService } = await import('@/src/services/api/storage');
      const usuario = await AuthService.getUser();

      // Verificar se é ida e volta
      const isIdaVolta = tipoViagemParam === 'IDA_VOLTA';
      const dataVolta = dataVoltaParam ? new Date(dataVoltaParam) : null;

      // Declarar variáveis de volta no escopo correto
      let reservaVolta: any = null;
      let passagemVolta: Passagem | null = null;

      // Aplicar desconto de promoção se houver
      const valorFinalIda = isIdaVolta 
        ? (valorTotalComDesconto / 2) 
        : valorTotalComDesconto;

      // Criar reserva de ida (passar valorTotal com desconto, usuarioId e passagem completa para salvar no banco)
      const reservaIda = await PagamentoService.criarReserva(
        passagem.id,
        poltronas,
        passageiros,
        valorFinalIda,
        usuario?.id,
        passagem // Passar passagem completa para salvar no banco
      );

      // Se for ida e volta, criar também reserva de volta
      if (isIdaVolta && dataVolta && origem && destino) {
        try {
          // Buscar ou criar passagem de volta
          const { PassagemService } = await import('@/src/services/api/passagens');
          
          // Criar busca para volta (cidades invertidas)
          const buscaVolta = {
            origem: destino, // Destino vira origem
            destino: origem, // Origem vira destino
            dataIda: dataVolta,
            dataVolta: null,
            tipoViagem: 'IDA' as const,
            passageiros: numPassageiros,
          };

          // Buscar passagens de volta
          const passagensVolta = await PassagemService.buscarPassagens(buscaVolta);
          
          if (passagensVolta.length > 0) {
            // Usar a primeira passagem de volta encontrada (ou a mesma companhia se possível)
            const passagemVoltaResumo = passagensVolta.find(p => p.companhiaId === passagem.companhia?.id) || passagensVolta[0];
            
            // Obter detalhes da passagem de volta
            passagemVolta = await PassagemService.obterDetalhes(
              passagemVoltaResumo.id,
              destino, // Origem da volta é o destino da ida
              origem,  // Destino da volta é a origem da ida
              passagemVoltaResumo
            );

            // Criar reserva de volta (usar as mesmas poltronas se possível, ou gerar novas)
            const valorFinalVolta = valorTotalComDesconto / 2; // Metade do valor com desconto para volta
            reservaVolta = await PagamentoService.criarReserva(
              passagemVolta.id,
              poltronas, // Mesmas poltronas para volta
              passageiros,
              valorFinalVolta,
              usuario?.id,
              passagemVolta // Passar passagem completa para salvar no banco
            );
          } else {
            console.warn('Nenhuma passagem de volta encontrada');
          }
        } catch (error: any) {
          console.error('Erro ao criar reserva de volta:', error);
          // Continuar mesmo se não conseguir criar a volta
        }
      }

      // Processar pagamento
      const dadosPagamento: DadosPagamento = {
        numeroCartao: metodoPagamento.includes('CARTAO') ? numeroCartao : undefined,
        nomeTitular: metodoPagamento.includes('CARTAO') ? nomeTitular : undefined,
        validade: metodoPagamento.includes('CARTAO') ? validade : undefined,
        cvv: metodoPagamento.includes('CARTAO') ? cvv : undefined,
        cpf: cpf || passageiros[0]?.cpf || undefined,
        email: passageiros[0]?.email || undefined,
        telefone: passageiros[0]?.telefone || undefined,
      };

      // Processar pagamento (modo teste - sempre funciona)
      if (metodoPagamento === MetodoPagamento.PIX) {
        // Gerar QR Code PIX (modo teste) - usar valor com desconto
        const pixCode = `00020126580014BR.GOV.BCB.PIX0136${Date.now()}520400005303986540${valorTotalComDesconto.toFixed(2)}5802BR5925PASSAGEM ONIBUS TESTE6009SAO PAULO62070503***6304`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;
        
        setQrCodePix(qrCodeUrl);
        setShowModalPix(true);
        
        // Fechar modal após 3 segundos e processar pagamento
        setTimeout(async () => {
          setShowModalPix(false);
          setProcessando(false);
          
          try {
            // Processar pagamento da ida
            await PagamentoService.processarPagamento(
              reservaIda.id.toString(),
              metodoPagamento,
              { ...dadosPagamento, pixChave: pixCode }
            );
            
            // Se houver volta, processar pagamento da volta também
            if (reservaVolta) {
              await PagamentoService.processarPagamento(
                reservaVolta.id.toString(),
                metodoPagamento,
                { ...dadosPagamento, pixChave: pixCode }
              );
            }
          } catch (error: any) {
            console.warn('Aviso no processamento de pagamento (modo teste):', error);
            // Continuar mesmo com erro
          }

          // Criar viagem de ida após pagamento
          if (usuario && reservaIda.id && passagem) {
            try {
              const { ViagemDatabaseService } = await import('@/src/services/database/viagens');
              console.log('=== CRIANDO VIAGEM ===');
              console.log('Reserva ID:', reservaIda.id, typeof reservaIda.id);
              console.log('Usuario ID:', usuario.id, typeof usuario.id);
              console.log('Passagem ID:', passagem.id);
              console.log('Data Partida:', passagem.dataPartida, typeof passagem.dataPartida);
              console.log('Horário Partida:', passagem.horarioPartida, typeof passagem.horarioPartida);
              
              const reservaIdStr = String(reservaIda.id);
              const usuarioIdStr = String(usuario.id);
              
              // Garantir que a data seja um objeto Date
              const dataPartida = passagem.dataPartida instanceof Date 
                ? passagem.dataPartida 
                : new Date(passagem.dataPartida);
              
              // Garantir que o horário seja uma string
              const horarioPartida = passagem.horarioPartida || '08:00';
              
              console.log('Data Partida processada:', dataPartida.toISOString());
              console.log('Horário Partida processado:', horarioPartida);
              
              const viagemIda = await ViagemDatabaseService.criarViagem(
                reservaIdStr, 
                usuarioIdStr, 
                dataPartida, 
                horarioPartida, 
                passagem,
                'IDA'
              );
              console.log('✅ Viagem de IDA criada com sucesso:', viagemIda.id);
              
              // Se houver volta, criar viagem de volta
              if (reservaVolta && passagemVolta && dataVolta) {
                try {
                  const reservaVoltaIdStr = String(reservaVolta.id);
                  const dataVoltaDate = dataVolta instanceof Date ? dataVolta : new Date(dataVolta);
                  const horarioPartidaVolta = passagemVolta.horarioPartida || '08:00';
                  
                  const viagemVolta = await ViagemDatabaseService.criarViagem(
                    reservaVoltaIdStr,
                    usuarioIdStr,
                    dataVoltaDate,
                    horarioPartidaVolta,
                    passagemVolta,
                    'VOLTA'
                  );
                  console.log('✅ Viagem de VOLTA criada com sucesso:', viagemVolta.id);
                } catch (errorVolta: any) {
                  console.error('❌ Erro ao criar viagem de volta:', errorVolta);
                }
              }
              
              // Verificar se as viagens foram salvas corretamente
              const viagens = await ViagemDatabaseService.obterMinhasViagens(usuarioIdStr);
              console.log('Total de viagens após criar:', viagens.length);
              const viagemEncontrada = viagens.find(v => v.id === viagemIda.id);
              if (viagemEncontrada) {
                console.log('✅ Viagem de IDA encontrada na lista de viagens');
              } else {
                console.warn('⚠️ Viagem de IDA não encontrada na lista de viagens');
              }
            } catch (viagemError: any) {
              console.error('❌ Erro ao criar viagem:', viagemError);
              console.error('Stack:', viagemError.stack);
              // Tentar criar viagem sem passar a passagem (vai buscar do banco)
              try {
                const { ViagemDatabaseService } = await import('@/src/services/database/viagens');
                const reservaIdStr = String(reservaIda.id);
                const usuarioIdStr = String(usuario.id);
                const dataPartida = passagem.dataPartida instanceof Date 
                  ? passagem.dataPartida 
                  : new Date(passagem.dataPartida);
                const horarioPartida = passagem.horarioPartida || '08:00';
                await ViagemDatabaseService.criarViagem(reservaIdStr, usuarioIdStr, dataPartida, horarioPartida, passagem, 'IDA');
                console.log('✅ Viagem de IDA criada sem passar passagem (tentativa 2)');
                
                // Se houver volta, criar também
                if (reservaVolta && passagemVolta && dataVolta) {
                  try {
                    const reservaVoltaIdStr = String(reservaVolta.id);
                    const dataVoltaDate = dataVolta instanceof Date ? dataVolta : new Date(dataVolta);
                    const horarioPartidaVolta = passagemVolta.horarioPartida || '08:00';
                    await ViagemDatabaseService.criarViagem(reservaVoltaIdStr, usuarioIdStr, dataVoltaDate, horarioPartidaVolta, passagemVolta, 'VOLTA');
                    console.log('✅ Viagem de VOLTA criada sem passar passagem (tentativa 2)');
                  } catch (errorVolta2: any) {
                    console.error('❌ Erro ao criar viagem de volta (tentativa 2):', errorVolta2);
                  }
                }
              } catch (error2: any) {
                console.error('❌ Erro ao criar viagem (tentativa 2):', error2);
                console.error('Stack:', error2.stack);
                // Mostrar erro para o usuário
                Alert.alert(
                  'Aviso',
                  'A reserva foi criada, mas houve um problema ao salvar a viagem. Entre em contato com o suporte.',
                  [{ text: 'OK' }]
                );
              }
            }
          } else {
            console.warn('⚠️ Não foi possível criar viagem: dados faltando', { 
              usuario: !!usuario, 
              usuarioId: usuario?.id,
              reservaId: reservaIda?.id, 
              passagem: !!passagem,
              passagemId: passagem?.id 
            });
          }

          setProcessando(false);
          const mensagemSucesso = isIdaVolta && reservaVolta
            ? `Suas passagens de ida e volta foram confirmadas.${reservaIda.codigoReserva ? ` Código da reserva (ida): ${reservaIda.codigoReserva}.` : ''}${reservaVolta.codigoReserva ? ` Código da reserva (volta): ${reservaVolta.codigoReserva}.` : ''} Você pode visualizá-las em "Minhas Viagens".`
            : `Sua passagem foi confirmada.${reservaIda.codigoReserva ? ` Código da reserva: ${reservaIda.codigoReserva}.` : ''} Você pode visualizá-la em "Minhas Viagens".`;
          
          Alert.alert(
            'Pagamento realizado com sucesso!',
            mensagemSucesso,
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace('/(tabs)/MinhasViagens');
                }
              }
            ]
          );
        }, 3000);
      } else {
        // Para cartão de crédito/débito, simular processamento (1.5 segundos)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        try {
          // Processar pagamento da ida
          await PagamentoService.processarPagamento(
            reservaIda.id.toString(),
            metodoPagamento,
            dadosPagamento
          );
          
          // Se houver volta, processar pagamento da volta também
          if (reservaVolta) {
            await PagamentoService.processarPagamento(
              reservaVolta.id.toString(),
              metodoPagamento,
              dadosPagamento
            );
          }
        } catch (error: any) {
          console.warn('Aviso no processamento de pagamento (modo teste):', error);
          // Continuar mesmo com erro
        }

        // Criar viagem de ida após pagamento
        if (usuario && reservaIda.id && passagem) {
          try {
            const { ViagemDatabaseService } = await import('@/src/services/database/viagens');
            console.log('=== CRIANDO VIAGEM (CARTÃO) ===');
            console.log('Reserva ID:', reservaIda.id, typeof reservaIda.id);
            console.log('Usuario ID:', usuario.id, typeof usuario.id);
            console.log('Passagem ID:', passagem.id);
            console.log('Data Partida:', passagem.dataPartida, typeof passagem.dataPartida);
            console.log('Horário Partida:', passagem.horarioPartida, typeof passagem.horarioPartida);
            
            const reservaIdStr = String(reservaIda.id);
            const usuarioIdStr = String(usuario.id);
            
            // Garantir que a data seja um objeto Date
            const dataPartida = passagem.dataPartida instanceof Date 
              ? passagem.dataPartida 
              : new Date(passagem.dataPartida);
            
            // Garantir que o horário seja uma string
            const horarioPartida = passagem.horarioPartida || '08:00';
            
            console.log('Data Partida processada:', dataPartida.toISOString());
            console.log('Horário Partida processado:', horarioPartida);
            
            const viagemIda = await ViagemDatabaseService.criarViagem(
              reservaIdStr, 
              usuarioIdStr, 
              dataPartida, 
              horarioPartida, 
              passagem,
              'IDA'
            );
            console.log('✅ Viagem de IDA criada com sucesso:', viagemIda.id);
            
            // Se houver volta, criar viagem de volta
            if (reservaVolta && passagemVolta && dataVolta) {
              try {
                const reservaVoltaIdStr = String(reservaVolta.id);
                const dataVoltaDate = dataVolta instanceof Date ? dataVolta : new Date(dataVolta);
                const horarioPartidaVolta = passagemVolta.horarioPartida || '08:00';
                
                const viagemVolta = await ViagemDatabaseService.criarViagem(
                  reservaVoltaIdStr,
                  usuarioIdStr,
                  dataVoltaDate,
                  horarioPartidaVolta,
                  passagemVolta,
                  'VOLTA'
                );
                console.log('✅ Viagem de VOLTA criada com sucesso:', viagemVolta.id);
              } catch (errorVolta: any) {
                console.error('❌ Erro ao criar viagem de volta:', errorVolta);
              }
            }
            
            // Verificar se as viagens foram salvas corretamente
            const viagens = await ViagemDatabaseService.obterMinhasViagens(usuarioIdStr);
            console.log('Total de viagens após criar:', viagens.length);
            const viagemEncontrada = viagens.find(v => v.id === viagemIda.id);
            if (viagemEncontrada) {
              console.log('✅ Viagem de IDA encontrada na lista de viagens');
            } else {
              console.warn('⚠️ Viagem de IDA não encontrada na lista de viagens');
            }
          } catch (viagemError: any) {
            console.error('❌ Erro ao criar viagem:', viagemError);
            console.error('Stack:', viagemError.stack);
            // Tentar criar viagem sem passar a passagem (vai buscar do banco)
            try {
              const { ViagemDatabaseService } = await import('@/src/services/database/viagens');
              const reservaIdStr = String(reservaIda.id);
              const usuarioIdStr = String(usuario.id);
              const dataPartida = passagem.dataPartida instanceof Date 
                ? passagem.dataPartida 
                : new Date(passagem.dataPartida);
              const horarioPartida = passagem.horarioPartida || '08:00';
              await ViagemDatabaseService.criarViagem(reservaIdStr, usuarioIdStr, dataPartida, horarioPartida, passagem, 'IDA');
              console.log('✅ Viagem de IDA criada sem passar passagem (tentativa 2)');
              
              // Se houver volta, criar também
              if (reservaVolta && passagemVolta && dataVolta) {
                try {
                  const reservaVoltaIdStr = String(reservaVolta.id);
                  const dataVoltaDate = dataVolta instanceof Date ? dataVolta : new Date(dataVolta);
                  const horarioPartidaVolta = passagemVolta.horarioPartida || '08:00';
                  await ViagemDatabaseService.criarViagem(reservaVoltaIdStr, usuarioIdStr, dataVoltaDate, horarioPartidaVolta, passagemVolta, 'VOLTA');
                  console.log('✅ Viagem de VOLTA criada sem passar passagem (tentativa 2)');
                } catch (errorVolta2: any) {
                  console.error('❌ Erro ao criar viagem de volta (tentativa 2):', errorVolta2);
                }
              }
            } catch (error2: any) {
              console.error('❌ Erro ao criar viagem (tentativa 2):', error2);
              console.error('Stack:', error2.stack);
              // Mostrar erro para o usuário
              Alert.alert(
                'Aviso',
                'A reserva foi criada, mas houve um problema ao salvar a viagem. Entre em contato com o suporte.',
                [{ text: 'OK' }]
              );
            }
          }
        } else {
          console.warn('⚠️ Não foi possível criar viagem: dados faltando', { 
            usuario: !!usuario, 
            usuarioId: usuario?.id,
            reservaId: reservaIda?.id, 
            passagem: !!passagem,
            passagemId: passagem?.id 
          });
        }

        setProcessando(false);
        const mensagemSucesso = isIdaVolta && reservaVolta
          ? `Suas passagens de ida e volta foram confirmadas.${reservaIda.codigoReserva ? ` Código da reserva (ida): ${reservaIda.codigoReserva}.` : ''}${reservaVolta.codigoReserva ? ` Código da reserva (volta): ${reservaVolta.codigoReserva}.` : ''} Você pode visualizá-las em "Minhas Viagens".`
          : `Sua passagem foi confirmada.${reservaIda.codigoReserva ? ` Código da reserva: ${reservaIda.codigoReserva}.` : ''} Você pode visualizá-la em "Minhas Viagens".`;
        
        Alert.alert(
          'Pagamento realizado com sucesso!',
          mensagemSucesso,
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(tabs)/MinhasViagens');
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Erro ao finalizar compra:', error);
      setProcessando(false);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível finalizar a compra. Tente novamente.'
      );
    }
    // Nota: setProcessando(false) é chamado dentro dos fluxos de PIX e cartão
  };

  const atualizarPassageiro = (index: number, campo: keyof Passageiro, valor: any) => {
    const novosPassageiros = [...passageiros];
    novosPassageiros[index] = {
      ...novosPassageiros[index],
      [campo]: valor,
    };
    setPassageiros(novosPassageiros);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!passagem) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="error-outline" size={tamanhos.icon2xl + 16} color={cores.textTertiary} />
        <Text style={styles.emptyText}>Erro ao carregar dados da passagem</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-back" size={tamanhos.iconMd} color={cores.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Finalizar Compra</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Banner de Promoção */}
      {descontoPromocao.temDesconto && (
        <View style={styles.promocaoBanner}>
          <View style={styles.promocaoBannerContent}>
            <Icon name="local-offer" size={tamanhos.iconMd} color="#FFFFFF" />
            <View style={styles.promocaoBannerText}>
              <Text style={styles.promocaoBannerTitle}>
                🎉 Promoção Aplicada!
              </Text>
              <Text style={styles.promocaoBannerSubtitle}>
                Você ganhou {descontoPromocao.percentual}% de desconto por comprar com {descontoPromocao.diasAntecedencia} dias de antecedência
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Resumo da Passagem */}
      <View style={styles.resumoCard}>
        <Text style={styles.resumoTitle}>Resumo da Viagem</Text>
        <View style={styles.resumoRow}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Origem</Text>
            <Text style={styles.resumoValue} numberOfLines={2}>{passagem.origem.nome}, {passagem.origem.estado}</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Destino</Text>
            <Text style={styles.resumoValue} numberOfLines={2}>{passagem.destino.nome}, {passagem.destino.estado}</Text>
          </View>
        </View>
        <View style={styles.resumoRow}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Data e Hora</Text>
            <Text style={styles.resumoValue}>
              {format(new Date(passagem.dataPartida), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
            </Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Poltronas</Text>
            <Text style={styles.resumoValue}>{poltronas.join(', ')}</Text>
          </View>
        </View>
        {(() => {
          if (!passagem) return null;
          const valorAdicional = poltronas.reduce((total, numero) => {
            const poltrona = passagem.poltronas?.find((p) => p.numero === numero);
            return total + (poltrona?.precoAdicional || 0);
          }, 0);
          
          if (valorAdicional > 0) {
            return (
              <View style={styles.resumoRow}>
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoLabel} numberOfLines={1}>Poltronas preferenciais</Text>
                  <Text style={styles.resumoValue} numberOfLines={1}>{formatarPreco(valorAdicional)}</Text>
                </View>
              </View>
            );
          }
          return null;
        })()}
        {descontoPromocao.temDesconto && (
          <View style={styles.resumoRow}>
            <View style={styles.resumoItem}>
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
        <View style={styles.resumoTotal}>
          <Text style={styles.resumoTotalLabel} numberOfLines={1}>Total</Text>
          <Text style={styles.resumoTotalValue} numberOfLines={1}>
            {formatarPreco(valorTotalComDesconto)}
          </Text>
        </View>
        {descontoPromocao.temDesconto && (
          <Text style={[styles.resumoLabel, { fontSize: tamanhos.xs, marginTop: tamanhos.spacingXs, color: cores.textSecondary, textAlign: 'center' }]}>
            Valor original: {formatarPreco(valorTotal)}
          </Text>
        )}
      </View>

      {/* Dados dos Passageiros */}
      <View style={styles.secaoCard}>
        <Text style={styles.secaoTitle}>Dados dos Passageiros</Text>
        {passageiros.map((passageiro, index) => (
          <View key={index} style={styles.passageiroCard}>
            <Text style={styles.passageiroTitle}>Passageiro {index + 1} - Poltrona {poltronas[index]}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor={cores.textSecondary}
              value={passageiro.nome}
              onChangeText={(text) => atualizarPassageiro(index, 'nome', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="CPF"
              placeholderTextColor={cores.textSecondary}
              value={passageiro.cpf}
              onChangeText={(text) => atualizarPassageiro(index, 'cpf', text)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={cores.textSecondary}
              value={passageiro.email}
              onChangeText={(text) => atualizarPassageiro(index, 'email', text)}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              placeholderTextColor={cores.textSecondary}
              value={passageiro.telefone}
              onChangeText={(text) => atualizarPassageiro(index, 'telefone', text)}
              keyboardType="phone-pad"
            />
          </View>
        ))}
      </View>

      {/* Forma de Pagamento */}
      <View style={styles.secaoCard}>
        <Text style={styles.secaoTitle}>Forma de Pagamento</Text>
        <View style={styles.metodosContainer}>
          <Pressable
            style={[
              styles.metodoButton,
              metodoPagamento === MetodoPagamento.CARTAO_CREDITO && styles.metodoButtonActive
            ]}
            onPress={() => setMetodoPagamento(MetodoPagamento.CARTAO_CREDITO)}
          >
            <Icon name="credit-card" size={tamanhos.iconMd} color={metodoPagamento === MetodoPagamento.CARTAO_CREDITO ? cores.primary : cores.textSecondary} />
            <Text style={[
              styles.metodoText,
              metodoPagamento === MetodoPagamento.CARTAO_CREDITO && styles.metodoTextActive
            ]}>
              Cartão de Crédito
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.metodoButton,
              metodoPagamento === MetodoPagamento.CARTAO_DEBITO && styles.metodoButtonActive
            ]}
            onPress={() => setMetodoPagamento(MetodoPagamento.CARTAO_DEBITO)}
          >
            <Icon name="credit-card" size={tamanhos.iconMd} color={metodoPagamento === MetodoPagamento.CARTAO_DEBITO ? cores.primary : cores.textSecondary} />
            <Text style={[
              styles.metodoText,
              metodoPagamento === MetodoPagamento.CARTAO_DEBITO && styles.metodoTextActive
            ]}>
              Cartão de Débito
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.metodoButton,
              metodoPagamento === MetodoPagamento.PIX && styles.metodoButtonActive
            ]}
            onPress={() => setMetodoPagamento(MetodoPagamento.PIX)}
          >
            <Icon name="qr-code" size={tamanhos.iconMd} color={metodoPagamento === MetodoPagamento.PIX ? cores.primary : cores.textSecondary} />
            <Text style={[
              styles.metodoText,
              metodoPagamento === MetodoPagamento.PIX && styles.metodoTextActive
            ]}>
              PIX
            </Text>
          </Pressable>
        </View>

        {(metodoPagamento === MetodoPagamento.CARTAO_CREDITO || metodoPagamento === MetodoPagamento.CARTAO_DEBITO) && (
          <View style={styles.dadosPagamentoContainer}>
            <TextInput
              style={styles.input}
              placeholder="Número do Cartão"
              placeholderTextColor={cores.textSecondary}
              value={numeroCartao}
              onChangeText={setNumeroCartao}
              keyboardType="numeric"
              maxLength={16}
            />
            <TextInput
              style={styles.input}
              placeholder="Nome do Titular"
              placeholderTextColor={cores.textSecondary}
              value={nomeTitular}
              onChangeText={setNomeTitular}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Validade (MM/AA)"
                placeholderTextColor={cores.textSecondary}
                value={validade}
                onChangeText={setValidade}
                maxLength={5}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="CVV"
                placeholderTextColor={cores.textSecondary}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="CPF do Titular"
              placeholderTextColor={cores.textSecondary}
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
            />
          </View>
        )}

        {metodoPagamento === MetodoPagamento.PIX && (
          <View style={styles.pixContainer}>
            <Icon name="qr-code" size={tamanhos.icon2xl} color={cores.primary} />
            <Text style={styles.pixText}>
              O código PIX será gerado após a confirmação da compra
            </Text>
          </View>
        )}
      </View>

      {/* Botão Finalizar */}
      <Pressable
        style={[styles.finalizarButton, processando && styles.finalizarButtonDisabled]}
        onPress={handleFinalizarCompra}
        disabled={processando}
      >
        {processando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Icon name="lock" size={tamanhos.iconSm} color="#FFFFFF" />
            <Text style={styles.finalizarButtonText}>
              Finalizar Compra - {formatarPreco(valorTotalComDesconto)}
            </Text>
          </>
        )}
      </Pressable>

      {/* Modal PIX QR Code */}
      <Modal
        visible={showModalPix}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModalPix(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalPixContainer}>
            <Text style={styles.modalPixTitle}>Escaneie o QR Code PIX</Text>
            <Text style={styles.modalPixSubtitle}>Valor: {formatarPreco(valorTotalComDesconto)}</Text>
            {qrCodePix ? (
              <View style={styles.qrCodeContainer}>
                <Image 
                  source={{ uri: qrCodePix }} 
                  style={styles.qrCodeImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <ActivityIndicator size="large" color={cores.primary} style={{ marginVertical: 40 }} />
            )}
            <Text style={styles.modalPixText}>
              Processando pagamento...
            </Text>
          </View>
        </View>
      </Modal>
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
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: cores.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: tamanhos.md,
      color: cores.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: cores.background,
    },
    emptyText: {
      marginTop: 16,
      fontSize: tamanhos.lg,
      fontWeight: '600',
      color: cores.text,
      textAlign: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      backgroundColor: cores.header,
      borderBottomWidth: 1,
      borderBottomColor: cores.border,
    },
    headerTitle: {
      fontSize: tamanhos.xl,
      fontWeight: '700',
      color: cores.text,
    },
    resumoCard: {
      backgroundColor: cores.backgroundCard,
      margin: 20,
      marginTop: 16,
      borderRadius: 12,
      padding: 20,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    resumoTitle: {
      fontSize: tamanhos.lg,
      fontWeight: '700',
      color: cores.text,
      marginBottom: 16,
    },
    resumoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      flexWrap: 'wrap',
    },
    resumoItem: {
      flex: 1,
      minWidth: 0,
      marginRight: 8,
    },
    resumoLabel: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
      marginBottom: 4,
      flexShrink: 1,
    },
    resumoValue: {
      fontSize: tamanhos.sm,
      fontWeight: '600',
      color: cores.text,
      flexShrink: 1,
      minWidth: 0,
      flexWrap: 'wrap',
    },
    resumoTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 2,
      borderTopColor: cores.primary,
      flexWrap: 'wrap',
    },
    resumoTotalLabel: {
      fontSize: tamanhos.lg,
      fontWeight: '700',
      color: cores.text,
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
      marginRight: 8,
    },
    resumoTotalValue: {
      fontSize: tamanhos.xl,
      fontWeight: '700',
      color: cores.primary,
      flexShrink: 0,
      textAlign: 'right',
    },
    secaoCard: {
      backgroundColor: cores.backgroundCard,
      margin: 20,
      marginTop: 0,
      borderRadius: 12,
      padding: 20,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    secaoTitle: {
      fontSize: tamanhos.lg,
      fontWeight: '700',
      color: cores.text,
      marginBottom: 16,
    },
    passageiroCard: {
      marginBottom: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: cores.border,
    },
    passageiroTitle: {
      fontSize: tamanhos.md,
      fontWeight: '600',
      color: cores.text,
      marginBottom: 12,
    },
    input: {
      backgroundColor: cores.background,
      borderRadius: 8,
      padding: 12,
      fontSize: tamanhos.md,
      color: cores.text,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: cores.border,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    inputHalf: {
      flex: 1,
    },
    metodosContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    metodoButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: cores.border,
      backgroundColor: cores.background,
    },
    metodoButtonActive: {
      borderColor: cores.primary,
      backgroundColor: cores.primaryLight,
    },
    metodoText: {
      fontSize: tamanhos.xs,
      fontWeight: '600',
      color: cores.textSecondary,
    },
    metodoTextActive: {
      color: cores.primary,
    },
    dadosPagamentoContainer: {
      marginTop: 12,
    },
    pixContainer: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: cores.successLight,
      borderRadius: 8,
      marginTop: 12,
    },
    pixText: {
      marginTop: 12,
      fontSize: tamanhos.sm,
      color: cores.success,
      textAlign: 'center',
    },
    finalizarButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: cores.primary,
      margin: 20,
      marginTop: 0,
      borderRadius: 12,
      paddingVertical: 16,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    finalizarButtonDisabled: {
      backgroundColor: cores.textTertiary,
      opacity: 0.6,
    },
    finalizarButtonText: {
      color: '#FFFFFF',
      fontSize: tamanhos.lg,
      fontWeight: '700',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalPixContainer: {
      backgroundColor: cores.backgroundCard,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      width: '90%',
      maxWidth: 400,
    },
    modalPixTitle: {
      fontSize: tamanhos['2xl'],
      fontWeight: '700',
      color: cores.text,
      marginBottom: 8,
    },
    modalPixSubtitle: {
      fontSize: tamanhos.lg,
      fontWeight: '600',
      color: cores.primary,
      marginBottom: 24,
    },
    qrCodeContainer: {
      backgroundColor: cores.background,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: cores.border,
      marginVertical: 20,
    },
    qrCodeImage: {
      width: 250,
      height: 250,
    },
    modalPixText: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
    promocaoBanner: {
      backgroundColor: cores.success,
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 12,
      padding: 16,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    promocaoBannerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    promocaoBannerText: {
      flex: 1,
    },
    promocaoBannerTitle: {
      fontSize: tamanhos.md,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    promocaoBannerSubtitle: {
      fontSize: 13,
      color: '#FFFFFF',
      opacity: 0.95,
      lineHeight: 18,
    },
  });
}

