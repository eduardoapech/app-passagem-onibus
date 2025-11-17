import { useFonts } from 'expo-font';
import { 
  Montserrat_700Bold,
  Montserrat_600SemiBold,
  Montserrat_400Regular,
} from '@expo-google-fonts/montserrat';

import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';


export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    // Montserrat
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_400Regular,
    
    // Open Sans
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  return fontsLoaded;
};