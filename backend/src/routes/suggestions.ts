import { Router } from 'express';
import { EditSuggestionService } from '@services/EditSuggestionService';
import { AuthenticatedRequest, ApiResponse } from '@appTypes/index';
import { requireAuth } from '@middleware/auth';

const router = Router();

// Create a suggestion
router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        const suggestion = await EditSuggestionService.createSuggestion({
            ...req.body,
            authorId: req.user!.uid,
            authorName: req.user!.name || 'Anonymous',
        });
        res.json({ success: true, data: suggestion });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get context-specific suggestions (for detail pages)
router.get('/target/:targetId', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        const suggestions = await EditSuggestionService.getSuggestionsByTarget(req.params.targetId as string, req.user!.uid);
        res.json({ success: true, data: suggestions });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get suggestion count (for badges)
router.get('/target/:targetId/count', async (req, res) => {
    try {
        const count = await EditSuggestionService.getSuggestionCount(req.params.targetId as string);
        res.json({ success: true, data: { count } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Approve
router.post('/:id/approve', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        await EditSuggestionService.approveSuggestion(req.params.id as string, req.user!.uid);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Reject
router.post('/:id/reject', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        await EditSuggestionService.rejectSuggestion(req.params.id as string, req.user!.uid);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get single suggestion
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
        const suggestion = await EditSuggestionService.getSuggestion(req.params.id as string, req.user!.uid);
        res.json({ success: true, data: suggestion });
    } catch (err: any) {
        const status = err.message === 'Unauthorized' ? 403 : (err.message === 'Suggestion not found' ? 404 : 500);
        res.status(status).json({ success: false, error: err.message });
    }
});

export default router;
