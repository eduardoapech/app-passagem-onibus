import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync('passagem_onibus.db');
    
    // Criar tabelas
    await db.execAsync(`
      -- Tabela de usuários
      CREATE TABLE IF NOT EXISTS usuarios (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        telefone TEXT,
        cpf TEXT,
        dataNascimento TEXT,
        foto TEXT,
        rua TEXT,
        numero TEXT,
        complemento TEXT,
        bairro TEXT,
        cidade TEXT,
        estado TEXT,
        cep TEXT,
        tipoAssentoPreferido TEXT,
        companhiaPreferida TEXT,
        receberPromocoes INTEGER DEFAULT 1,
        notificacoes INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de cidades
      CREATE TABLE IF NOT EXISTS cidades (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        estado TEXT NOT NULL,
        sigla TEXT NOT NULL,
        terminal TEXT,
        latitude REAL,
        longitude REAL
      );

      -- Tabela de companhias
      CREATE TABLE IF NOT EXISTS companhias (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        logo TEXT,
        avaliacao REAL DEFAULT 0,
        totalAvaliacoes INTEGER DEFAULT 0,
        urlSite TEXT
      );

      -- Tabela de passagens
      CREATE TABLE IF NOT EXISTS passagens (
        id TEXT PRIMARY KEY,
        companhiaId TEXT NOT NULL,
        origemId TEXT NOT NULL,
        destinoId TEXT NOT NULL,
        dataPartida TEXT NOT NULL,
        dataChegada TEXT NOT NULL,
        horarioPartida TEXT NOT NULL,
        horarioChegada TEXT NOT NULL,
        duracao TEXT NOT NULL,
        preco REAL NOT NULL,
        assentosDisponiveis INTEGER NOT NULL,
        tipoAssento TEXT NOT NULL,
        tipoOnibus TEXT NOT NULL,
        FOREIGN KEY (companhiaId) REFERENCES companhias(id),
        FOREIGN KEY (origemId) REFERENCES cidades(id),
        FOREIGN KEY (destinoId) REFERENCES cidades(id)
      );

      -- Tabela de poltronas
      CREATE TABLE IF NOT EXISTS poltronas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        passagemId TEXT NOT NULL,
        numero INTEGER NOT NULL,
        disponivel INTEGER DEFAULT 1,
        tipo TEXT NOT NULL,
        janela INTEGER DEFAULT 0,
        preferencial INTEGER DEFAULT 0,
        precoAdicional REAL DEFAULT 0,
        FOREIGN KEY (passagemId) REFERENCES passagens(id)
      );

      -- Tabela de serviços
      CREATE TABLE IF NOT EXISTS servicos (
        id TEXT PRIMARY KEY,
        passagemId TEXT NOT NULL,
        nome TEXT NOT NULL,
        icone TEXT NOT NULL,
        disponivel INTEGER DEFAULT 1,
        FOREIGN KEY (passagemId) REFERENCES passagens(id)
      );

      -- Tabela de reservas
      CREATE TABLE IF NOT EXISTS reservas (
        id TEXT PRIMARY KEY,
        passagemId TEXT NOT NULL,
        usuarioId TEXT,
        valorTotal REAL NOT NULL,
        status TEXT NOT NULL,
        dataReserva TEXT DEFAULT CURRENT_TIMESTAMP,
        codigoReserva TEXT,
        FOREIGN KEY (passagemId) REFERENCES passagens(id),
        FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
      );

      -- Tabela de passageiros
      CREATE TABLE IF NOT EXISTS passageiros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservaId TEXT NOT NULL,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL,
        dataNascimento TEXT NOT NULL,
        telefone TEXT NOT NULL,
        email TEXT NOT NULL,
        tipo TEXT NOT NULL,
        poltrona INTEGER,
        FOREIGN KEY (reservaId) REFERENCES reservas(id)
      );

      -- Tabela de pagamentos
      CREATE TABLE IF NOT EXISTS pagamentos (
        id TEXT PRIMARY KEY,
        reservaId TEXT NOT NULL,
        valorTotal REAL NOT NULL,
        metodoPagamento TEXT NOT NULL,
        status TEXT NOT NULL,
        dataPagamento TEXT DEFAULT CURRENT_TIMESTAMP,
        numeroCartao TEXT,
        nomeTitular TEXT,
        validade TEXT,
        cvv TEXT,
        cpf TEXT,
        email TEXT,
        telefone TEXT,
        pixChave TEXT,
        FOREIGN KEY (reservaId) REFERENCES reservas(id)
      );

      -- Tabela de viagens (minhas viagens)
      CREATE TABLE IF NOT EXISTS viagens (
        id TEXT PRIMARY KEY,
        reservaId TEXT NOT NULL,
        usuarioId TEXT NOT NULL,
        status TEXT NOT NULL,
        dataViagem TEXT NOT NULL,
        horarioPartida TEXT,
        tipoViagem TEXT,
        qrCode TEXT,
        FOREIGN KEY (reservaId) REFERENCES reservas(id),
        FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
      );

      -- Tabela de histórico de viagens
      CREATE TABLE IF NOT EXISTS historico_viagens (
        id TEXT PRIMARY KEY,
        reservaId TEXT NOT NULL,
        usuarioId TEXT NOT NULL,
        status TEXT NOT NULL,
        dataViagem TEXT NOT NULL,
        horarioPartida TEXT,
        tipoViagem TEXT,
        dataUtilizacao TEXT NOT NULL,
        qrCode TEXT,
        FOREIGN KEY (reservaId) REFERENCES reservas(id),
        FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
      );

      -- Índices para melhor performance
      CREATE INDEX IF NOT EXISTS idx_passagens_origem_destino ON passagens(origemId, destinoId);
      CREATE INDEX IF NOT EXISTS idx_passagens_data ON passagens(dataPartida);
      CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON reservas(usuarioId);
      CREATE INDEX IF NOT EXISTS idx_viagens_usuario ON viagens(usuarioId);
      CREATE INDEX IF NOT EXISTS idx_historico_viagens_usuario ON historico_viagens(usuarioId);
    `);

    // Inserir dados iniciais (cidades e companhias)
    await seedInitialData();
    
    // Migração: adicionar coluna horarioPartida se não existir
    try {
      await db.execAsync('ALTER TABLE viagens ADD COLUMN horarioPartida TEXT');
      console.log('Coluna horarioPartida adicionada à tabela viagens');
    } catch (error: any) {
      // Ignorar erro se coluna já existir (SQLite retorna erro específico)
      if (error.message?.includes('duplicate column name') || error.message?.includes('duplicate column') || error.message?.includes('duplicate')) {
        // Coluna já existe, tudo bem
        console.log('Coluna horarioPartida já existe');
      } else {
        console.warn('Erro ao adicionar coluna horarioPartida:', error.message);
      }
    }

    // Migração: adicionar coluna tipoViagem se não existir
    try {
      await db.execAsync('ALTER TABLE viagens ADD COLUMN tipoViagem TEXT');
      console.log('Coluna tipoViagem adicionada à tabela viagens');
    } catch (error: any) {
      // Ignorar erro se coluna já existir
      if (error.message?.includes('duplicate column name') || error.message?.includes('duplicate column') || error.message?.includes('duplicate')) {
        // Coluna já existe, tudo bem
        console.log('Coluna tipoViagem já existe');
      } else {
        console.warn('Erro ao adicionar coluna tipoViagem:', error.message);
      }
    }

    // Migração: adicionar coluna tipoViagem na tabela historico_viagens se não existir
    try {
      await db.execAsync('ALTER TABLE historico_viagens ADD COLUMN tipoViagem TEXT');
      console.log('Coluna tipoViagem adicionada à tabela historico_viagens');
    } catch (error: any) {
      // Ignorar erro se coluna já existir ou se tabela não existir ainda
      if (error.message?.includes('duplicate column name') || error.message?.includes('duplicate column') || error.message?.includes('duplicate') || error.message?.includes('no such table')) {
        // Coluna já existe ou tabela ainda não existe, tudo bem
        console.log('Coluna tipoViagem no histórico já existe ou tabela não existe');
      } else {
        console.warn('Erro ao adicionar coluna tipoViagem no histórico:', error.message);
      }
    }
    
    return db;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

