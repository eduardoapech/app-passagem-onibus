import { SplashScreen } from "@/src/screens/splash/index";
import { useAppFonts } from "@/src/hooks/fonts/use-fonts";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { AuthService } from "@/src/services/api/storage";
import { initDatabase } from "@/src/services/database";


export default function Index (){

    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const fontsLoaded = useAppFonts();

  useEffect(() => {
    // Esconde StatusBar e NavigationBar globalmente
    StatusBar.setHidden(true);
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (fontsLoaded) {
        try {
          // Inicializar banco de dados
          await initDatabase();
          const loggedIn = await AuthService.isLoggedIn();
          setIsAuthenticated(loggedIn);
        } catch (error) {
          console.error('Erro ao inicializar banco:', error);
        } finally {
          setTimeout(() => setIsLoading(false), 2000);
        }
      }
    };
    checkAuth();
  }, [fontsLoaded]);

  if (isLoading || !fontsLoaded) {
    return <SplashScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/login" />;

};