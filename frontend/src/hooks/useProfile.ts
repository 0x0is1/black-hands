import { useEffect, useState } from 'react';
import { Post, UserProfile } from '@appTypes/index';
import { getUserPosts, getUser } from '@services/api';

interface ProfileHook {
    profile: UserProfile | null;
    posts: Post[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useProfile(userId: string): ProfileHook {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        setError(null);
        try {
            const [pResult, postsResult] = await Promise.all([
                getUser(userId),
                getUserPosts(userId)
            ]);
            setProfile(pResult);
            setPosts(postsResult);
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    return { profile, posts, loading, error, refresh: fetchProfile };
}

