import { useTheme } from "@/constants/themecontext";
import { useLabelStyles } from "@/hooks/useLabelStyles";

import { View,Text,TextInput,StyleSheet } from "react-native";

interface LabelProps {
  value: string;
  setValue: (text: string) => void;
  name: string;
}

export function Label({value,name,setValue}: LabelProps){
    const styles = useLabelStyles()
    return(
        <View>
            <Text style={{margin:6}}>{name}</Text>
            <TextInput onChangeText={setValue} value={value} style={styles.text_input}></TextInput>
        </View>
    )
}

