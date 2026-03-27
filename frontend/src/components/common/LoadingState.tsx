import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { DSText } from '@ds/Text';

interface LoadingStateProps {
    message?: string;
    fullScreen?: boolean;
}

export function LoadingState({ message = 'Loading...', fullScreen = false }: LoadingStateProps) {
    const { tokens } = useTheme();

    const containerStyle = [
        styles.container,
        fullScreen && { flex: 1, backgroundColor: tokens.colors.background }
    ];

    return (
        <View style={containerStyle}>
            <ActivityIndicator size="large" color={tokens.colors.accent} />
            {message && (
                <DSText size="sm" color="textMuted" style={styles.text}>
                    {message}
                </DSText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 12,
    },
    text: {
        textAlign: 'center',
    },
});
