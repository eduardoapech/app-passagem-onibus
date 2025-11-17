import { getDatabase } from './index';
import { BuscaPassagem, Passagem, PassagemResumo, Cidade, Poltrona, Servico, Companhia, TipoAssento } from '@/src/interfaces/passagem';
// Removido import de calcularDistancia e calcularTempoViagem - agora são importados dinamicamente quando necessário
import {
  calcularPrecoBase,
  calcularPrecosVariados,
  gerarHorariosVariados,
  calcularHorarioChegada,
  formatarDuracao,
  determinarTipoAssentoPorDistancia,
  calcularAssentosDisponiveis,
} from '@/src/utils/calcularPrecoPassagem';

export const PassagemDatabaseService = {
  async buscarPassagens(busca: BuscaPassagem): Promise<PassagemResumo[]> {
    const db = getDatabase();
    
    if (!busca.origem || !busca.destino || !busca.dataIda) {
      return [];
    }

    // Buscar passagens de ida no banco
    const dataIdaStr = busca.dataIda.toISOString().split('T')[0];
    
    const passagens = await db.getAllAsync<{
      id: string;
      companhiaId: string;
      origemId: string;
      destinoId: string;
      dataPartida: string;
      horarioPartida: string;
      horarioChegada: string;
      duracao: string;
      preco: number;
      assentosDisponiveis: number;
      tipoAssento: string;
    }>(
      `SELECT p.* FROM passagens p 
       WHERE p.origemId = ? AND p.destinoId = ? 
       AND DATE(p.dataPartida) = ?`,
      [busca.origem.id, busca.destino.id, dataIdaStr]
    );

    // Se não houver passagens no banco, gerar e salvar passagens mock
    if (passagens.length === 0) {
      const passagensMock = await this.gerarPassagensMock(busca);
      // Salvar passagens mock no banco
      await this.salvarPassagensMockNoBanco(passagensMock, busca);
      // Retornar passagens mock com IDs atualizados
      return passagensMock.map(p => ({
        ...p,
        id: `${p.id}-${busca.origem?.id || '1'}-${busca.destino?.id || '2'}-${dataIdaStr}`,
      }));
    }

    // Buscar informações das companhias
    const resultados: PassagemResumo[] = [];
    for (const passagem of passagens) {
      const companhia = await db.getFirstAsync<{ nome: string; urlSite: string | null }>(
        'SELECT nome, urlSite FROM companhias WHERE id = ?',
        [passagem.companhiaId]
      );

      if (companhia) {
        resultados.push({
          id: passagem.id,
          companhia: companhia.nome,
          companhiaId: passagem.companhiaId,
          companhiaUrlSite: companhia.urlSite || undefined,
          horarioPartida: passagem.horarioPartida,
          horarioChegada: passagem.horarioChegada,
          duracao: passagem.duracao,
          preco: passagem.preco,
          tipoAssento: passagem.tipoAssento as any,
          assentosDisponiveis: passagem.assentosDisponiveis,
        });
      }
    }

    // Se for ida e volta, também buscar passagens de volta
    if (busca.tipoViagem === 'IDA_VOLTA' && busca.dataVolta) {
      const dataVoltaStr = busca.dataVolta.toISOString().split('T')[0];
      
      // Buscar passagens de volta (destino -> origem na data de volta)
      const passagensVolta = await db.getAllAsync<{
        id: string;
        companhiaId: string;
        origemId: string;
        destinoId: string;
        dataPartida: string;
        horarioPartida: string;
        horarioChegada: string;
        duracao: string;
        preco: number;
        assentosDisponiveis: number;
        tipoAssento: string;
      }>(
        `SELECT p.* FROM passagens p 
         WHERE p.origemId = ? AND p.destinoId = ? 
         AND DATE(p.dataPartida) = ?`,
        [busca.destino.id, busca.origem.id, dataVoltaStr]
      );

      // Se não houver passagens de volta no banco, gerar e salvar
      if (passagensVolta.length === 0) {
        // Criar busca para volta (cidades invertidas)
        const buscaVolta: BuscaPassagem = {
          origem: busca.destino,
          destino: busca.origem,
          dataIda: busca.dataVolta,
          dataVolta: null,
          tipoViagem: 'IDA',
          passageiros: busca.passageiros,
        };
        const passagensMockVolta = await this.gerarPassagensMock(buscaVolta);
        await this.salvarPassagensMockNoBanco(passagensMockVolta, buscaVolta);
        
        // Adicionar passagens de volta aos resultados
        for (const passagemMock of passagensMockVolta) {
          const passagemIdVolta = `${passagemMock.id}-${busca.destino?.id || '2'}-${busca.origem?.id || '1'}-${dataVoltaStr}`;
          resultados.push({
            ...passagemMock,
            id: passagemIdVolta,
          });
        }
      } else {
        // Adicionar passagens de volta encontradas
        for (const passagemVolta of passagensVolta) {
          const companhia = await db.getFirstAsync<{ nome: string; urlSite: string | null }>(
            'SELECT nome, urlSite FROM companhias WHERE id = ?',
            [passagemVolta.companhiaId]
          );

          if (companhia) {
            resultados.push({
              id: passagemVolta.id,
              companhia: companhia.nome,
              companhiaId: passagemVolta.companhiaId,
              companhiaUrlSite: companhia.urlSite || undefined,
              horarioPartida: passagemVolta.horarioPartida,
              horarioChegada: passagemVolta.horarioChegada,
              duracao: passagemVolta.duracao,
              preco: passagemVolta.preco,
              tipoAssento: passagemVolta.tipoAssento as any,
              assentosDisponiveis: passagemVolta.assentosDisponiveis,
            });
          }
        }
      }
    }

    return resultados;
  },

  async obterDetalhes(
    passagemId: string,
    origem?: Cidade | null,
    destino?: Cidade | null,
    passagemResumo?: Partial<PassagemResumo>
  ): Promise<Passagem> {
    const db = getDatabase();
    
    const passagem = await db.getFirstAsync<{
      id: string;
      companhiaId: string;
      origemId: string;
      destinoId: string;
      dataPartida: string;
      dataChegada: string;
      horarioPartida: string;
      horarioChegada: string;
      duracao: string;
      preco: number;
      assentosDisponiveis: number;
      tipoAssento: string;
      tipoOnibus: string;
    }>('SELECT * FROM passagens WHERE id = ?', [passagemId]);

    if (!passagem) {
      // Gerar passagem mock se não existir
      return await this.gerarPassagemMock(passagemId, origem, destino, passagemResumo);
    }

    // Buscar companhia
    const companhia = await db.getFirstAsync<Companhia>(
      'SELECT * FROM companhias WHERE id = ?',
      [passagem.companhiaId]
    ) || {
      id: passagem.companhiaId,
      nome: 'Cometa',
      logo: '',
      avaliacao: 4.5,
      totalAvaliacoes: 1200,
    };

    // Buscar cidades - priorizar parâmetros passados, depois buscar no banco
    let cidadeOrigem: Cidade;
    if (origem) {
      cidadeOrigem = origem;
    } else {
      const cidadeOrigemBanco = await db.getFirstAsync<Cidade>(
        'SELECT * FROM cidades WHERE id = ?',
        [passagem.origemId]
      );
      if (cidadeOrigemBanco) {
        cidadeOrigem = cidadeOrigemBanco;
      } else {
        // Se não encontrou no banco, tentar buscar por nome ou usar ID como fallback
        // Buscar todas as cidades e tentar encontrar uma que corresponda ao ID
        const todasCidades = await db.getAllAsync<Cidade>('SELECT * FROM cidades');
        const cidadeEncontrada = todasCidades.find(c => c.id === passagem.origemId);
        if (cidadeEncontrada) {
          cidadeOrigem = cidadeEncontrada;
        } else {
          // Se ainda não encontrou, criar uma cidade básica com o ID
          // Mas não usar valores hardcoded - usar informações do ID se possível
          console.warn(`Cidade origem não encontrada no banco para ID: ${passagem.origemId}`);
          cidadeOrigem = {
            id: passagem.origemId,
            nome: `Cidade ${passagem.origemId}`, // Nome genérico ao invés de hardcoded
            estado: 'N/A',
            sigla: 'N/A',
            terminal: null,
          };
        }
      }
    }

    let cidadeDestino: Cidade;
    if (destino) {
      cidadeDestino = destino;
    } else {
      const cidadeDestinoBanco = await db.getFirstAsync<Cidade>(
        'SELECT * FROM cidades WHERE id = ?',
        [passagem.destinoId]
      );
      if (cidadeDestinoBanco) {
        cidadeDestino = cidadeDestinoBanco;
      } else {
        // Se não encontrou no banco, tentar buscar por nome ou usar ID como fallback
        const todasCidades = await db.getAllAsync<Cidade>('SELECT * FROM cidades');
        const cidadeEncontrada = todasCidades.find(c => c.id === passagem.destinoId);
        if (cidadeEncontrada) {
          cidadeDestino = cidadeEncontrada;
        } else {
          console.warn(`Cidade destino não encontrada no banco para ID: ${passagem.destinoId}`);
          cidadeDestino = {
            id: passagem.destinoId,
            nome: `Cidade ${passagem.destinoId}`, // Nome genérico ao invés de hardcoded
            estado: 'N/A',
            sigla: 'N/A',
            terminal: null,
          };
        }
      }
    }

    // Limpar duplicatas no banco de dados (manter apenas a primeira ocorrência de cada número)
    try {
      await db.runAsync(`
        DELETE FROM poltronas 
        WHERE passagemId = ? 
        AND rowid NOT IN (
          SELECT MIN(rowid) 
          FROM poltronas 
          WHERE passagemId = ? 
          GROUP BY numero
        )
      `, [passagemId, passagemId]);
    } catch (error: any) {
      console.warn('Erro ao limpar duplicatas de poltronas:', error.message);
    }

    // Buscar poltronas (usar DISTINCT para evitar duplicatas)
    const poltronasData = await db.getAllAsync<{
      numero: number;
      disponivel: number;
      tipo: string;
      janela: number;
      preferencial: number;
      precoAdicional: number;
    }>(
      'SELECT DISTINCT numero, disponivel, tipo, janela, preferencial, precoAdicional FROM poltronas WHERE passagemId = ? ORDER BY numero',
      [passagemId]
    );

    // Determinar número total de poltronas (normalmente 40-45)
    const totalPoltronas = Math.max(passagem.assentosDisponiveis + 5, 40);

    // Se não houver poltronas ou não houver todas, criar todas as poltronas
    let poltronas: Poltrona[] = [];
    if (poltronasData.length === 0 || poltronasData.length < totalPoltronas) {
      // Criar todas as poltronas
      console.log(`Criando ${totalPoltronas} poltronas para passagem ${passagemId}`);
      poltronas = Array.from({ length: totalPoltronas }, (_, i) => {
        const numero = i + 1;
        // Verificar se já existe no banco
        const existente = poltronasData.find(p => p.numero === numero);
        if (existente) {
          return {
            numero: existente.numero,
            disponivel: existente.disponivel === 1,
            tipo: existente.tipo as any,
            janela: existente.janela === 1,
            preferencial: existente.preferencial === 1,
            precoAdicional: existente.precoAdicional || 0,
          };
        }
        // Criar nova poltrona
        // Poltronas disponíveis são as primeiras até assentosDisponiveis
        const disponivel = numero <= passagem.assentosDisponiveis;
        return {
          numero,
          disponivel,
          tipo: passagem.tipoAssento as any,
          janela: numero % 2 === 0,
          preferencial: numero <= 4,
          precoAdicional: numero <= 4 ? 10 : 0,
        };
      });
      
      // Remover duplicatas antes de salvar (garantir que cada número aparece apenas uma vez)
      const poltronasUnicas = new Map<number, Poltrona>();
      for (const poltrona of poltronas) {
        if (!poltronasUnicas.has(poltrona.numero)) {
          poltronasUnicas.set(poltrona.numero, poltrona);
        }
      }
      poltronas = Array.from(poltronasUnicas.values()).sort((a, b) => a.numero - b.numero);
      
      // Salvar poltronas no banco
      try {
        for (const poltrona of poltronas) {
          // Verificar se já existe
          const existe = await db.getFirstAsync<{ numero: number }>(
            'SELECT numero FROM poltronas WHERE passagemId = ? AND numero = ?',
            [passagemId, poltrona.numero]
          );
          
          if (!existe) {
            await db.runAsync(
              `INSERT INTO poltronas (passagemId, numero, disponivel, tipo, janela, preferencial, precoAdicional)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                passagemId,
                poltrona.numero,
                poltrona.disponivel ? 1 : 0,
                poltrona.tipo,
                poltrona.janela ? 1 : 0,
                poltrona.preferencial ? 1 : 0,
                poltrona.precoAdicional || 0,
              ]
            );
          }
        }
        console.log(`Poltronas criadas e salvas no banco para passagem ${passagemId}`);
      } catch (error: any) {
        console.warn('Erro ao salvar poltronas no banco:', error.message);
      }
    } else {
      // Usar poltronas existentes (remover duplicatas por número)
      const poltronasMap = new Map<number, Poltrona>();
      for (const p of poltronasData) {
        // Se já existe uma poltrona com esse número, manter a primeira (ou a mais recente)
        if (!poltronasMap.has(p.numero)) {
          poltronasMap.set(p.numero, {
            numero: p.numero,
            disponivel: p.disponivel === 1,
            tipo: p.tipo as any,
            janela: p.janela === 1,
            preferencial: p.preferencial === 1,
            precoAdicional: p.precoAdicional || 0,
          });
        }
      }
      poltronas = Array.from(poltronasMap.values()).sort((a, b) => a.numero - b.numero);
    }

    // Garantir que não há duplicatas finais (última verificação de segurança)
    const poltronasFinais = new Map<number, Poltrona>();
    for (const poltrona of poltronas) {
      if (!poltronasFinais.has(poltrona.numero)) {
        poltronasFinais.set(poltrona.numero, poltrona);
      }
    }
    poltronas = Array.from(poltronasFinais.values()).sort((a, b) => a.numero - b.numero);

    // Buscar serviços
    const servicosData = await db.getAllAsync<Servico>(
      'SELECT id, nome, icone, disponivel FROM servicos WHERE passagemId = ?',
      [passagemId]
    );

    const servicos: Servico[] = servicosData.length > 0
      ? servicosData
      : [
          { id: '1', nome: 'Wi-Fi', icone: 'wifi', disponivel: true },
          { id: '2', nome: 'Ar Condicionado', icone: 'ac-unit', disponivel: true },
          { id: '3', nome: 'Tomada', icone: 'power', disponivel: true },
          { id: '4', nome: 'Banheiro', icone: 'wc', disponivel: true },
        ];

    return {
      id: passagem.id,
      companhia,
      origem: cidadeOrigem,
      destino: cidadeDestino,
      dataPartida: new Date(passagem.dataPartida),
      dataChegada: new Date(passagem.dataChegada),
      horarioPartida: passagem.horarioPartida,
      horarioChegada: passagem.horarioChegada,
      duracao: passagem.duracao,
      preco: passagem.preco,
      assentosDisponiveis: passagem.assentosDisponiveis,
      tipoAssento: passagem.tipoAssento as any,
      tipoOnibus: passagem.tipoOnibus as any,
      poltronas,
      servicos,
    };
  },

  async obterCidades(): Promise<Cidade[]> {
    const db = getDatabase();
    const cidades = await db.getAllAsync<Cidade>('SELECT * FROM cidades ORDER BY nome');
    return cidades;
  },

  async buscarCidades(termo: string): Promise<Cidade[]> {
    const db = getDatabase();
    const cidades = await db.getAllAsync<Cidade>(
      'SELECT * FROM cidades WHERE nome LIKE ? OR estado LIKE ? OR sigla LIKE ? ORDER BY nome LIMIT 20',
      [`%${termo}%`, `%${termo}%`, `%${termo}%`]
    );
    return cidades;
  },

  async salvarPassagensMockNoBanco(passagensMock: PassagemResumo[], busca: BuscaPassagem): Promise<void> {
    const db = getDatabase();
    
    try {
      const dataIda = busca.dataIda;
      const dataIdaStr = dataIda.toISOString().split('T')[0];
      
      for (const passagemMock of passagensMock) {
        // Gerar ID único baseado na data e origem/destino
        const passagemId = `${passagemMock.id}-${busca.origem?.id || '1'}-${busca.destino?.id || '2'}-${dataIdaStr}`;
        
        // Verificar se já existe
        const existe = await db.getFirstAsync<{ id: string }>(
          'SELECT id FROM passagens WHERE id = ?',
          [passagemId]
        );
        
        if (!existe) {
          // Calcular data de chegada (adicionar duração)
          const horasDuracao = parseInt(passagemMock.duracao.match(/\d+/)?.[0] || '6');
          const minutosDuracao = parseInt(passagemMock.duracao.match(/:(\d+)/)?.[1] || '0');
          const dataChegada = new Date(dataIda);
          dataChegada.setHours(dataIda.getHours() + horasDuracao);
          dataChegada.setMinutes(dataIda.getMinutes() + minutosDuracao);
          
          // Salvar passagem
          await db.runAsync(
            `INSERT OR IGNORE INTO passagens (
              id, companhiaId, origemId, destinoId, dataPartida, dataChegada,
              horarioPartida, horarioChegada, duracao, preco, assentosDisponiveis,
              tipoAssento, tipoOnibus
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              passagemId,
              passagemMock.companhiaId || '1',
              busca.origem?.id || '1',
              busca.destino?.id || '2',
              dataIda.toISOString(),
              dataChegada.toISOString(),
              passagemMock.horarioPartida,
              passagemMock.horarioChegada,
              passagemMock.duracao,
              passagemMock.preco,
              passagemMock.assentosDisponiveis || 40,
              passagemMock.tipoAssento || 'CONVENCIONAL',
              'EXECUTIVO',
            ]
          );
          
          // Criar todas as poltronas para esta passagem (40-45 poltronas)
          const totalPoltronas = Math.max(passagemMock.assentosDisponiveis || 40, 40);
          for (let i = 1; i <= totalPoltronas; i++) {
            await db.runAsync(
              `INSERT OR IGNORE INTO poltronas (passagemId, numero, disponivel, tipo, janela, preferencial, precoAdicional)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                passagemId,
                i,
                i <= (passagemMock.assentosDisponiveis || 40) ? 1 : 0,
                passagemMock.tipoAssento || 'CONVENCIONAL',
                i % 2 === 0 ? 1 : 0,
                i <= 4 ? 1 : 0,
                i <= 4 ? 10 : 0,
              ]
            );
          }
          
          console.log(`✅ Passagem mock ${passagemId} salva no banco com ${totalPoltronas} poltronas`);
        }
      }
    } catch (error: any) {
      console.warn('Erro ao salvar passagens mock no banco:', error.message);
    }
  },

  async gerarPassagensMock(busca: BuscaPassagem): Promise<PassagemResumo[]> {
    // Enriquecer cidades com coordenadas se necessário
    let origem = busca.origem;
    let destino = busca.destino;

    if (origem && (!origem.latitude || !origem.longitude)) {
      try {
        const { GeocodificacaoService } = await import('@/src/services/api/geocodificacao');
        origem = await GeocodificacaoService.enriquecerCidadeComCoordenadas(origem);
      } catch (error) {
        console.warn('Erro ao obter coordenadas da origem:', error);
      }
    }

    if (destino && (!destino.latitude || !destino.longitude)) {
      try {
        const { GeocodificacaoService } = await import('@/src/services/api/geocodificacao');
        destino = await GeocodificacaoService.enriquecerCidadeComCoordenadas(destino);
      } catch (error) {
        console.warn('Erro ao obter coordenadas do destino:', error);
      }
    }

    // Calcular distância e tempo usando API de rotas (assíncrono)
    let distanciaKm = 0;
    let tempo = { horas: 0, minutos: 0, totalMinutos: 0 };
    
    if (origem?.latitude && origem?.longitude && 
        destino?.latitude && destino?.longitude) {
      try {
        // Tentar usar API de rotas para obter distância e tempo precisos
        const { RotaService } = await import('@/src/services/api/rotas');
        const rota = await RotaService.calcularRotaPorCoordenadas(
          origem.latitude,
          origem.longitude,
          destino.latitude,
          destino.longitude
        );
        
        distanciaKm = rota.distanciaKm;
        tempo = {
          horas: rota.tempoHoras,
          minutos: rota.tempoMinutos,
          totalMinutos: rota.tempoTotalMinutos,
        };
      } catch (error) {
        console.warn('Erro ao calcular rota com API, usando Haversine:', error);
        // Fallback: usar Haversine
        const { calcularDistanciaHaversine, calcularTempoViagemPorDistancia } = await import('@/src/services/calculadoraDistancia');
        
        // Calcular distância em linha reta
        const distanciaHaversine = calcularDistanciaHaversine(
          origem.latitude,
          origem.longitude,
          destino.latitude,
          destino.longitude
        );
        
        // Ajustar para distância rodoviária (fator varia conforme distância)
        let fatorDistancia = 1.25; // Padrão: 25% a mais
        if (distanciaHaversine < 50) {
          fatorDistancia = 1.35; // Rotas curtas: 35% a mais
        } else if (distanciaHaversine < 100) {
          fatorDistancia = 1.30; // Rotas médias: 30% a mais
        } else if (distanciaHaversine > 500) {
          fatorDistancia = 1.20; // Rotas longas: 20% a mais
        }
        
        distanciaKm = distanciaHaversine * fatorDistancia;
        tempo = calcularTempoViagemPorDistancia(distanciaKm);
      }
    }

    // Se não tiver coordenadas, usar distância estimada baseada em estados
    if (distanciaKm === 0 || isNaN(distanciaKm)) {
      // Distância estimada baseada em estados (em km) - já são distâncias rodoviárias
      const distanciaEstimada: { [key: string]: number } = {
        'SP-SP': 200,
        'RJ-RJ': 150,
        'MG-MG': 250,
        'RS-RS': 180,
        'PR-PR': 200,
        'SC-SC': 150,
        'SP-RJ': 450,
        'RJ-SP': 450,
        'SP-MG': 600,
        'MG-SP': 600,
        'SP-PR': 400,
        'PR-SP': 400,
      };
      const chaveDistancia = `${busca.origem?.sigla || 'SP'}-${busca.destino?.sigla || 'RJ'}`;
      distanciaKm = distanciaEstimada[chaveDistancia] || 500;
      
      // Calcular tempo baseado na distância estimada
      const { calcularTempoViagemPorDistancia } = await import('@/src/services/calculadoraDistancia');
      tempo = calcularTempoViagemPorDistancia(distanciaKm);
    }

    const duracao = formatarDuracao(tempo.horas, tempo.minutos);

    // Determinar tipo de assento baseado na distância
    const tipoAssento = determinarTipoAssentoPorDistancia(distanciaKm);

    // Calcular preço base
    const precoBase = calcularPrecoBase(distanciaKm, tipoAssento);

    // Gerar preços variados para diferentes companhias
    const precos = calcularPrecosVariados(precoBase, 20);

    // Gerar horários variados
    const horariosPartida = gerarHorariosVariados('06:00', 5);

    // Lista de companhias brasileiras principais
    const companhias = [
      { id: '1', nome: 'Cometa', urlSite: 'https://www.viacaocometa.com.br' },
      { id: '2', nome: 'Gontijo', urlSite: 'https://www.gontijo.com.br' },
      { id: '3', nome: 'Itapemirim', urlSite: 'https://www.itapemirim.com.br' },
      { id: '4', nome: 'Kaissara', urlSite: 'https://www.kaissara.com.br' },
      { id: '5', nome: 'Planalto', urlSite: 'https://www.planalto.com.br' },
      { id: '6', nome: 'Rapido Federal', urlSite: 'https://www.rapidofederal.com.br' },
      { id: '16', nome: 'Eucatur', urlSite: 'https://www.eucatur.com.br' },
      { id: '17', nome: 'Ouro e Prata', urlSite: 'https://www.ouroeprata.com.br' },
      { id: '18', nome: 'Unesul', urlSite: 'https://www.unesul.com.br' },
    ];

    // Gerar passagens para as primeiras 4-5 companhias
    const passagens: PassagemResumo[] = [];
    const quantidadePassagens = Math.min(companhias.length, 5);

    for (let i = 0; i < quantidadePassagens; i++) {
      const companhia = companhias[i];
      const horarioPartida = horariosPartida[i] || '08:00';
      const horarioChegada = calcularHorarioChegada(horarioPartida, tempo.horas, tempo.minutos);
      const preco = precos[i] || precoBase;
      const assentosDisponiveis = calcularAssentosDisponiveis(distanciaKm, tipoAssento);

      // Variação de tipo de assento (algumas companhias oferecem tipos diferentes)
      const tiposAssentoVariados: TipoAssento[] = [
        tipoAssento,
        tipoAssento,
        distanciaKm > 200 ? TipoAssento.SEMI_LEITO : tipoAssento,
        distanciaKm > 400 ? TipoAssento.LEITO : tipoAssento,
        distanciaKm > 600 ? TipoAssento.EXECUTIVO : tipoAssento,
      ];
      const tipoAssentoVariado = tiposAssentoVariados[i] || tipoAssento;

      passagens.push({
        id: `passagem-${companhia.id}-${i + 1}-${Date.now()}`,
        companhia: companhia.nome,
        companhiaId: companhia.id,
        companhiaUrlSite: companhia.urlSite,
        horarioPartida,
        horarioChegada,
        duracao,
        preco: Math.round(preco * 100) / 100,
        tipoAssento: tipoAssentoVariado,
        assentosDisponiveis,
      });
    }

    return passagens;
  },

  async gerarPassagemMock(
    id: string,
    origem?: Cidade | null,
    destino?: Cidade | null,
    passagemResumo?: Partial<PassagemResumo>
  ): Promise<Passagem> {
    const cidadeOrigem: Cidade = origem || {
      id: '1',
      nome: 'São Paulo',
      estado: 'SP',
      sigla: 'SP',
      terminal: 'Terminal Tietê',
    };

    const cidadeDestino: Cidade = destino || {
      id: '2',
      nome: 'Rio de Janeiro',
      estado: 'RJ',
      sigla: 'RJ',
      terminal: 'Rodoviária Novo Rio',
    };

    let nomeCompanhia = 'Cometa';
    let companhiaId = '1';
    let avaliacao = 4.5;
    
    if (passagemResumo?.companhia) {
      nomeCompanhia = passagemResumo.companhia;
      companhiaId = String(passagemResumo.companhiaId || '1');
    }

    const companhiaMap: { [key: string]: { nome: string; id: string; avaliacao: number } } = {
      '1': { nome: 'Cometa', id: '1', avaliacao: 4.5 },
      '2': { nome: 'Gontijo', id: '2', avaliacao: 4.3 },
      '3': { nome: 'Itapemirim', id: '3', avaliacao: 4.6 },
      '4': { nome: 'Kaissara', id: '4', avaliacao: 4.4 },
      '16': { nome: 'Eucatur', id: '16', avaliacao: 4.2 },
      '17': { nome: 'Ouro e Prata', id: '17', avaliacao: 4.1 },
      '18': { nome: 'Unesul', id: '18', avaliacao: 4.0 },
    };
    
    const companhiaInfo = companhiaMap[companhiaId] || companhiaMap['1'];
    nomeCompanhia = companhiaInfo.nome;
    companhiaId = companhiaInfo.id;
    avaliacao = companhiaInfo.avaliacao;

    // Calcular distância se tiver coordenadas (usar Haversine)
    let distanciaKm = 0;
    if (cidadeOrigem.latitude && cidadeOrigem.longitude && 
        cidadeDestino.latitude && cidadeDestino.longitude) {
      const { calcularDistanciaHaversine } = await import('@/src/services/calculadoraDistancia');
      distanciaKm = calcularDistanciaHaversine(
        cidadeOrigem.latitude,
        cidadeOrigem.longitude,
        cidadeDestino.latitude,
        cidadeDestino.longitude
      );
      
      // Aumentar 25% para aproximar distância rodoviária
      distanciaKm = distanciaKm * 1.25;
    }

    // Se não tiver coordenadas, usar distância padrão
    if (distanciaKm === 0 || isNaN(distanciaKm)) {
      distanciaKm = 500; // Distância padrão de 500km
    }

    // Calcular tempo de viagem baseado na distância
    const { calcularTempoViagemPorDistancia } = await import('@/src/services/calculadoraDistancia');
    const tempo = calcularTempoViagemPorDistancia(distanciaKm);
    const duracaoCalculada = formatarDuracao(tempo.horas, tempo.minutos);
    const duracao = passagemResumo?.duracao || duracaoCalculada;

    // Calcular horário de chegada
    const horarioPartida = passagemResumo?.horarioPartida || '08:00';
    const horarioChegadaCalculado = calcularHorarioChegada(horarioPartida, tempo.horas, tempo.minutos);
    const horarioChegada = passagemResumo?.horarioChegada || horarioChegadaCalculado;

    // Determinar tipo de assento
    const tipoAssentoCalculado = determinarTipoAssentoPorDistancia(distanciaKm);
    const tipoAssento = (passagemResumo?.tipoAssento || tipoAssentoCalculado) as any;

    // Calcular preço baseado em distância
    const precoCalculado = calcularPrecoBase(distanciaKm, tipoAssentoCalculado);
    const preco = passagemResumo?.preco || precoCalculado;

    // Calcular assentos disponíveis
    const assentosCalculados = calcularAssentosDisponiveis(distanciaKm, tipoAssentoCalculado);
    const assentosDisponiveis = passagemResumo?.assentosDisponiveis || assentosCalculados;

    // Calcular data de chegada
    const dataPartida = new Date();
    const dataChegada = new Date(dataPartida);
    dataChegada.setHours(dataPartida.getHours() + tempo.horas);
    dataChegada.setMinutes(dataPartida.getMinutes() + tempo.minutos);

    return {
      id,
      companhia: {
        id: companhiaId,
        nome: nomeCompanhia,
        logo: '',
        avaliacao: avaliacao,
        totalAvaliacoes: 1200,
      },
      origem: cidadeOrigem,
      destino: cidadeDestino,
      dataPartida,
      dataChegada,
      horarioPartida,
      horarioChegada,
      duracao,
      preco: Math.round(preco * 100) / 100,
      assentosDisponiveis,
      tipoAssento,
      tipoOnibus: 'EXECUTIVO' as any,
      poltronas: Array.from({ length: Math.max(assentosDisponiveis, 40) }, (_, i) => ({
        numero: i + 1,
        disponivel: i < assentosDisponiveis,
        tipo: tipoAssento,
        janela: i % 2 === 0,
        preferencial: i < 4,
        precoAdicional: i < 4 ? 10 : 0,
      })),
      servicos: [
        { id: '1', nome: 'Wi-Fi', icone: 'wifi', disponivel: true },
        { id: '2', nome: 'Ar Condicionado', icone: 'ac-unit', disponivel: true },
        { id: '3', nome: 'Tomada', icone: 'power', disponivel: true },
        { id: '4', nome: 'Banheiro', icone: 'wc', disponivel: true },
      ],
    };
  },
};

