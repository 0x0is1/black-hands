import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getSuggestionsForTarget } from '@services/api';
import { EditSuggestion } from '@appTypes/index';
import { useTheme } from '@contexts/ThemeContext';
import { NavBar } from '@components/common/NavBar';
import { DSText } from '@ds/Text';
import { formatRelativeTime } from '@utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function SuggestionList() {
    const { targetId } = useLocalSearchParams<{ targetId: string }>();
    const { tokens } = useTheme();
    const [suggestions, setSuggestions] = useState<EditSuggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (targetId) {
            getSuggestionsForTarget(targetId)
                .then(setSuggestions)
                .finally(() => setLoading(false));
        }
    }, [targetId]);

    const renderItem = ({ item }: { item: EditSuggestion }) => (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}
            onPress={() => router.push(`/suggestions/review/${item.id}`)}
        >
            <View style={styles.itemHeader}>
                <DSText weight="bold" color="textPrimary">Suggested by @{item.authorName}</DSText>
                <DSText size="xs" color="textMuted">{formatRelativeTime(item.createdAt)}</DSText>
            </View>
            <DSText size="sm" color="textMuted" numberOfLines={2} style={styles.preview}>
                Check out the suggested changes to description and more...
            </DSText>
            <View style={styles.itemFooter}>
                <DSText size="xs" color="accent" weight="bold">VIEW CHANGES</DSText>
                <Ionicons name="chevron-forward" size={14} color={tokens.colors.accent} />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: tokens.colors.background }]}>
                <ActivityIndicator size="large" color={tokens.colors.accent} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: tokens.colors.background }}>
            <NavBar title="Edit Suggestions" showBack />
            <FlatList
                data={suggestions}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <DSText color="textMuted">No pending suggestions found.</DSText>
                    </View>
                }
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    list: { padding: 16 },
    item: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    preview: {
        marginBottom: 12,
    },
    itemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