const seedInitialData = async () => {
  if (!db) return;

  try {
    // Verificar se já tem dados
    const cidadesCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM cidades');
    if (cidadesCount && cidadesCount.count > 0) {
      return; // Já tem dados
    }

    // Inserir cidades principais
    await db.execAsync(`
      INSERT INTO cidades (id, nome, estado, sigla, terminal) VALUES
      ('1', 'São Paulo', 'São Paulo', 'SP', 'Terminal Tietê'),
      ('2', 'Rio de Janeiro', 'Rio de Janeiro', 'RJ', 'Rodoviária Novo Rio'),
      ('3', 'Belo Horizonte', 'Minas Gerais', 'MG', 'Terminal Rodoviário'),
      ('4', 'Brasília', 'Distrito Federal', 'DF', 'Rodoviária de Brasília'),
      ('5', 'Salvador', 'Bahia', 'BA', 'Terminal Rodoviário'),
      ('6', 'Curitiba', 'Paraná', 'PR', 'Terminal Rodoferroviário'),
      ('7', 'Porto Alegre', 'Rio Grande do Sul', 'RS', 'Terminal Rodoviário'),
      ('8', 'Recife', 'Pernambuco', 'PE', 'Terminal Integrado'),
      ('9', 'Fortaleza', 'Ceará', 'CE', 'Terminal Rodoviário'),
      ('10', 'Manaus', 'Amazonas', 'AM', 'Terminal Rodoviário'),
      ('11', 'Horizontina', 'Rio Grande do Sul', 'RS', 'Terminal Rodoviário'),
      ('12', 'Santa Rosa', 'Rio Grande do Sul', 'RS', 'Terminal Rodoviário');
    `);

    // Inserir companhias
    await db.execAsync(`
      INSERT INTO companhias (id, nome, logo, avaliacao, totalAvaliacoes, urlSite) VALUES
      ('1', 'Cometa', '', 4.5, 1200, 'https://www.viacaocometa.com.br'),
      ('2', 'Gontijo', '', 4.3, 980, 'https://www.gontijo.com.br'),
      ('3', 'Itapemirim', '', 4.6, 1500, 'https://www.itapemirim.com.br'),
      ('4', 'Kaissara', '', 4.4, 750, 'https://www.kaissara.com.br'),
      ('16', 'Eucatur', '', 4.2, 600, 'https://www.eucatur.com.br'),
      ('17', 'Ouro e Prata', '', 4.1, 500, 'https://www.ouroeprata.com.br'),
      ('18', 'Unesul', '', 4.0, 400, 'https://www.unesul.com.br');
    `);

    // Inserir usuários mock iniciais
    const usuariosCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM usuarios');
    if (usuariosCount && usuariosCount.count === 0) {
      await db.runAsync(
        `INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, dataNascimento) VALUES
         ('1', 'Administrador', 'admin@teste.com', '12345678', '(21) 99999-9999', '123.456.789-00', '1990-01-01'),
         ('2', 'Usuário Teste', 'usuario@teste.com', '12345678', '(21) 98888-8888', '987.654.321-00', '1995-05-15')`
      );
    }
  } catch (error) {
    console.error('Erro ao inserir dados iniciais:', error);
  }
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Banco de dados não inicializado. Chame initDatabase() primeiro.');
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};

