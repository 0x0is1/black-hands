import { useEffect, useState } from 'react';
import { getUserPosts } from '@services/api';
import { Post } from '@appTypes/index';

interface ProfileHook {
    posts: Post[];
    totalUpvotes: number;
    loading: boolean;
    error: string | null;
}

export function useProfile(userId: string): ProfileHook {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        setError(null);
        getUserPosts(userId).then((result) => {
            setPosts(result);
            setLoading(false);
        }).catch((err) => {
            setError(err.message || 'Failed to load profile');
            setLoading(false);
        });
    }, [userId]);

    const totalUpvotes = posts.reduce((acc, p) => acc + p.upvotes, 0);

    return { posts, totalUpvotes, loading, error };
}

