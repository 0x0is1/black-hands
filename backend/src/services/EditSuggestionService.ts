import { db } from '@config/firebase';
import { EditSuggestion, EditSuggestionStatus, Post, CancelledPerson } from '@appTypes/index';
import { admin } from '@config/firebase';
import { NotificationService } from './NotificationService';
import { UserService } from './UserService';
import logger from '@utils/logger';

export class EditSuggestionService {
    private static collection = db.collection('edit_suggestions');

    static async createSuggestion(data: Omit<EditSuggestion, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<EditSuggestion> {
        const now = admin.firestore.Timestamp.now();
        const docRef = await this.collection.add({
            ...data,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        });

        const result = {
            id: docRef.id,
            ...data,
            status: 'pending' as EditSuggestionStatus,
            createdAt: now,
            updatedAt: now,
        };

        // Notify OP
        try {
            const opProfile = await UserService.getUser(data.opId);
            if (opProfile?.fcmToken) {
                const title = '💡 New Edit Suggestion';
                const body = `${data.authorName} suggested an improvement to your ${data.targetType}.`;
                await NotificationService.sendPushNotification(opProfile.fcmToken, title, body, {
                    type: 'edit_suggestion',
                    targetId: data.targetId,
                    targetType: data.targetType,
                    suggestionId: docRef.id
                });
            }
        } catch (err) {
            logger.error('Failed to notify OP of suggestion', { err });
        }

        return result;
    }

    static async getSuggestionsByTarget(targetId: string, userId: string): Promise<EditSuggestion[]> {
        // Only the OP or the author can see suggestions
        const snapshot = await this.collection
            .where('targetId', '==', targetId)
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .get();

        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EditSuggestion));

        // Security check: filter in-memory if query was broad, but usually we filter by target
        return results.filter(s => s.opId === userId || s.authorId === userId);
    }

    static async approveSuggestion(suggestionId: string, userId: string): Promise<void> {
        const suggestionDoc = await this.collection.doc(suggestionId).get();
        if (!suggestionDoc.exists) throw new Error('Suggestion not found');

        const suggestion = { id: suggestionId, ...suggestionDoc.data() } as EditSuggestion;
        if (suggestion.opId !== userId) throw new Error('Unauthorized');
        if (suggestion.status !== 'pending') throw new Error('Suggestion already processed');

        const now = admin.firestore.Timestamp.now();

        // 1. Update the original document
        const targetCollection = suggestion.targetType === 'post' ? 'posts' : 'cancelled_persons';
        await db.collection(targetCollection).doc(suggestion.targetId).update({
            ...suggestion.suggestedData,
            updatedAt: now
        });

        // 2. Mark as approved
        await suggestionDoc.ref.update({
            status: 'approved',
            updatedAt: now
        });

        // 3. Mark all other pending suggestions for this target as rejected? 
        // No, maybe let OP decide. But we'll mark this one as done.
    }

    static async rejectSuggestion(suggestionId: string, userId: string): Promise<void> {
        const suggestionDoc = await this.collection.doc(suggestionId).get();
        if (!suggestionDoc.exists) throw new Error('Suggestion not found');

        const suggestion = { id: suggestionId, ...suggestionDoc.data() } as EditSuggestion;
        if (suggestion.opId !== userId) throw new Error('Unauthorized');

        await suggestionDoc.ref.update({
            status: 'rejected',
            updatedAt: admin.firestore.Timestamp.now()
        });
    }

    static async getSuggestionCount(targetId: string): Promise<number> {
        const snapshot = await this.collection
            .where('targetId', '==', targetId)
            .where('status', '==', 'pending')
            .count()
            .get();
        return snapshot.data().count;
    }

    static async getSuggestion(id: string, userId: string): Promise<EditSuggestion> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) throw new Error('Suggestion not found');
        const data = { id: doc.id, ...doc.data() } as EditSuggestion;
        if (data.opId !== userId && data.authorId !== userId) throw new Error('Unauthorized');
        return data;
    }
}
