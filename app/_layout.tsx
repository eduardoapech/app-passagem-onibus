import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TemaProvider, useTema } from "@/src/hooks/useTema";
import { TamanhoFonteProvider } from "@/src/hooks/useTamanhoFonte";

function RootLayoutContent() {
  const { temaAtual, isLoading } = useTema();
  
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={isLoading ? 'auto' : (temaAtual === 'dark' ? 'light' : 'dark')} />
    </>
  );
}

export default function RootLayout() {
  return (
    <TemaProvider>
      <TamanhoFonteProvider>
        <RootLayoutContent />
      </TamanhoFonteProvider>
    </TemaProvider>
  );
}