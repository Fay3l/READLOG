import { ButtonPrimary } from "@/components/buttons/buttonprimary";
import { Screen } from "@/components/screen";
import { StepDots } from "@/components/stepdots";
import { TagStatus } from "@/components/tagstatus";
import { useTheme } from "@/constants/themecontext";
import { useState } from "react";
import { TimePickerField } from '@/components/timepickerfield'
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/lib/api";
import { router } from "expo-router";
import { useToast } from "@/components/toast/toast_context";


export default function Goals() {
    const theme = useTheme()
    const {show} = useToast()
    const [readingGoal, setReadingGoal] = useState(4)
    let genres = {
        "roman": false,
        "sf": false,
        "essai": false,
        "polar": false,
        "histoire": false
    }
    const [preferredGenres, setPreferredGenres] = useState(genres)
    const [time, setTime] = useState('21:00');
    let days = {
        "mon": true,
        "tue": false,
        "wed": false,
        "thu": false,
        "fri": false,
        "sat": false,
        "sun": false,
    }
    const [reminderDays, setReminderDays] = useState(days)
    const complete_onboarding = async () => {
        const onboarding = {
            "reading_goal": readingGoal,
            "preferred_genres": Object.entries(preferredGenres)
                .filter(([, isPreferred]) => isPreferred)
                .map(([genre]) => genre),
            "reminder_time": time,
            "reminder_days": Object.entries(reminderDays)
                .filter(([, isReminder]) => isReminder)
                .map(([day]) => day),
        }
        try {
            await api.patch('/users/onboarding', onboarding);
            router.replace('/(tabs)');            
        } catch (err: any) {
            show('Erreur onboarding :', err.response?.data?.detail)
            console.error('Erreur onboarding :', err.response?.data?.detail);
        }
    }
    return (
        <Screen>
            <SafeAreaView style={{ margin: 20 }}>
                <View>
                    <StepDots current={2} total={3}></StepDots>
                </View>
                <View style={{ gap: 5 }}>
                    <Text style={{ fontSize: theme.fontSizes.xl, color: theme.colors.text.primary, fontFamily: theme.fonts.playfair.regular }}>Objectif annuel</Text>
                    <Text style={{ color: theme.colors.text.secondary, fontSize: theme.fontSizes.sm }}>Etape 3 sur 3 - Personnalise</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 8, margin: 10 }}>
                    <TouchableOpacity onPress={() => setReadingGoal(4)} >
                        <TagStatus is_active={readingGoal === 4} status="4 livres"></TagStatus>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() => setReadingGoal(6)} >
                        <TagStatus is_active={readingGoal === 6} status="6 livres"></TagStatus>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() => setReadingGoal(12)} >
                        <TagStatus is_active={readingGoal === 12} status="12 livres"></TagStatus>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() => setReadingGoal(24)} >
                        <TagStatus is_active={readingGoal === 24} status="24 livres"></TagStatus>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() => setReadingGoal(52)} >
                        <TagStatus is_active={readingGoal === 52} status="52 livres"></TagStatus>
                    </TouchableOpacity >
                </View>
                <View>
                    <Text style={{ color: theme.colors.text.secondary, fontSize: theme.fontSizes.sm }}>Genres que tu aimes</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 8, margin: 10 }}>
                    <TouchableOpacity onPress={() => setPreferredGenres({ ...preferredGenres, roman: !preferredGenres.roman })} >
                        <TagStatus is_active={preferredGenres.roman} status="Roman"></TagStatus>
                    </TouchableOpacity >
                    <TouchableOpacity onPress={() => setPreferredGenres({ ...preferredGenres, sf: !preferredGenres.sf })}>
                        <TagStatus is_active={preferredGenres.sf} status=" SF "></TagStatus>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setPreferredGenres({ ...preferredGenres, essai: !preferredGenres.essai })}>
                        <TagStatus is_active={preferredGenres.essai} status="Essai"></TagStatus>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setPreferredGenres({ ...preferredGenres, polar: !preferredGenres.polar })}>
                        <TagStatus is_active={preferredGenres.polar} status="Polar"></TagStatus>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setPreferredGenres({ ...preferredGenres, histoire: !preferredGenres.histoire })}>
                        <TagStatus is_active={preferredGenres.histoire} status="Histoire"></TagStatus>
                    </TouchableOpacity>
                </View>
                <View>
                    <TimePickerField value={time} onChange={setTime} />
                    <View style={{ flexDirection: "row", gap: 8, margin: 10, justifyContent: "flex-start", width: "90%", flexWrap: "wrap" }}>
                        <TouchableOpacity onPress={() => setReminderDays({ ...reminderDays, mon: !reminderDays.mon })} >
                            <TagStatus is_active={reminderDays.mon} status="Lundi"></TagStatus>
                        </TouchableOpacity >
                        <TouchableOpacity onPress={() => setReminderDays({ ...reminderDays, tue: !reminderDays.tue })}>
                            <TagStatus is_active={reminderDays.tue} status="Mardi"></TagStatus>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setReminderDays({ ...reminderDays, wed: !reminderDays.wed })}>
                            <TagStatus is_active={reminderDays.wed} status="Mercredi"></TagStatus>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setReminderDays({ ...reminderDays, thu: !reminderDays.thu })}>
                            <TagStatus is_active={reminderDays.thu} status="Jeudi"></TagStatus>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setReminderDays({ ...reminderDays, fri: !reminderDays.fri })}>
                            <TagStatus is_active={reminderDays.fri} status="Vendredi"></TagStatus>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setReminderDays({ ...reminderDays, sat: !reminderDays.sat })}>
                            <TagStatus is_active={reminderDays.sat} status="Samedi"></TagStatus>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setReminderDays({ ...reminderDays, sun: !reminderDays.sun })}>
                            <TagStatus is_active={reminderDays.sun} status="Dimanche"></TagStatus>
                        </TouchableOpacity>
                    </View>
                </View>
                <ButtonPrimary style={{ marginTop: 15 }} title='Commencer →' onPress={() => { void complete_onboarding(); }}></ButtonPrimary>
            </SafeAreaView>
        </Screen>
    )
}