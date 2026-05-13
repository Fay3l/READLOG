import { Theme } from "@/constants/theme";

import { View,Text,TextInput,StyleSheet } from "react-native";

interface LabelProps {
  value: string;
  setValue: (text: string) => void;
  name: string;
}


export function Label({value,name,setValue}: LabelProps){
    return(
        <View>
            <Text style={{margin:6}}>{name}</Text>
            <TextInput onChangeText={setValue} value={value} style={styles.text_input}></TextInput>
        </View>
    )
}

const styles = StyleSheet.create({
    text_input: {
        borderColor: 'black',
        borderWidth: 0.7,
        borderRadius: Theme.radius.lg,
        padding: 5
    },
})