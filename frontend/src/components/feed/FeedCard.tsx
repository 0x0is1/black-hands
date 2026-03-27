import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
  Layout
} from 'react-native-reanimated';
import { useTheme } from '@contexts/ThemeContext';
import { DSText } from '@ds/Text';
import { VoteButtons } from '@components/feed/VoteButtons';
import { WaybackButton } from '@components/feed/WaybackButton';
import { TweetEmbed } from '@components/feed/TweetEmbed';
import { useRelativeTime } from '@hooks/useRelativeTime';
import { useAuthContext } from '@contexts/AuthContext';
import { Post } from '@appTypes/index';

interface FeedCardProps {
  post: Post;
}

export function FeedCard({ post }: FeedCardProps) {
  const { tokens } = useTheme();
  const { user } = useAuthContext();
  const relativeTime = useRelativeTime(post.createdAt);

  const handleUserPress = () => {
    if (post.authorId === user?.uid) {
      router.push('/profile');
    } else {
      router.push(`/user/${post.authorId}`);
    }
  };

  const cardStyle = {
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify().damping(12)}
      layout={Layout.springify()}
      style={cardStyle}
    >
      <View style={styles.inner}>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/post/${post.id}`)}
        >
          <View style={styles.headerRow}>
            <DSText size="md" weight="bold" color="textPrimary" style={{ flex: 1 }} numberOfLines={1}>
              {post.title}
            </DSText>
            <DSText size="xs" color="textMuted">
              {relativeTime}
            </DSText>
          </View>

          <DSText
            size="base"
            color="textMuted"
            numberOfLines={3}
            ellipsizeMode="tail"
            style={{ marginBottom: tokens.spacing.sm }}
          >
            {post.description}
          </DSText>

          <TweetEmbed tweetUrl={post.tweetUrl} html={post.tweetEmbedHtml} interactive={false} />
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.metaRow}
            activeOpacity={0.6}
            onPress={handleUserPress}
          >
            <DSText size="sm" weight="semiBold" color="textMuted">
              @{post.authorName}
            </DSText>
          </TouchableOpacity>

          <View style={styles.actions}>
            <VoteButtons
              postId={post.id}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              iconSize={16}
            />
            <WaybackButton
              waybackUrl={post.waybackUrl}
              snapshotScreenshot={post.snapshotScreenshot}
            />
          </View>
        </View>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inner: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    flexWrap: 'wrap',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});