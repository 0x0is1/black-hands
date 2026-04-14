import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getSuggestionById, approveEditSuggestion, rejectEditSuggestion } from '@services/api';
import { EditSuggestion } from '@appTypes/index';
import { useTheme } from '@contexts/ThemeContext';
import { NavBar } from '@components/common/NavBar';
import { DSText } from '@ds/Text';
import { DSButton } from '@ds/Button';
import { DiffView } from '@components/suggestions/DiffView';
import { useFeedback } from '@contexts/FeedbackContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SuggestionReview() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { tokens } = useTheme();
    const { playSuccess, playTick } = useFeedback();
    const [suggestion, setSuggestion] = useState<EditSuggestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            getSuggestionById(id)
                .then(setSuggestion)
                .catch(() => Alert.alert('Error', 'Failed to load suggestion'))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!id) return;
        setSubmitting(true);
        try {
            if (action === 'approve') {
                await approveEditSuggestion(id);
                playSuccess();
                Alert.alert('Success', 'Changes applied successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                await rejectEditSuggestion(id);
                playTick();
                Alert.alert('Rejected', 'Suggestion has been rejected.', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Operation failed');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: tokens.colors.background }]}>
                <ActivityIndicator size="large" color={tokens.colors.accent} />
            </View>
        );
    }

    if (!suggestion) {
        return (
            <View style={[styles.center, { backgroundColor: tokens.colors.background }]}>
                <DSText color="textMuted">Suggestion not found.</DSText>
                <View style={{ marginTop: 20 }}>
                    <DSButton label="Go Back" onPress={() => router.back()} variant="outline" />
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: tokens.colors.background }}>
            <NavBar title="Review Suggestion" showBack />

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInDown.duration(400)}>
                    <View style={styles.header}>
                        <DSText size="xl" weight="bold">Proposed Changes</DSText>
                        <DSText size="sm" color="textMuted">By @{suggestion.authorName}</DSText>
                    </View>

                    {Object.keys(suggestion.suggestedData).map((key) => {
                        const originalValue = suggestion.originalData[key];
                        const suggestedValue = suggestion.suggestedData[key];
                        if (JSON.stringify(originalValue) === JSON.stringify(suggestedValue)) return null;

                        return (
                            <DiffView
                                key={key}
                                label={key}
                                original={originalValue}
                                suggested={suggestedValue}
                            />
                        );
                    })}

                    <View style={styles.actions}>
                        <View style={styles.btnRow}>
                            <DSButton
                                label="Approve & Apply"
                                onPress={() => handleAction('approve')}
                                variant="solid"
                                fullWidth
                                loading={submitting}
                            />
                        </View>
                        <View style={styles.btnRow}>
                            <DSButton
                                label="Reject Suggestion"
                                onPress={() => handleAction('reject')}
                                variant="outline"
                                fullWidth
                                loading={submitting}
                            />
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 24 },
    actions: { marginTop: 32, gap: 12 },
    btnRow: { height: 56, marginBottom: 12 },
});
