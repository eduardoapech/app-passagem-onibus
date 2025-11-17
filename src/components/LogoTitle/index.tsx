import {View, Image, Text}from "react-native"
import { styles } from "./style";

export const LogoTitle = () =>{
    return(
        
        <View style={styles.container}>
            <Image source={require("@/assets/images/Logo.png")}></Image>
            <Text  style={styles.text}>GetMoney</Text>
        </View>
    );
};