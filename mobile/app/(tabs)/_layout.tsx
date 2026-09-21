import { Text, StyleSheet } from "react-native";
import { useMemo } from "react";
import { Tabs } from "expo-router";
import Books from "@/assets/icon/books.svg"
import BarChart from "@/assets/icon/bar-chart.svg"
import User from "@/assets/icon/user.svg"
import { useTheme } from "@/constants/themecontext";



export default function TabsLayout() {
    const styles = useLayoutStyles()
    const theme = useTheme()

    const EmojiText = ({ name }: { name: string }) => {
        return <Text style={styles.tabBarIcon}>{name}</Text>
    }

    const TabBarLabel = ({ name, focused }: { name: string; focused: boolean }) => {
        return <Text style={focused ? styles.tabBarLabelActive : styles.tabBarLabel}>{name}</Text>
    }

    return <Tabs screenOptions={{
        tabBarActiveTintColor: theme.colors.accent.default,
        tabBarInactiveTintColor: theme.colors.text.muted,
        tabBarStyle: {
            backgroundColor: theme.colors.bg.nav,
            borderTopColor: theme.colors.border.inactive,
            borderTopWidth: 0.5,
            position: 'absolute',
        },
    }}>
        <Tabs.Screen name="index" options={{
            headerShown: false,
            animation:"shift",
            tabBarIcon: () => <Books width={23} height={23} />,
            tabBarLabel: ({ focused }) => <TabBarLabel focused={focused} name="Bibliothèque" ></TabBarLabel>
        }}></Tabs.Screen>
        <Tabs.Screen name="stats" options={{
            headerShown: false,
            animation:"shift",
            tabBarIcon: () => <BarChart width={23} height={23} />,
            tabBarLabel: ({ focused }) => <TabBarLabel focused={focused} name="Statistiques" ></TabBarLabel>
        }}></Tabs.Screen>
        <Tabs.Screen name="profile" options={{
            headerShown: false,
            animation:"shift",
            tabBarIcon: () => <User width={23} height={23} />,
            tabBarLabel: ({ focused }) => <TabBarLabel focused={focused} name="Profil" ></TabBarLabel>
        }}></Tabs.Screen>
        <Tabs.Screen name="bookdetail"  options={{
            headerShown:false,
            href: null,
        }}>
        </Tabs.Screen>
    </Tabs>;
}

function useLayoutStyles() {
    const Theme = useTheme();
    return useMemo(() => StyleSheet.create({
        tabBarIcon: {
            fontSize: Theme.fontSizes.md
        },
        tabBarLabel: {
            color: Theme.colors.text.secondary,
        },
        tabBarLabelActive: {
            color: Theme.colors.accent.default,
        },
        tabBarStyle: {
            backgroundColor: Theme.colors.bg.nav,
            fontFamily: Theme.fonts.system.serif,
            position: 'absolute',
        }
    }), [Theme]);

}