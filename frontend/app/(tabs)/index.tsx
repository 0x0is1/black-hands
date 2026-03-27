import React, { useCallback } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '@contexts/ThemeContext';
import { DSText } from '@ds/Text';
import { DSDivider } from '@ds/Divider';
import { DSSkeletonCard } from '@ds/Skeleton';
import { FeedCard } from '@components/feed/FeedCard';
import { EmptyState } from '@components/common/EmptyState';
import { ErrorState } from '@components/common/ErrorState';
import { OfflineBanner } from '@components/common/OfflineBanner';
import { FAB } from '@components/common/FAB';
import { useFeed } from '@hooks/useFeed';
import { Post } from '@appTypes/index';
import { NavBar } from '@components/common/NavBar';

export default function HomeFeed() {
    const { tokens } = useTheme();
    const { posts, loading, error, refresh, loadMore } = useFeed();
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [isOffline, setIsOffline] = React.useState(false);

    React.useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOffline(!state.isConnected);
        });
        return unsubscribe;
    }, []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refresh();
        setIsRefreshing(false);
    }, [refresh]);

    const screenStyle = {
        flex: 1,
        backgroundColor: tokens.colors.background,
    };

    const renderItem = useCallback(({ item }: { item: Post }) => <FeedCard post={item} />, []);
    const keyExtractor = useCallback((item: Post) => item.id, []);
    const separator = useCallback(() => <View style={{ height: 0 }} />, []);

    if (loading && posts.length === 0) {
        return (
            <View style={screenStyle}>
                <NavBar />
                <DSSkeletonCard />
                <DSSkeletonCard />
                <DSSkeletonCard />
            </View>
        );
    }

    if (error && posts.length === 0) {
        return (
            <View style={screenStyle}>
                <NavBar />
                <ErrorState message={error} onRetry={refresh} />
            </View>
        );
    }

    return (
        <View style={screenStyle}>
            <NavBar />
            {isOffline && <OfflineBanner />}
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={separator}
                ListEmptyComponent={<EmptyState />}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={tokens.colors.accent}
                        colors={[tokens.colors.accent]}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: tokens.layout.screenPaddingBottom
                }}
            />
            <FAB />
        </View>
    );
}

