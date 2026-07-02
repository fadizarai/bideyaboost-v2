import { Router } from 'express';
import { getRecommendations, submitFeedback, chatAdvisor, enrichGuideScores } from './orientation.controller';

const router = Router();

router.post('/recommend', getRecommendations);
router.post('/enrich-scores', enrichGuideScores);
router.post('/feedback', submitFeedback);
router.post('/chat', chatAdvisor);

export default router;
