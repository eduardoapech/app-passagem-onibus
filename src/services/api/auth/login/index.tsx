import { LoginRequest, LoginResponse } from '@/src/interfaces/auth';
import { AuthDatabaseService } from '@/src/services/database/auth';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return await AuthDatabaseService.login(credentials);
};
