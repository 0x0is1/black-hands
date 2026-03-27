import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@contexts/ThemeContext';
import { useCreatePost } from '@hooks/useCreatePost';
import { useAuthContext } from '@contexts/AuthContext';
import { DSText } from '@ds/Text';
import { DSInput } from '@ds/Input';
import { DSButton } from '@ds/Button';
import { TweetUrlInput } from '@components/post/TweetUrlInput';
import { MarkdownEditor } from '@components/post/MarkdownEditor';
import { TITLE_MAX_CHARS } from '@utils/constants';


import { NavBar } from '@components/common/NavBar';

export default function CreatePost() {
    const { tokens } = useTheme();
    const { user } = useAuthContext();
    const { fields, fieldErrors, submitting, setField, submit } = useCreatePost();
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        if (!user) {
            router.replace('/login');
        }
    }, [user]);

    const screenStyle = {
        flex: 1,
        backgroundColor: tokens.colors.background,
    };

    const tabBarStyle = {
        flexDirection: 'row' as const,
        borderBottomWidth: 1,
        borderBottomColor: tokens.colors.border,
    };

    const activeTabStyle = (active: boolean) => ({
        flex: 1,
        paddingVertical: tokens.spacing.md,
        alignItems: 'center' as const,
        borderBottomWidth: active ? 2 : 0,
        borderBottomColor: tokens.colors.accent,
    });

    return (
        <View style={screenStyle}>
            <NavBar title="Share a Gem" showBack />
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: tokens.layout.screenPaddingBottom }
                ]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ gap: tokens.spacing.lg }}>
                    <View>
                        <DSText size="sm" weight="medium" color="textMuted" style={{ marginBottom: tokens.spacing.xs }}>
                            Tweet URL
                        </DSText>
                        <TweetUrlInput
                            value={fields.tweetUrl}
                            onChange={(v) => setField('tweetUrl', v)}
                            error={fieldErrors.tweetUrl}
                        />
                    </View>
                    <View>
                        <View style={styles.titleRow}>
                            <DSText size="sm" weight="medium" color="textMuted">Title</DSText>
                            <DSText size="sm" color="textMuted">{`${fields.title.length}/${TITLE_MAX_CHARS}`}</DSText>
                        </View>
                        <DSInput
                            value={fields.title}
                            onChangeText={(v) => setField('title', v)}
                            placeholder="Headline of the controversy..."
                            maxLength={TITLE_MAX_CHARS}
                            accessibilityLabel="Title input"
                        />
                        {fieldErrors.title && (
                            <DSText size="sm" color="danger" style={{ marginTop: tokens.spacing.xs }}>{fieldErrors.title}</DSText>
                        )}
                    </View>
                    <View>
                        <View style={tabBarStyle}>
                            <View
                                style={activeTabStyle(!previewMode)}
                                accessibilityLabel="Write mode"
                                accessibilityRole="tab"
                            >
                                <DSText
                                    size="sm"
                                    weight="semiBold"
                                    color={!previewMode ? 'accent' : 'textMuted'}
                                    onPress={() => setPreviewMode(false)}
                                >
                                    Write
                                </DSText>
                            </View>
                            <View
                                style={activeTabStyle(previewMode)}
                                accessibilityLabel="Preview mode"
                                accessibilityRole="tab"
                            >
                                <DSText
                                    size="sm"
                                    weight="semiBold"
                                    color={previewMode ? 'accent' : 'textMuted'}
                                    onPress={() => setPreviewMode(true)}
                                >
                                    Preview
                                </DSText>
                            </View>
                        </View>
                        <View style={{
                            borderWidth: 1,
                            borderColor: tokens.colors.border,
                            padding: tokens.spacing.md,
                            minHeight: 120,
                            backgroundColor: tokens.colors.surface,
                        }}>
                            <MarkdownEditor
                                value={fields.description}
                                onChange={(v) => setField('description', v)}
                                previewMode={previewMode}
                                minHeight={120}
                            />
                        </View>
                        {fieldErrors.description && (
                            <DSText size="sm" color="danger" style={{ marginTop: tokens.spacing.xs }}>{fieldErrors.description}</DSText>
                        )}
                    </View>
                    <DSButton
                        label="Publish Gem"
                        onPress={submit}
                        variant="solid"
                        fullWidth
                        loading={submitting}
                        accessibilityLabel="Publish this Gem"
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: { paddingHorizontal: 16, paddingVertical: 16 },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
});

