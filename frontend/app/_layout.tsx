import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
    useFonts,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { ThemeProvider, useTheme } from '@contexts/ThemeContext';
import { AuthProvider } from '@contexts/AuthContext';
import { ToastProvider } from '@contexts/ToastContext';
import { registerBackgroundFetchAsync } from '@tasks/backgroundCheck';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFeed } from '@services/api';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

function RootLayoutInner() {
    const { tokens, colorMode } = useTheme();
    const [fontsLoaded] = useFonts({
        PlusJakartaSans_400Regular,
        PlusJakartaSans_500Medium,
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_700Bold,
        PlusJakartaSans_800ExtraBold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    useEffect(() => {
        Notifications.requestPermissionsAsync();
        registerBackgroundFetchAsync();
    }, []);

    // Sync last seen post ID whenever app becomes active or on mount
    useEffect(() => {
        const syncLastSeen = async () => {
            try {
                const { posts } = await getFeed();
                if (posts.length > 0) {
                    await AsyncStorage.setItem('last_seen_post_id', posts[0].id);
                }
            } catch (err) {
                console.log('Failed to sync last seen post:', err);
            }
        };
        syncLastSeen();
    }, []);

    if (!fontsLoaded) return null;

    return (
        <View style={{ flex: 1, backgroundColor: tokens.colors.background }}>
            <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: tokens.colors.background },
                }}
            />
        </View>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.root}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <ToastProvider>
                            <KeyboardProvider>
                                <RootLayoutInner />
                            </KeyboardProvider>
                        </ToastProvider>
                    </AuthProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
});

