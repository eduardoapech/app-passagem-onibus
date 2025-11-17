import { getDatabase } from './index';
import { Reserva, Pagamento, MetodoPagamento, DadosPagamento, Passageiro, StatusPagamento } from '@/src/interfaces/pagamento';

const gerarCodigoReserva = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const PagamentoDatabaseService = {
  async criarReserva(
    passagemId: string,
    poltronas: number[],
    passageiros: Passageiro[],
    valorTotal?: number,
    usuarioId?: string,
    passagemCompleta?: any // Passagem completa para salvar no banco se não existir
  ): Promise<Reserva> {
    const db = getDatabase();
    
    const reservaId = Date.now().toString();
    const codigoReserva = gerarCodigoReserva();
    
    // Verificar se a passagem existe no banco, se não, criar
    const passagemExistente = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM passagens WHERE id = ?',
      [passagemId]
    );

    if (!passagemExistente && passagemCompleta) {
      // Salvar passagem no banco se não existir
      try {
        console.log('Salvando passagem no banco:', passagemId);
        
        // Buscar ou criar origem e destino
        let origemId = passagemCompleta.origem?.id || '1';
        let destinoId = passagemCompleta.destino?.id || '2';
        
        // Verificar se as cidades existem
        const origemExistente = await db.getFirstAsync<{ id: string }>(
          'SELECT id FROM cidades WHERE id = ?',
          [origemId]
        );
        if (!origemExistente && passagemCompleta.origem) {
          // Criar cidade origem se não existir
          await db.runAsync(
            `INSERT OR IGNORE INTO cidades (id, nome, estado, sigla, terminal)
             VALUES (?, ?, ?, ?, ?)`,
            [
              passagemCompleta.origem.id,
              passagemCompleta.origem.nome,
              passagemCompleta.origem.estado,
              passagemCompleta.origem.sigla,
              passagemCompleta.origem.terminal || null,
            ]
          );
        }

        const destinoExistente = await db.getFirstAsync<{ id: string }>(
          'SELECT id FROM cidades WHERE id = ?',
          [destinoId]
        );
        if (!destinoExistente && passagemCompleta.destino) {
          // Criar cidade destino se não existir
          await db.runAsync(
            `INSERT OR IGNORE INTO cidades (id, nome, estado, sigla, terminal)
             VALUES (?, ?, ?, ?, ?)`,
            [
              passagemCompleta.destino.id,
              passagemCompleta.destino.nome,
              passagemCompleta.destino.estado,
              passagemCompleta.destino.sigla,
              passagemCompleta.destino.terminal || null,
            ]
          );
        }

        // Buscar companhia
        const companhiaId = passagemCompleta.companhia?.id || '1';
        const companhiaExistente = await db.getFirstAsync<{ id: string }>(
          'SELECT id FROM companhias WHERE id = ?',
          [companhiaId]
        );
        if (!companhiaExistente && passagemCompleta.companhia) {
          // Criar companhia se não existir
          await db.runAsync(
            `INSERT OR IGNORE INTO companhias (id, nome, logo, avaliacao, totalAvaliacoes, urlSite)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              passagemCompleta.companhia.id,
              passagemCompleta.companhia.nome,
              passagemCompleta.companhia.logo || '',
              passagemCompleta.companhia.avaliacao || 4.5,
              passagemCompleta.companhia.totalAvaliacoes || 1000,
              passagemCompleta.companhia.urlSite || null,
            ]
          );
        }

        // Calcular data de chegada se não tiver
        const dataPartida = passagemCompleta.dataPartida instanceof Date 
          ? passagemCompleta.dataPartida 
          : (passagemCompleta.dataPartida ? new Date(passagemCompleta.dataPartida) : new Date());
        const dataChegada = passagemCompleta.dataChegada instanceof Date
          ? passagemCompleta.dataChegada
          : (passagemCompleta.dataChegada ? new Date(passagemCompleta.dataChegada) : new Date(dataPartida.getTime() + 6 * 60 * 60 * 1000)); // +6 horas

        // Converter tipos para string (pode ser enum ou string)
        const tipoAssento = passagemCompleta.tipoAssento 
          ? String(passagemCompleta.tipoAssento)
          : 'CONVENCIONAL';
        const tipoOnibus = passagemCompleta.tipoOnibus
          ? String(passagemCompleta.tipoOnibus)
          : 'CONVENCIONAL';

        // Salvar passagem
        await db.runAsync(
          `INSERT OR IGNORE INTO passagens (
            id, companhiaId, origemId, destinoId, dataPartida, dataChegada,
            horarioPartida, horarioChegada, duracao, preco, assentosDisponiveis,
            tipoAssento, tipoOnibus
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            passagemId,
            companhiaId,
            origemId,
            destinoId,
            dataPartida.toISOString(),
            dataChegada.toISOString(),
            passagemCompleta.horarioPartida || '08:00',
            passagemCompleta.horarioChegada || '14:00',
            passagemCompleta.duracao || '6h',
            passagemCompleta.preco || 100.00,
            passagemCompleta.assentosDisponiveis || 40,
            tipoAssento,
            tipoOnibus,
          ]
        );

        console.log('Passagem salva no banco com sucesso');
      } catch (error: any) {
        console.warn('Erro ao salvar passagem no banco (continuando mesmo assim):', error);
      }
    }
    
    // Buscar preço da passagem (ou usar valor fornecido)
    let total = valorTotal;
    
    if (!total) {
      const passagem = await db.getFirstAsync<{ preco: number }>(
        'SELECT preco FROM passagens WHERE id = ?',
        [passagemId]
      );

      if (!passagem) {
        // Se não encontrar no banco, usar valor padrão (modo teste)
        console.warn('Passagem não encontrada no banco, usando valor padrão (modo teste)');
        total = (passagemCompleta?.preco || 100.00) * poltronas.length; // Valor padrão para teste
      } else {
        total = passagem.preco * poltronas.length;
      }
    }

    // Calcular valor total
    let valorTotalCalculado = total;
    
    // Adicionar preços adicionais das poltronas (se existirem no banco)
    try {
      for (const numero of poltronas) {
        const poltrona = await db.getFirstAsync<{ precoAdicional: number }>(
          'SELECT precoAdicional FROM poltronas WHERE passagemId = ? AND numero = ?',
          [passagemId, numero]
        );
        if (poltrona?.precoAdicional) {
          valorTotalCalculado += poltrona.precoAdicional;
        } else if (passagemCompleta?.poltronas) {
          // Se não tiver no banco, verificar na passagem completa
          const poltronaCompleta = passagemCompleta.poltronas.find((p: any) => p.numero === numero);
          if (poltronaCompleta) {
            if (poltronaCompleta.precoAdicional) {
              valorTotalCalculado += poltronaCompleta.precoAdicional;
            }
            // Salvar poltrona no banco (se não existir)
            try {
              const tipoPoltrona = poltronaCompleta.tipo 
                ? String(poltronaCompleta.tipo)
                : (passagemCompleta.tipoAssento ? String(passagemCompleta.tipoAssento) : 'CONVENCIONAL');
              await db.runAsync(
                `INSERT OR IGNORE INTO poltronas (passagemId, numero, disponivel, tipo, janela, preferencial, precoAdicional)
                 VALUES (?, ?, 0, ?, ?, ?, ?)`,
                [
                  passagemId,
                  numero,
                  tipoPoltrona,
                  poltronaCompleta.janela ? 1 : 0,
                  poltronaCompleta.preferencial ? 1 : 0,
                  poltronaCompleta.precoAdicional || 0,
                ]
              );
            } catch (error) {
              // Ignorar erro ao salvar poltrona
              console.warn('Erro ao salvar poltrona no banco:', error);
            }
          }
        }
      }
    } catch (error) {
      // Em modo teste, ignorar erros de poltronas
      console.warn('Erro ao buscar preços adicionais (modo teste):', error);
    }

    // Criar reserva (incluir usuarioId se fornecido)
    await db.runAsync(
      `INSERT INTO reservas (id, passagemId, usuarioId, valorTotal, status, codigoReserva)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [reservaId, passagemId, usuarioId || null, valorTotalCalculado, 'RESERVADO', codigoReserva]
    );

    // Inserir passageiros
    for (let i = 0; i < passageiros.length; i++) {
      const passageiro = passageiros[i];
      await db.runAsync(
        `INSERT INTO passageiros (reservaId, nome, cpf, dataNascimento, telefone, email, tipo, poltrona)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reservaId,
          passageiro.nome,
          passageiro.cpf,
          passageiro.dataNascimento.toISOString(),
          passageiro.telefone,
          passageiro.email,
          passageiro.tipo,
          passageiro.poltrona || poltronas[i] || null,
        ]
      );
    }

    // Marcar poltronas como ocupadas
    for (const numero of poltronas) {
      await db.runAsync(
        'UPDATE poltronas SET disponivel = 0 WHERE passagemId = ? AND numero = ?',
        [passagemId, numero]
      );
    }

    // Atualizar assentos disponíveis
    await db.runAsync(
      'UPDATE passagens SET assentosDisponiveis = assentosDisponiveis - ? WHERE id = ?',
      [poltronas.length, passagemId]
    );

    const reserva: Reserva = {
      id: reservaId,
      passageiros,
      poltronas,
      valorTotal: valorTotalCalculado,
      status: 'RESERVADO',
      dataReserva: new Date().toISOString(),
      codigoReserva,
    };

    return reserva;
  },

  async processarPagamento(
    reservaId: string,
    metodoPagamento: MetodoPagamento,
    dadosPagamento: DadosPagamento
  ): Promise<Pagamento> {
    const db = getDatabase();
    
    // Simular delay de processamento (teste)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const pagamentoId = Date.now().toString();
    
    // Buscar reserva
    const reserva = await db.getFirstAsync<{ valorTotal: number }>(
      'SELECT valorTotal FROM reservas WHERE id = ?',
      [reservaId]
    );

    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }

    try {
      // Criar pagamento (modo teste - sempre aprova)
      await db.runAsync(
        `INSERT INTO pagamentos (id, reservaId, valorTotal, metodoPagamento, status, numeroCartao, nomeTitular, validade, cvv, cpf, email, telefone, pixChave)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pagamentoId,
          reservaId,
          reserva.valorTotal,
          metodoPagamento,
          'APROVADO', // Modo teste - sempre aprova
          dadosPagamento.numeroCartao || null,
          dadosPagamento.nomeTitular || null,
          dadosPagamento.validade || null,
          dadosPagamento.cvv || null,
          dadosPagamento.cpf || null,
          dadosPagamento.email || null,
          dadosPagamento.telefone || null,
          dadosPagamento.pixChave || null,
        ]
      );

      // Atualizar status da reserva
      await db.runAsync(
        'UPDATE reservas SET status = ? WHERE id = ?',
        ['CONFIRMADO', reservaId]
      );
    } catch (error) {
      // Em caso de erro, apenas logar (modo teste)
      console.warn('Erro ao salvar pagamento (modo teste):', error);
      // Continuar mesmo com erro para não bloquear o fluxo
    }

    const pagamento: Pagamento = {
      id: pagamentoId,
      passagemId: '',
      valorTotal: reserva.valorTotal,
      metodoPagamento,
      status: 'APROVADO' as StatusPagamento,
      dataPagamento: new Date(),
      dadosPagamento,
    };

    return pagamento;
  },

  async listarReservas(usuarioId?: string): Promise<Reserva[]> {
    const db = getDatabase();
    
    let query = `
      SELECT r.*, p.id as passagemId
      FROM reservas r
      LEFT JOIN passagens p ON r.passagemId = p.id
    `;
    const params: any[] = [];

    if (usuarioId) {
      query += ' WHERE r.usuarioId = ?';
      params.push(usuarioId);
    }

    query += ' ORDER BY r.dataReserva DESC';

    const reservasData = await db.getAllAsync<{
      id: string;
      passagemId: string;
      valorTotal: number;
      status: string;
      dataReserva: string;
      codigoReserva: string | null;
    }>(query, params);

    const reservas: Reserva[] = [];
    for (const reservaData of reservasData) {
      const passageiros = await db.getAllAsync<Passageiro>(
        'SELECT nome, cpf, dataNascimento, telefone, email, tipo, poltrona FROM passageiros WHERE reservaId = ?',
        [reservaData.id]
      );

      const poltronas = await db.getAllAsync<{ poltrona: number }>(
        'SELECT poltrona FROM passageiros WHERE reservaId = ? AND poltrona IS NOT NULL',
        [reservaData.id]
      );

      reservas.push({
        id: reservaData.id,
        passageiros: passageiros.map(p => ({
          ...p,
          dataNascimento: new Date(p.dataNascimento as any),
        })),
        poltronas: poltronas.map(p => p.poltrona),
        valorTotal: reservaData.valorTotal,
        status: reservaData.status as any,
        dataReserva: reservaData.dataReserva,
        codigoReserva: reservaData.codigoReserva || undefined,
      });
    }

    return reservas;
  },

  async cancelarReserva(reservaId: string): Promise<void> {
    const db = getDatabase();
    
    // Buscar reserva e poltronas
    const reserva = await db.getFirstAsync<{ passagemId: string }>(
      'SELECT passagemId FROM reservas WHERE id = ?',
      [reservaId]
    );

    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }

    const passageiros = await db.getAllAsync<{ poltrona: number }>(
      'SELECT poltrona FROM passageiros WHERE reservaId = ? AND poltrona IS NOT NULL',
      [reservaId]
    );

    // Liberar poltronas
    for (const passageiro of passageiros) {
      await db.runAsync(
        'UPDATE poltronas SET disponivel = 1 WHERE passagemId = ? AND numero = ?',
        [reserva.passagemId, passageiro.poltrona]
      );
    }

    // Atualizar assentos disponíveis
    await db.runAsync(
      'UPDATE passagens SET assentosDisponiveis = assentosDisponiveis + ? WHERE id = ?',
      [passageiros.length, reserva.passagemId]
    );

    // Atualizar status da reserva
    await db.runAsync(
      'UPDATE reservas SET status = ? WHERE id = ?',
      ['CANCELADO', reservaId]
    );
  },
};

