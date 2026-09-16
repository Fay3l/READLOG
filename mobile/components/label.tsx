import { useTheme } from "@/constants/themecontext";
import { useMemo, useState } from "react";

import { View,Text,TextInput,StyleSheet } from "react-native";

interface LabelProps {
  value: string;
  setValue: (text: string) => void;
  name: string;
}

export function Label({value,name,setValue}: LabelProps){
    const styles = useStyles()
    const [isFocused, setIsFocused] = useState(false)
    return(
        <View>
            <Text style={styles.name}>{name}</Text>
            <TextInput
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChangeText={setValue}
                value={value}
                style={[styles.text_input, isFocused && styles.text_input_focus]}
            />
        </View>
    )
}

function useStyles(){
    const theme = useTheme()
    return useMemo(()=> StyleSheet.create({
        text_input:{
            padding:15,
            borderWidth:2,
            borderRadius: 15,
            borderColor:theme.colors.border.card,
            fontFamily: theme.fonts.dmSans.regular,
            color: theme.colors.text.primary
        },
        text_input_focus:{
            borderColor:theme.colors.border.focus,
        },
        name:{
            marginBottom:10,
            fontSize:theme.fontSizes.sm,
            color:theme.colors.text.label
        }
    }),[theme])
}