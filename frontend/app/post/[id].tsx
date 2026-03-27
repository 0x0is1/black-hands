import React from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '@contexts/ThemeContext';
import { usePost } from '@hooks/usePost';
import { DSText } from '@ds/Text';
import { DSDivider } from '@ds/Divider';
import { DSSkeletonCard } from '@ds/Skeleton';
import { TweetEmbed } from '@components/feed/TweetEmbed';
import { VoteButtons } from '@components/feed/VoteButtons';
import { WaybackButton } from '@components/feed/WaybackButton';
import { ErrorState } from '@components/common/ErrorState';
import { formatFullDate } from '@utils/formatters';

import { NavBar } from '@components/common/NavBar';

import { useAuthContext } from '@contexts/AuthContext';

export default function PostDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { tokens } = useTheme();
    const { user } = useAuthContext();
    const { post, loading, error } = usePost(id ?? '');

    const handleUserPress = () => {
        if (post?.authorId === user?.uid) {
            router.push('/profile');
        } else if (post) {
            router.push(`/user/${post.authorId}`);
        }
    };

    const screenStyle = {
        flex: 1,
        backgroundColor: tokens.colors.background,
    };

    const markdownStyles = {
        body: {
            color: tokens.colors.textPrimary,
            fontSize: tokens.fontSize.base,
            fontFamily: 'PlusJakartaSans_400Regular',
            lineHeight: 22,
        },
    };

    if (loading) {
        return (
            <View style={screenStyle}>
                <NavBar title="Gem post" showBack />
                <DSSkeletonCard />
                <DSSkeletonCard />
            </View>
        );
    }

    if (error || !post) {
        return (
            <View style={screenStyle}>
                <NavBar title="Post missing" showBack />
                <ErrorState message={error ?? 'Post not found'} onRetry={() => router.back()} />
            </View>
        );
    }

    return (
        <View style={screenStyle}>
            <NavBar title="Gem post" showBack />
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: tokens.layout.screenPaddingBottom }
                ]}
            >
                <View style={{ gap: tokens.spacing.lg }}>
                    <View style={styles.detailHeader}>
                        <DSText size="xl" weight="extraBold" color="textPrimary" style={{ flex: 1 }}>
                            {post.title}
                        </DSText>
                        <DSText size="sm" color="textMuted">
                            {formatFullDate(post.createdAt)}
                        </DSText>
                    </View>

                    <View style={styles.metaRow}>
                        <TouchableOpacity
                            style={styles.metaRow}
                            onPress={handleUserPress}
                        >
                            <DSText size="sm" weight="semiBold" color="textMuted">
                                @{post.authorName}
                            </DSText>
                        </TouchableOpacity>
                    </View>

                    <TweetEmbed tweetUrl={post.tweetUrl} html={post.tweetEmbedHtml} />

                    <Markdown style={markdownStyles}>{post.description}</Markdown>

                    <DSDivider />

                    <View style={styles.actionRow}>
                        <VoteButtons postId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} iconSize={18} />
                        <WaybackButton
                            waybackUrl={post.waybackUrl}
                            snapshotScreenshot={post.snapshotScreenshot}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
    content: { paddingHorizontal: 16, paddingVertical: 16 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
