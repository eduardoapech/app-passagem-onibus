import { RegisterRequest, RegisterResponse } from '@/src/interfaces/auth';
import { AuthDatabaseService } from '@/src/services/database/auth';

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  return await AuthDatabaseService.register(data);
};
