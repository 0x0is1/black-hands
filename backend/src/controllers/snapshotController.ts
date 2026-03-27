import { Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { SnapshotService } from '@services/SnapshotService';
import { AuthenticatedRequest, ApiResponse } from '@appTypes/index';

export const getSnapshot = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { url } = req.body as { url?: string };

    if (!url || typeof url !== 'string') {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid or missing URL',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    let snapshot: {
      screenshotBase64: string;
      htmlContent: string;
      timestamp: string;
    } | null = null;

    try {
      snapshot = await SnapshotService.createSnapshotWithRetry(url);
    } catch (error) {
      console.error('Snapshot error:', error);
    }

    const response: ApiResponse<{
      screenshotBase64: string | null;
      htmlContent: string | null;
      timestamp: string | null;
    }> = {
      success: true,
      data: {
        screenshotBase64: snapshot?.screenshotBase64 || null,
        htmlContent: snapshot?.htmlContent || null,
        timestamp: snapshot?.timestamp || null,
      },
    };

    res.json(response);
  }
);