import { useState, useEffect } from 'react';
import { getSuggestionCount } from '@services/api';

export function useSuggestionCount(targetId: string) {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!targetId) return;
        getSuggestionCount(targetId)
            .then(setCount)
            .finally(() => setLoading(false));
    }, [targetId]);

    const refreshCount = () => {
        getSuggestionCount(targetId).then(setCount);
    };

    return { count, loading, refreshCount };
}
