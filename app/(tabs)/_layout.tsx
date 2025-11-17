import { Tabs } from 'expo-router';
import {Footer} from '@/src/components/Footer';

export default function TabLayout() {
    return (
        <>
        <Tabs
            tabBar={() => <Footer />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen 
                name="home" 
                options={{ href: '/home', title: 'Início' }}
            />
            <Tabs.Screen 
                name="MinhasViagens" 
                options={{ href: '/MinhasViagens', title: 'Viagens' }}
            />
            <Tabs.Screen 
                name="Buscar" 
                options={{ href: '/Buscar', title: 'Buscar' }}
            />
            <Tabs.Screen 
                name="Favoritos" 
                options={{ href: '/Favoritos', title: 'Favoritos' }}
            />
            <Tabs.Screen 
                name="Perfil" 
                options={{ href: '/Perfil', title: 'Perfil' }}
            />
            {/* Rotas acessíveis via navegação mas não aparecem nas tabs */}
            <Tabs.Screen 
                name="Resultados" 
                options={{ href: null }}
            />
            <Tabs.Screen 
                name="Promocoes" 
                options={{ href: null }}
            />
            <Tabs.Screen 
                name="Ajuda" 
                options={{ href: null }}
            />
            <Tabs.Screen 
                name="HistoricoViagens" 
                options={{ href: null }}
            />
        </Tabs>
        </>
    );
}