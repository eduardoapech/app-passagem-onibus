import { getDatabase } from './index';
import { MinhaViagem } from '@/src/interfaces/usuario';
import { PassagemDatabaseService } from './passagens';
import { Passagem } from '@/src/interfaces/passagem';
import { Passageiro } from '@/src/interfaces/pagamento';
import { Cidade } from '@/src/interfaces/passagem';
import { CidadeService } from '@/src/services/cidades';

// Função para normalizar cidade usando API IBGE
async function normalizarCidade(cidade: any): Promise<Cidade> {
  // Se a cidade já tem nome válido (não é um ID numérico) e sigla válida, retornar como está
  const nomeCidade = cidade?.nome || '';
  const isNomeValido = nomeCidade && !/^\d+$/.test(nomeCidade.trim()) && nomeCidade !== 'N/A';
  
  if (isNomeValido && cidade?.sigla && cidade.sigla.length === 2 && cidade.sigla !== 'N/A') {
    return {
      id: cidade.id || '',
      nome: nomeCidade,
      estado: cidade.estado || cidade.sigla,
      sigla: cidade.sigla,
      latitude: cidade.latitude,
      longitude: cidade.longitude,
      terminal: cidade.terminal,
    };
  }

  // Se temos um ID numérico, tentar buscar pelo ID primeiro
  const cidadeId = cidade?.id || '';
  if (cidadeId && /^\d+$/.test(cidadeId)) {
    try {
      const cidadePorId = await CidadeService.obterCidadePorId(cidadeId);
      if (cidadePorId) {
        return {
          id: cidadePorId.id,
          nome: cidadePorId.nome,
          estado: cidadePorId.estado,
          sigla: cidadePorId.sigla,
          latitude: cidade.latitude || cidadePorId.latitude,
          longitude: cidade.longitude || cidadePorId.longitude,
          terminal: cidade.terminal,
        };
      }
    } catch (error) {
      console.warn('Erro ao buscar cidade por ID:', error);
    }
  }

  // Se o nome começa com "Cidade " seguido de números, extrair o ID
  const matchCidadeId = nomeCidade.match(/^Cidade\s+(\d+)/i);
  if (matchCidadeId) {
    const idExtraido = matchCidadeId[1];
    try {
      const cidadePorId = await CidadeService.obterCidadePorId(idExtraido);
      if (cidadePorId) {
        return {
          id: cidadePorId.id,
          nome: cidadePorId.nome,
          estado: cidadePorId.estado,
          sigla: cidadePorId.sigla,
          latitude: cidade.latitude || cidadePorId.latitude,
          longitude: cidade.longitude || cidadePorId.longitude,
          terminal: cidade.terminal,
        };
      }
    } catch (error) {
      console.warn('Erro ao buscar cidade por ID (extraído do nome):', error);
    }
  }

  // Se o nome parece ser um ID numérico, tentar buscar pelo ID
  if (nomeCidade && /^\d+$/.test(nomeCidade.trim())) {
    try {
      const cidadePorId = await CidadeService.obterCidadePorId(nomeCidade.trim());
      if (cidadePorId) {
        return {
          id: cidadePorId.id,
          nome: cidadePorId.nome,
          estado: cidadePorId.estado,
          sigla: cidadePorId.sigla,
          latitude: cidade.latitude || cidadePorId.latitude,
          longitude: cidade.longitude || cidadePorId.longitude,
          terminal: cidade.terminal,
        };
      }
    } catch (error) {
      console.warn('Erro ao buscar cidade por ID (do nome):', error);
    }
  }

  // Tentar buscar na API IBGE pelo nome (se não for ID numérico)
  if (nomeCidade && !/^\d+$/.test(nomeCidade.trim()) && nomeCidade !== 'N/A') {
    try {
      const cidadeNormalizada = await CidadeService.obterCidadePorNome(nomeCidade, cidade?.estado || cidade?.sigla);
      if (cidadeNormalizada) {
        return {
          id: cidadeNormalizada.id,
          nome: cidadeNormalizada.nome,
          estado: cidadeNormalizada.estado,
          sigla: cidadeNormalizada.sigla,
          latitude: cidade.latitude || cidadeNormalizada.latitude,
          longitude: cidade.longitude || cidadeNormalizada.longitude,
          terminal: cidade.terminal,
        };
      }
    } catch (error) {
      console.warn('Erro ao normalizar cidade na API IBGE pelo nome:', error);
    }
  }

  // Se não conseguir normalizar, retornar com dados mínimos (mas tentar evitar "Cidade 1100502")
  const nomeFinal = isNomeValido ? nomeCidade : (cidadeId && /^\d+$/.test(cidadeId) ? 'Cidade não encontrada' : 'Cidade desconhecida');
  
  return {
    id: cidadeId || '',
    nome: nomeFinal,
    estado: cidade?.estado || cidade?.sigla || '',
    sigla: cidade?.sigla && cidade.sigla !== 'N/A' ? cidade.sigla : '',
    latitude: cidade?.latitude,
    longitude: cidade?.longitude,
    terminal: cidade?.terminal,
  };
}

