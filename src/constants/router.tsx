import { useRouter } from 'expo-router';

export const useNavigation = () => {
  
  const router = useRouter();

  const navigateTo = {
    login: () => router.push('/auth/login'),
    register: () => router.push('/auth/register'),
    home:() => router.push('/home'),
    perfil: () => router.push('/Perfil'),
    metas: () => router.push('/Metas'),
    adicionarMeta: () => router.push('/AdicionarMeta'),
    back: () => router.back(),
  };

  return navigateTo;
};