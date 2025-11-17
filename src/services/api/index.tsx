import axios from 'axios';
import { AuthService } from './storage';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.passagemonibus.com/api',
  timeout: 30000,

  headers:{
    'Content-Type':'application/json',
  },

});


const ENDPOINTS_PUBLICOS = [
  '/auth/login',
  '/auth/register',
  '/cidades',
  '/companhias',
  '/passagens/buscar'
];

api.interceptors.request.use(async (config) => {
  const isEndpointPublico = ENDPOINTS_PUBLICOS.some(endpoint => 
    config.url?.includes(endpoint)
  );

  if (!isEndpointPublico) {
    const token = await AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AuthService.logout();
      throw new Error('Sessão expirada');
    }
    throw error;
  }
);