export const ViagemDatabaseService = {
  async removerViagensExpiradas(usuarioId?: string): Promise<void> {
    const db = getDatabase();
    const agora = new Date();
    
    // Buscar todas as viagens
    // Nota: horarioPartida pode não existir em bancos antigos, então vamos tratar isso
    let query = `
      SELECT v.id, v.reservaId, r.passagemId, v.dataViagem
      FROM viagens v
      JOIN reservas r ON v.reservaId = r.id
    `;
    const params: any[] = [];

    if (usuarioId) {
      query += ' WHERE v.usuarioId = ?';
      params.push(usuarioId);
    }

    const viagensData = await db.getAllAsync<{
      id: string;
      reservaId: string;
      passagemId: string;
      dataViagem: string;
    }>(query, params);

    // Verificar cada viagem e remover as expiradas
    const viagensParaRemover: string[] = [];
    
    for (const viagemData of viagensData) {
      try {
        const dataViagem = new Date(viagemData.dataViagem);
        let dataHoraPartida: Date;
        
        // Tentar obter horário salvo na viagem (se coluna existir)
        let horarioPartida: string | null = null;
        try {
          const viagemComHorario = await db.getFirstAsync<{ horarioPartida: string | null }>(
            'SELECT horarioPartida FROM viagens WHERE id = ?',
            [viagemData.id]
          );
          horarioPartida = viagemComHorario?.horarioPartida || null;
        } catch (error) {
          // Coluna pode não existir, continuar
        }
        
        // Se não tiver horário salvo, buscar da passagem
        if (!horarioPartida) {
          try {
            const passagem = await PassagemDatabaseService.obterDetalhes(viagemData.passagemId);
            horarioPartida = passagem.horarioPartida;
            
            // Salvar horário na viagem para próximas verificações (se coluna existir)
            try {
              await db.runAsync(
                'UPDATE viagens SET horarioPartida = ? WHERE id = ?',
                [horarioPartida, viagemData.id]
              );
            } catch (error) {
              // Ignorar erro se coluna não existir
            }
          } catch (error) {
            console.warn(`Erro ao buscar horário da passagem ${viagemData.passagemId}:`, error);
          }
        }
        
        // Combinar data da viagem com horário de partida
        if (horarioPartida && horarioPartida.match(/^\d{2}:\d{2}$/)) {
          const [horas, minutos] = horarioPartida.split(':').map(Number);
          dataHoraPartida = new Date(dataViagem);
          dataHoraPartida.setHours(horas, minutos, 0, 0);
        } else {
          // Se não tiver horário válido, considerar fim do dia
          dataHoraPartida = new Date(dataViagem);
          dataHoraPartida.setHours(23, 59, 59, 999);
        }
        
        // Se já passou o horário de partida, marcar para remoção
        if (dataHoraPartida < agora) {
          console.log(`Viagem expirada encontrada: ${viagemData.id} (partida: ${dataHoraPartida.toLocaleString('pt-BR')})`);
          viagensParaRemover.push(viagemData.reservaId);
        }
      } catch (error) {
        console.warn(`Erro ao verificar viagem ${viagemData.id} para remoção:`, error);
        // Em caso de erro, usar apenas a data (fim do dia)
        const dataViagem = new Date(viagemData.dataViagem);
        const fimDoDia = new Date(dataViagem);
        fimDoDia.setHours(23, 59, 59, 999);
        
        if (fimDoDia < agora) {
          console.log(`Viagem expirada encontrada (erro ao verificar): ${viagemData.id}`);
          viagensParaRemover.push(viagemData.reservaId);
        }
      }
    }
    
    // Remover todas as viagens expiradas e dados relacionados
    for (const reservaId of viagensParaRemover) {
      try {
        // Buscar ID da viagem antes de remover
        const viagem = await db.getFirstAsync<{ id: string }>(
          'SELECT id FROM viagens WHERE reservaId = ?',
          [reservaId]
        );
        
        if (viagem) {
          // Remover em ordem: viagem, pagamentos, passageiros, reserva
          await db.runAsync('DELETE FROM viagens WHERE reservaId = ?', [reservaId]);
          await db.runAsync('DELETE FROM pagamentos WHERE reservaId = ?', [reservaId]);
          await db.runAsync('DELETE FROM passageiros WHERE reservaId = ?', [reservaId]);
          await db.runAsync('DELETE FROM reservas WHERE id = ?', [reservaId]);
          console.log(`Viagem expirada removida: ${viagem.id}`);
        }
      } catch (error) {
        console.error(`Erro ao remover viagem expirada ${reservaId}:`, error);
      }
    }
  },

  async obterMinhasViagens(usuarioId?: string): Promise<MinhaViagem[]> {
    const db = getDatabase();
    
    // NÃO remover viagens automaticamente - apenas quando o QR Code for lido pelo motorista
    // await this.removerViagensExpiradas(usuarioId);
    
    // Verificar quais colunas existem e tentar adicionar se não existirem
    let horarioPartidaExiste = false;
    let tipoViagemExiste = false;
    try {
      const colunas = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(viagens)"
      );
      horarioPartidaExiste = colunas.some(col => col.name === 'horarioPartida');
      tipoViagemExiste = colunas.some(col => col.name === 'tipoViagem');
      
      // Tentar adicionar colunas se não existirem
      if (!horarioPartidaExiste) {
        try {
          await db.execAsync('ALTER TABLE viagens ADD COLUMN horarioPartida TEXT');
          horarioPartidaExiste = true;
          console.log('Coluna horarioPartida adicionada à tabela viagens (em obterMinhasViagens)');
        } catch (error: any) {
          console.warn('Não foi possível adicionar coluna horarioPartida:', error.message);
        }
      }
      if (!tipoViagemExiste) {
        try {
          await db.execAsync('ALTER TABLE viagens ADD COLUMN tipoViagem TEXT');
          tipoViagemExiste = true;
          console.log('Coluna tipoViagem adicionada à tabela viagens (em obterMinhasViagens)');
        } catch (error: any) {
          console.warn('Não foi possível adicionar coluna tipoViagem:', error.message);
        }
      }
    } catch (error) {
      console.warn('Erro ao verificar colunas da tabela viagens:', error);
    }

    // Construir query dinamicamente baseado nas colunas disponíveis
    let query = `
      SELECT v.id, v.reservaId, v.usuarioId, v.status, v.dataViagem, ${horarioPartidaExiste ? 'v.horarioPartida' : "NULL as horarioPartida"}, ${tipoViagemExiste ? 'v.tipoViagem' : 'NULL as tipoViagem'}, v.qrCode, r.codigoReserva, r.passagemId
      FROM viagens v
      JOIN reservas r ON v.reservaId = r.id
    `;
    const params: any[] = [];

    if (usuarioId) {
      query += ' WHERE v.usuarioId = ?';
      params.push(usuarioId);
    }

    if (horarioPartidaExiste) {
      query += ' ORDER BY v.dataViagem DESC, v.horarioPartida ASC';
    } else {
      query += ' ORDER BY v.dataViagem DESC';
    }

    const viagensData = await db.getAllAsync<{
      id: string;
      reservaId: string;
      passagemId: string;
      status: string;
      dataViagem: string;
      tipoViagem: string | null;
      codigoReserva: string | null;
      qrCode: string | null;
    }>(query, params);

    console.log(`Buscar viagens para usuarioId: ${usuarioId}, encontradas ${viagensData.length} viagens no banco`);

    const viagens: MinhaViagem[] = [];
    for (const viagemData of viagensData) {
      try {
        console.log(`Processando viagem ${viagemData.id}, reservaId: ${viagemData.reservaId}, passagemId: ${viagemData.passagemId}`);
        
        // Buscar passagem - tentar buscar informações da reserva para obter origem/destino
        let passagem;
        try {
          // Tentar buscar informações da passagem do banco para obter origemId e destinoId
          const passagemData = await db.getFirstAsync<{ origemId: string; destinoId: string }>(
            'SELECT origemId, destinoId FROM passagens WHERE id = ?',
            [viagemData.passagemId]
          );
          
          // Se encontrou a passagem no banco, buscar as cidades
          let origem: any = null;
          let destino: any = null;
          if (passagemData) {
            origem = await db.getFirstAsync<any>(
              'SELECT * FROM cidades WHERE id = ?',
              [passagemData.origemId]
            );
            destino = await db.getFirstAsync<any>(
              'SELECT * FROM cidades WHERE id = ?',
              [passagemData.destinoId]
            );
          }
          
          // Buscar detalhes da passagem passando as cidades encontradas
          passagem = await PassagemDatabaseService.obterDetalhes(
            viagemData.passagemId,
            origem || null,
            destino || null
          );
          
          // Normalizar cidades da passagem usando API IBGE
          passagem.origem = await normalizarCidade(passagem.origem);
          passagem.destino = await normalizarCidade(passagem.destino);
          
          console.log(`Passagem encontrada para viagem ${viagemData.id}:`, passagem.id);
          console.log(`Cidades normalizadas: ${passagem.origem.nome} - ${passagem.origem.sigla} -> ${passagem.destino.nome} - ${passagem.destino.sigla}`);
        } catch (error: any) {
          console.error(`Erro ao buscar passagem ${viagemData.passagemId} para viagem ${viagemData.id}:`, error?.message || error);
          // Se não conseguir buscar a passagem, pular esta viagem
          // Mas não bloquear outras viagens
          continue;
        }

        // Buscar passageiros
        const passageirosData = await db.getAllAsync<{
          nome: string;
          cpf: string;
          dataNascimento: string;
          telefone: string;
          email: string;
          tipo: string;
          poltrona: number | null;
        }>(
          'SELECT nome, cpf, dataNascimento, telefone, email, tipo, poltrona FROM passageiros WHERE reservaId = ?',
          [viagemData.reservaId]
        );

        console.log(`Passageiros encontrados para viagem ${viagemData.id}:`, passageirosData.length);

        const passageiros: Passageiro[] = passageirosData.map(p => ({
          nome: p.nome,
          cpf: p.cpf,
          dataNascimento: new Date(p.dataNascimento),
          telefone: p.telefone,
          email: p.email,
          tipo: p.tipo as any,
          poltrona: p.poltrona || undefined,
        }));

        const viagem: MinhaViagem = {
          id: viagemData.id,
          passagem,
          passageiros,
          status: viagemData.status as any,
          dataViagem: new Date(viagemData.dataViagem),
          codigoReserva: viagemData.codigoReserva || '',
          tipoViagem: (viagemData.tipoViagem as 'IDA' | 'VOLTA') || undefined,
          qrCode: viagemData.qrCode || undefined,
        };

        viagens.push(viagem);
        console.log(`Viagem ${viagemData.id} adicionada à lista`);
      } catch (error: any) {
        console.warn(`Erro ao carregar viagem ${viagemData.id}:`, error?.message || error);
        console.warn('Stack:', error?.stack);
        // Continuar mesmo com erro para não bloquear outras viagens
      }
    }

    console.log(`Total de viagens retornadas: ${viagens.length}`);
    return viagens;
  },

  async criarViagem(reservaId: string, usuarioId: string, dataViagem?: Date, horarioPartida?: string, passagem?: Passagem, tipoViagem?: 'IDA' | 'VOLTA'): Promise<MinhaViagem> {
    const db = getDatabase();
    
    const viagemId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    console.log('criarViagem chamado:', { reservaId, usuarioId, dataViagem, horarioPartida, tipoViagem });
    
    // Buscar reserva
    const reserva = await db.getFirstAsync<{ passagemId: string; codigoReserva: string | null }>(
      'SELECT passagemId, codigoReserva FROM reservas WHERE id = ?',
      [reservaId]
    );

    if (!reserva) {
      console.error('Reserva não encontrada para ID:', reservaId);
      throw new Error(`Reserva não encontrada: ${reservaId}`);
    }

    console.log('Reserva encontrada:', reserva);

    // Usar data fornecida ou buscar da passagem ou usar data atual
    let dataViagemStr: string;
    if (dataViagem) {
      // Se a data foi fornecida, usar ela
      dataViagemStr = dataViagem.toISOString();
    } else if (passagem && passagem.dataPartida) {
      // Se temos a passagem completa, usar a data da passagem
      const dataPartida = passagem.dataPartida instanceof Date ? passagem.dataPartida : new Date(passagem.dataPartida);
      dataViagemStr = dataPartida.toISOString();
    } else {
      // Tentar buscar do banco
      try {
        const passagemData = await db.getFirstAsync<{ dataPartida: string }>(
          'SELECT dataPartida FROM passagens WHERE id = ?',
          [reserva.passagemId]
        );
        if (passagemData?.dataPartida) {
          dataViagemStr = passagemData.dataPartida;
        } else {
          dataViagemStr = new Date().toISOString();
        }
      } catch (error) {
        // Se não encontrar no banco, usar data atual
        dataViagemStr = new Date().toISOString();
      }
    }

    // Usar horário fornecido ou buscar da passagem ou usar padrão
    let horarioPartidaStr: string = '08:00';
    if (horarioPartida) {
      horarioPartidaStr = horarioPartida;
    } else if (passagem && passagem.horarioPartida) {
      horarioPartidaStr = passagem.horarioPartida;
    } else {
      try {
        const passagemDetalhes = await PassagemDatabaseService.obterDetalhes(reserva.passagemId);
        horarioPartidaStr = passagemDetalhes.horarioPartida || '08:00';
      } catch (error) {
        console.warn('Erro ao buscar horário da passagem, usando padrão:', error);
      }
    }

    // Verificar se as colunas existem antes de inserir
    let horarioPartidaExiste = false;
    let tipoViagemExiste = false;
    try {
      const colunas = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(viagens)"
      );
      horarioPartidaExiste = colunas.some(col => col.name === 'horarioPartida');
      tipoViagemExiste = colunas.some(col => col.name === 'tipoViagem');
      
      // Tentar adicionar colunas se não existirem
      if (!horarioPartidaExiste) {
        try {
          await db.execAsync('ALTER TABLE viagens ADD COLUMN horarioPartida TEXT');
          horarioPartidaExiste = true;
          console.log('Coluna horarioPartida adicionada à tabela viagens');
        } catch (error: any) {
          console.warn('Não foi possível adicionar coluna horarioPartida:', error.message);
        }
      }
      if (!tipoViagemExiste) {
        try {
          await db.execAsync('ALTER TABLE viagens ADD COLUMN tipoViagem TEXT');
          tipoViagemExiste = true;
          console.log('Coluna tipoViagem adicionada à tabela viagens');
        } catch (error: any) {
          console.warn('Não foi possível adicionar coluna tipoViagem:', error.message);
        }
      }
    } catch (error) {
      console.warn('Erro ao verificar colunas da tabela viagens:', error);
    }

    // Criar viagem
    // O QR Code contém o código de reserva para validação
    const codigoReservaParaQR = reserva.codigoReserva || viagemId;
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(codigoReservaParaQR)}`;
    
    // Construir query dinamicamente baseado nas colunas disponíveis
    if (horarioPartidaExiste && tipoViagemExiste) {
      // Inserir com todas as colunas
      await db.runAsync(
        `INSERT INTO viagens (id, reservaId, usuarioId, status, dataViagem, horarioPartida, tipoViagem, qrCode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          viagemId,
          reservaId,
          usuarioId,
          'CONFIRMADA',
          dataViagemStr,
          horarioPartidaStr,
          tipoViagem || null,
          qrCode,
        ]
      );
      console.log('Viagem inserida com horarioPartida e tipoViagem:', tipoViagem);
    } else if (horarioPartidaExiste) {
      // Inserir sem tipoViagem
      await db.runAsync(
        `INSERT INTO viagens (id, reservaId, usuarioId, status, dataViagem, horarioPartida, qrCode)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          viagemId,
          reservaId,
          usuarioId,
          'CONFIRMADA',
          dataViagemStr,
          horarioPartidaStr,
          qrCode,
        ]
      );
      console.log('Viagem inserida com horarioPartida (sem tipoViagem)');
    } else {
      // Inserir sem horarioPartida e tipoViagem
      await db.runAsync(
        `INSERT INTO viagens (id, reservaId, usuarioId, status, dataViagem, qrCode)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          viagemId,
          reservaId,
          usuarioId,
          'CONFIRMADA',
          dataViagemStr,
          qrCode,
        ]
      );
      console.log('Viagem inserida sem horarioPartida e tipoViagem');
    }

    // Verificar se a viagem foi criada corretamente
    const viagemCriada = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM viagens WHERE id = ?',
      [viagemId]
    );

    if (!viagemCriada) {
      throw new Error('Falha ao criar viagem no banco de dados');
    }

    console.log('Viagem confirmada no banco:', viagemId);

    // Buscar viagem completa (sem remover expiradas para não remover a que acabamos de criar)
    // Aguardar um pouco para garantir que os dados estejam commitados
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Verificar se a coluna tipoViagem existe e tentar adicionar se não existir
      let tipoViagemExiste = false;
      try {
        const colunas = await db.getAllAsync<{ name: string }>(
          "PRAGMA table_info(viagens)"
        );
        tipoViagemExiste = colunas.some(col => col.name === 'tipoViagem');
        if (!tipoViagemExiste) {
          // Tentar adicionar a coluna
          try {
            await db.execAsync('ALTER TABLE viagens ADD COLUMN tipoViagem TEXT');
            tipoViagemExiste = true;
            console.log('Coluna tipoViagem adicionada à tabela viagens (em criarViagem)');
          } catch (error: any) {
            // Ignorar erro se coluna já existir ou outro erro
            console.warn('Não foi possível adicionar coluna tipoViagem:', error.message);
          }
        }
      } catch (error) {
        console.warn('Erro ao verificar colunas da tabela viagens:', error);
      }

      const viagemData = await db.getFirstAsync<{
        id: string;
        reservaId: string;
        passagemId: string;
        status: string;
        dataViagem: string;
        tipoViagem: string | null;
        codigoReserva: string | null;
        qrCode: string | null;
      }>(
        `SELECT v.id, v.reservaId, r.passagemId, v.status, v.dataViagem, ${tipoViagemExiste ? 'v.tipoViagem' : 'NULL as tipoViagem'}, r.codigoReserva, v.qrCode
         FROM viagens v
         JOIN reservas r ON v.reservaId = r.id
         WHERE v.id = ?`,
        [viagemId]
      );

      if (!viagemData) {
        console.error('Viagem não encontrada após criação, mas foi criada. Tentando buscar novamente...');
        // Verificar se a coluna tipoViagem existe e tentar adicionar se não existir
        let tipoViagemExiste = false;
        try {
          const colunas = await db.getAllAsync<{ name: string }>(
            "PRAGMA table_info(viagens)"
          );
          tipoViagemExiste = colunas.some(col => col.name === 'tipoViagem');
          if (!tipoViagemExiste) {
            // Tentar adicionar a coluna
            try {
              await db.execAsync('ALTER TABLE viagens ADD COLUMN tipoViagem TEXT');
              tipoViagemExiste = true;
              console.log('Coluna tipoViagem adicionada à tabela viagens (em criarViagem - busca alternativa)');
            } catch (error: any) {
              console.warn('Não foi possível adicionar coluna tipoViagem:', error.message);
            }
          }
        } catch (error) {
          console.warn('Erro ao verificar colunas da tabela viagens:', error);
        }

        // Tentar buscar novamente sem JOIN
        const viagemSimples = await db.getFirstAsync<{
          id: string;
          reservaId: string;
          status: string;
          dataViagem: string;
          tipoViagem: string | null;
        }>(
          `SELECT id, reservaId, status, dataViagem, ${tipoViagemExiste ? 'tipoViagem' : 'NULL as tipoViagem'} FROM viagens WHERE id = ?`,
          [viagemId]
        );

        if (!viagemSimples) {
          throw new Error('Viagem não encontrada após criação');
        }

        // Buscar reserva separadamente
        const reservaData = await db.getFirstAsync<{
          passagemId: string;
          codigoReserva: string | null;
        }>(
          'SELECT passagemId, codigoReserva FROM reservas WHERE id = ?',
          [viagemSimples.reservaId]
        );

        if (!reservaData) {
          throw new Error('Reserva não encontrada para a viagem');
        }

        // Buscar passagem - usar passagem fornecida ou buscar do banco
        let passagemFinal: Passagem;
        if (passagem) {
          passagemFinal = passagem;
          // Normalizar cidades da passagem usando API IBGE
          passagemFinal.origem = await normalizarCidade(passagemFinal.origem);
          passagemFinal.destino = await normalizarCidade(passagemFinal.destino);
        } else {
          passagemFinal = await PassagemDatabaseService.obterDetalhes(reservaData.passagemId);
          // Normalizar cidades da passagem usando API IBGE
          passagemFinal.origem = await normalizarCidade(passagemFinal.origem);
          passagemFinal.destino = await normalizarCidade(passagemFinal.destino);
        }

        // Buscar passageiros
        const passageirosData = await db.getAllAsync<{
          nome: string;
          cpf: string;
          dataNascimento: string;
          telefone: string;
          email: string;
          tipo: string;
          poltrona: number | null;
        }>(
          'SELECT nome, cpf, dataNascimento, telefone, email, tipo, poltrona FROM passageiros WHERE reservaId = ?',
          [viagemSimples.reservaId]
        );

        const passageiros: Passageiro[] = passageirosData.map(p => ({
          nome: p.nome,
          cpf: p.cpf,
          dataNascimento: new Date(p.dataNascimento),
          telefone: p.telefone,
          email: p.email,
          tipo: p.tipo as any,
          poltrona: p.poltrona || undefined,
        }));

        // Buscar QR Code
        const qrCodeData = await db.getFirstAsync<{ qrCode: string | null }>(
          'SELECT qrCode FROM viagens WHERE id = ?',
          [viagemId]
        );

        const viagem: MinhaViagem = {
          id: viagemSimples.id,
          passagem: passagemFinal,
          passageiros,
          status: viagemSimples.status as any,
          dataViagem: new Date(viagemSimples.dataViagem),
          codigoReserva: reservaData.codigoReserva || '',
          tipoViagem: (viagemSimples.tipoViagem as 'IDA' | 'VOLTA') || undefined,
          qrCode: qrCodeData?.qrCode || undefined,
        };

        console.log('Viagem criada e retornada (busca alternativa):', viagem.id);
        return viagem;
      }

      // Buscar passagem - usar passagem fornecida ou buscar do banco
      let passagemFinal: Passagem;
      if (passagem) {
        // Usar passagem fornecida (mais confiável)
        passagemFinal = passagem;
        // Normalizar cidades da passagem usando API IBGE
        passagemFinal.origem = await normalizarCidade(passagemFinal.origem);
        passagemFinal.destino = await normalizarCidade(passagemFinal.destino);
        console.log('Usando passagem fornecida para viagem:', passagemFinal.id);
      } else {
        // Tentar buscar do banco
        try {
          passagemFinal = await PassagemDatabaseService.obterDetalhes(viagemData.passagemId);
          // Normalizar cidades da passagem usando API IBGE
          passagemFinal.origem = await normalizarCidade(passagemFinal.origem);
          passagemFinal.destino = await normalizarCidade(passagemFinal.destino);
          console.log('Passagem encontrada no banco para viagem:', passagemFinal.id);
        } catch (error: any) {
          console.error(`Erro ao buscar passagem ${viagemData.passagemId} após criar viagem:`, error);
          // Se não conseguir buscar a passagem, não podemos retornar a viagem completa
          throw new Error(`Não foi possível buscar detalhes da passagem: ${error.message}`);
        }
      }

      // Buscar passageiros
      const passageirosData = await db.getAllAsync<{
        nome: string;
        cpf: string;
        dataNascimento: string;
        telefone: string;
        email: string;
        tipo: string;
        poltrona: number | null;
      }>(
        'SELECT nome, cpf, dataNascimento, telefone, email, tipo, poltrona FROM passageiros WHERE reservaId = ?',
        [viagemData.reservaId]
      );

      const passageiros: Passageiro[] = passageirosData.map(p => ({
        nome: p.nome,
        cpf: p.cpf,
        dataNascimento: new Date(p.dataNascimento),
        telefone: p.telefone,
        email: p.email,
        tipo: p.tipo as any,
        poltrona: p.poltrona || undefined,
      }));

      const viagem: MinhaViagem = {
        id: viagemData.id,
        passagem: passagemFinal,
        passageiros,
        status: viagemData.status as any,
        dataViagem: new Date(viagemData.dataViagem),
        codigoReserva: viagemData.codigoReserva || '',
        tipoViagem: (viagemData.tipoViagem as 'IDA' | 'VOLTA') || undefined,
        qrCode: viagemData.qrCode || undefined,
      };

      console.log('Viagem criada e retornada com sucesso:', viagem.id);
      return viagem;
    } catch (error: any) {
      console.error('Erro ao buscar viagem criada:', error);
      // Mesmo com erro, a viagem foi criada no banco
      // Vamos tentar buscar diretamente pela reserva
      console.log('Tentando buscar viagem pela reserva:', reservaId);
      
      const viagens = await this.obterMinhasViagens(usuarioId);
      const viagemEncontrada = viagens.find(v => {
        // Buscar pela reservaId comparando com a reserva
        return v.passageiros.some(p => {
          // Verificar se há passageiros na reserva
          return true;
        });
      });

      if (viagemEncontrada && viagemEncontrada.id === viagemId) {
        console.log('Viagem encontrada na busca de minhas viagens');
        return viagemEncontrada;
      }

      // Se ainda não encontrar, lançar erro
      throw new Error(`Erro ao buscar viagem criada: ${error.message}. Viagem pode ter sido criada, mas não foi possível recuperá-la.`);
    }
  },

  async cancelarViagem(viagemId: string): Promise<void> {
    const db = getDatabase();
    
    // Buscar viagem
    const viagem = await db.getFirstAsync<{ reservaId: string }>(
      'SELECT reservaId FROM viagens WHERE id = ?',
      [viagemId]
    );

    if (!viagem) {
      throw new Error('Viagem não encontrada');
    }

    // Atualizar status
    await db.runAsync(
      'UPDATE viagens SET status = ? WHERE id = ?',
      ['CANCELADA', viagemId]
    );

    // Cancelar reserva também
    const { cancelarReserva } = await import('./pagamento');
    await cancelarReserva(viagem.reservaId);
  },

  async moverViagemParaHistorico(viagemId: string): Promise<void> {
    const db = getDatabase();
    
    try {
      // Verificar se a coluna tipoViagem existe e tentar adicionar se não existir
      let tipoViagemExiste = false;
      try {
        const colunas = await db.getAllAsync<{ name: string }>(
          "PRAGMA table_info(viagens)"
        );
        tipoViagemExiste = colunas.some(col => col.name === 'tipoViagem');
        if (!tipoViagemExiste) {
          // Tentar adicionar a coluna
          try {
            await db.execAsync('ALTER TABLE viagens ADD COLUMN tipoViagem TEXT');
            tipoViagemExiste = true;
            console.log('Coluna tipoViagem adicionada à tabela viagens (em moverViagemParaHistorico)');
          } catch (error: any) {
            console.warn('Não foi possível adicionar coluna tipoViagem:', error.message);
          }
        }
      } catch (error) {
        console.warn('Erro ao verificar colunas da tabela viagens:', error);
      }

      // Buscar viagem completa
      const viagemData = await db.getFirstAsync<{
        id: string;
        reservaId: string;
        usuarioId: string;
        status: string;
        dataViagem: string;
        horarioPartida: string | null;
        tipoViagem: string | null;
        qrCode: string | null;
      }>(
        `SELECT id, reservaId, usuarioId, status, dataViagem, horarioPartida, ${tipoViagemExiste ? 'tipoViagem' : 'NULL as tipoViagem'}, qrCode FROM viagens WHERE id = ?`,
        [viagemId]
      );

      if (!viagemData) {
        throw new Error('Viagem não encontrada');
      }

      // Verificar se a coluna tipoViagem existe na tabela historico_viagens e tentar adicionar se não existir
      let tipoViagemExisteHistorico = false;
      try {
        const colunas = await db.getAllAsync<{ name: string }>(
          "PRAGMA table_info(historico_viagens)"
        );
        tipoViagemExisteHistorico = colunas.some(col => col.name === 'tipoViagem');
        if (!tipoViagemExisteHistorico) {
          // Tentar adicionar a coluna
          try {
            await db.execAsync('ALTER TABLE historico_viagens ADD COLUMN tipoViagem TEXT');
            tipoViagemExisteHistorico = true;
            console.log('Coluna tipoViagem adicionada à tabela historico_viagens');
          } catch (error: any) {
            console.warn('Não foi possível adicionar coluna tipoViagem no histórico:', error.message);
          }
        }
      } catch (error) {
        console.warn('Erro ao verificar colunas da tabela historico_viagens:', error);
      }

      // Salvar no histórico
      const dataUtilizacao = new Date().toISOString();
      if (tipoViagemExisteHistorico) {
        await db.runAsync(
          `INSERT INTO historico_viagens (id, reservaId, usuarioId, status, dataViagem, horarioPartida, tipoViagem, dataUtilizacao, qrCode)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            viagemData.id,
            viagemData.reservaId,
            viagemData.usuarioId,
            'UTILIZADA',
            viagemData.dataViagem,
            viagemData.horarioPartida || null,
            viagemData.tipoViagem || null,
            dataUtilizacao,
            viagemData.qrCode || null,
          ]
        );
      } else {
        // Se a coluna não existe, inserir sem ela
        await db.runAsync(
          `INSERT INTO historico_viagens (id, reservaId, usuarioId, status, dataViagem, horarioPartida, dataUtilizacao, qrCode)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            viagemData.id,
            viagemData.reservaId,
            viagemData.usuarioId,
            'UTILIZADA',
            viagemData.dataViagem,
            viagemData.horarioPartida || null,
            dataUtilizacao,
            viagemData.qrCode || null,
          ]
        );
      }

      // Remover da tabela de viagens ativas
      await db.runAsync('DELETE FROM viagens WHERE id = ?', [viagemId]);
      
      console.log('Viagem movida para histórico:', viagemId);
    } catch (error: any) {
      console.error('Erro ao mover viagem para histórico:', error);
      throw error;
    }
  },

  async marcarViagemComoUtilizada(codigoReserva: string): Promise<{ sucesso: boolean; mensagem: string }> {
    const db = getDatabase();
    
    try {
      // Buscar viagem pelo código de reserva
      const viagem = await db.getFirstAsync<{ id: string; reservaId: string; status: string }>(
        `SELECT v.id, v.reservaId, v.status
         FROM viagens v
         JOIN reservas r ON v.reservaId = r.id
         WHERE r.codigoReserva = ?`,
        [codigoReserva]
      );

      if (!viagem) {
        return { sucesso: false, mensagem: 'Viagem não encontrada' };
      }

      if (viagem.status === 'UTILIZADA') {
        return { sucesso: false, mensagem: 'Esta passagem já foi utilizada' };
      }

      if (viagem.status === 'CANCELADA') {
        return { sucesso: false, mensagem: 'Esta passagem foi cancelada' };
      }

      // Mover para histórico antes de remover
      await this.moverViagemParaHistorico(viagem.id);

      return { sucesso: true, mensagem: 'Passagem validada com sucesso!' };
    } catch (error: any) {
      console.error('Erro ao marcar viagem como utilizada:', error);
      return { sucesso: false, mensagem: `Erro ao validar passagem: ${error.message}` };
    }
  },

  async obterHistoricoViagens(usuarioId?: string): Promise<MinhaViagem[]> {
    const db = getDatabase();
    
    // Verificar se a coluna tipoViagem existe e tentar adicionar se não existir
    let tipoViagemExiste = false;
    try {
      const colunas = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(historico_viagens)"
      );
      tipoViagemExiste = colunas.some(col => col.name === 'tipoViagem');
      if (!tipoViagemExiste) {
        // Tentar adicionar a coluna
        try {
          await db.execAsync('ALTER TABLE historico_viagens ADD COLUMN tipoViagem TEXT');
          tipoViagemExiste = true;
          console.log('Coluna tipoViagem adicionada à tabela historico_viagens (em obterHistoricoViagens)');
        } catch (error: any) {
          // Ignorar erro se coluna já existir ou outro erro
          console.warn('Não foi possível adicionar coluna tipoViagem no histórico:', error.message);
        }
      }
    } catch (error) {
      console.warn('Erro ao verificar colunas da tabela historico_viagens:', error);
    }

    let query = `
      SELECT h.id, h.reservaId, h.usuarioId, h.status, h.dataViagem, h.horarioPartida, ${tipoViagemExiste ? 'h.tipoViagem' : 'NULL as tipoViagem'}, h.dataUtilizacao, h.qrCode, r.codigoReserva, r.passagemId
      FROM historico_viagens h
      JOIN reservas r ON h.reservaId = r.id
    `;
    const params: any[] = [];

    if (usuarioId) {
      query += ' WHERE h.usuarioId = ?';
      params.push(usuarioId);
    }

    query += ' ORDER BY h.dataUtilizacao DESC';

    const viagensData = await db.getAllAsync<{
      id: string;
      reservaId: string;
      passagemId: string;
      status: string;
      dataViagem: string;
      dataUtilizacao: string;
      tipoViagem: string | null;
      codigoReserva: string | null;
      qrCode: string | null;
    }>(query, params);

    console.log(`Buscar histórico de viagens para usuarioId: ${usuarioId}, encontradas ${viagensData.length} viagens no histórico`);

    const viagens: MinhaViagem[] = [];
    for (const viagemData of viagensData) {
      try {
        console.log(`Processando viagem histórica ${viagemData.id}, reservaId: ${viagemData.reservaId}, passagemId: ${viagemData.passagemId}`);
        
        // Buscar passagem
        let passagem;
        try {
          passagem = await PassagemDatabaseService.obterDetalhes(viagemData.passagemId);
          
          // Normalizar cidades da passagem usando API IBGE
          passagem.origem = await normalizarCidade(passagem.origem);
          passagem.destino = await normalizarCidade(passagem.destino);
          
          console.log(`Passagem encontrada para viagem histórica ${viagemData.id}:`, passagem.id);
          console.log(`Cidades normalizadas: ${passagem.origem.nome} - ${passagem.origem.sigla} -> ${passagem.destino.nome} - ${passagem.destino.sigla}`);
        } catch (error: any) {
          console.error(`Erro ao buscar passagem ${viagemData.passagemId} para viagem histórica ${viagemData.id}:`, error?.message || error);
          continue;
        }

        // Buscar passageiros
        const passageirosData = await db.getAllAsync<{
          nome: string;
          cpf: string;
          dataNascimento: string;
          telefone: string;
          email: string;
          tipo: string;
          poltrona: number | null;
        }>(
          'SELECT nome, cpf, dataNascimento, telefone, email, tipo, poltrona FROM passageiros WHERE reservaId = ?',
          [viagemData.reservaId]
        );

        console.log(`Passageiros encontrados para viagem histórica ${viagemData.id}:`, passageirosData.length);

        const passageiros: Passageiro[] = passageirosData.map(p => ({
          nome: p.nome,
          cpf: p.cpf,
          dataNascimento: new Date(p.dataNascimento),
          telefone: p.telefone,
          email: p.email,
          tipo: p.tipo as any,
          poltrona: p.poltrona || undefined,
        }));

        const viagem: MinhaViagem = {
          id: viagemData.id,
          passagem,
          passageiros,
          status: 'UTILIZADA' as any,
          dataViagem: new Date(viagemData.dataViagem),
          codigoReserva: viagemData.codigoReserva || '',
          tipoViagem: (viagemData.tipoViagem as 'IDA' | 'VOLTA') || undefined,
          qrCode: viagemData.qrCode || undefined,
        };

        viagens.push(viagem);
        console.log(`Viagem histórica ${viagemData.id} adicionada à lista`);
      } catch (error: any) {
        console.warn(`Erro ao carregar viagem histórica ${viagemData.id}:`, error?.message || error);
      }
    }

    console.log(`Total de viagens históricas retornadas: ${viagens.length}`);
    return viagens;
  },

  async obterQRCode(viagemId: string): Promise<string> {
    const db = getDatabase();
    
    const viagem = await db.getFirstAsync<{ qrCode: string | null; codigoReserva: string | null }>(
      `SELECT v.qrCode, r.codigoReserva
       FROM viagens v
       JOIN reservas r ON v.reservaId = r.id
       WHERE v.id = ?`,
      [viagemId]
    );

    if (!viagem) {
      throw new Error('Viagem não encontrada');
    }

    // O QR Code deve conter o código de reserva para validação
    const codigoReserva = viagem.codigoReserva || viagemId;
    
    // Gerar QR Code com o código de reserva (sem URL, apenas o código)
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(codigoReserva)}`;
    
    // Salvar QR Code se não existir ou atualizar
    if (!viagem.qrCode || viagem.qrCode !== qrCode) {
      try {
        await db.runAsync(
          'UPDATE viagens SET qrCode = ? WHERE id = ?',
          [qrCode, viagemId]
        );
      } catch (error) {
        // Ignorar erro se coluna não existir
        console.warn('Erro ao salvar QR Code:', error);
      }
    }

    return qrCode;
  },
};

