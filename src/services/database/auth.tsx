import { getDatabase } from './index';
import { LoginRequest, LoginResponse, RegisterRequest } from '@/src/interfaces/auth';
import { Usuario } from '@/src/interfaces/usuario';
import { AuthService } from '../api/storage';

const generateToken = (userId: string): string => {
  return `token_${userId}_${Date.now()}`;
};

export const AuthDatabaseService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const db = getDatabase();
    
    const user = await db.getFirstAsync<{
      id: string;
      nome: string;
      email: string;
      telefone: string | null;
      cpf: string | null;
      dataNascimento: string | null;
      foto: string | null;
      rua: string | null;
      numero: string | null;
      complemento: string | null;
      bairro: string | null;
      cidade: string | null;
      estado: string | null;
      cep: string | null;
    }>('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [credentials.email, credentials.senha]);

    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    const usuario: Usuario = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone || '',
      cpf: user.cpf || '',
      dataNascimento: user.dataNascimento ? new Date(user.dataNascimento) : new Date(),
      foto: user.foto || undefined,
      endereco: user.rua ? {
        rua: user.rua,
        numero: user.numero || '',
        complemento: user.complemento || undefined,
        bairro: user.bairro || '',
        cidade: user.cidade || '',
        estado: user.estado || '',
        cep: user.cep || '',
      } : undefined,
      preferencias: {
        receberPromocoes: true,
        notificacoes: true,
      },
    };

    const response: LoginResponse = {
      token: generateToken(user.id),
      refreshToken: generateToken(user.id) + '_refresh',
      usuario,
    };

    await AuthService.login(response);
    return response;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const db = getDatabase();
    
    // Verificar se email já existe
    const existingUser = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM usuarios WHERE email = ?',
      [data.email]
    );

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const userId = Date.now().toString();
    const senha = data.senha; // Em produção, usar hash

    await db.runAsync(
      `INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, dataNascimento, rua, numero, complemento, bairro, cidade, estado, cep)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.nome,
        data.email,
        senha,
        data.telefone || null,
        data.cpf || null,
        data.dataNascimento ? data.dataNascimento.toISOString() : null,
        data.endereco?.rua || null,
        data.endereco?.numero || null,
        data.endereco?.complemento || null,
        data.endereco?.bairro || null,
        data.endereco?.cidade || null,
        data.endereco?.estado || null,
        data.endereco?.cep || null,
      ]
    );

    const usuario: Usuario = {
      id: userId,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone || '',
      cpf: data.cpf || '',
      dataNascimento: data.dataNascimento || new Date(),
      endereco: data.endereco,
      preferencias: {
        receberPromocoes: true,
        notificacoes: true,
      },
    };

    const response: LoginResponse = {
      token: generateToken(userId),
      refreshToken: generateToken(userId) + '_refresh',
      usuario,
    };

    await AuthService.login(response);
    return response;
  },
};

