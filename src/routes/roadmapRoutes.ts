// routes.roadmapRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import { generateRoadmap } from '../lib/gemini';
import { AssessmentData } from '../types/assessment';

const router: express.Router = express.Router();

router.post('/generate-roadmap', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { goal, skillLevel, focusAreas } = req.body;
        const { start, end } = req.query;

        if (!start || !end) {
            res.status(400).json({ error: 'Missing start or end week parameters' });
            return;
        }

        const startWeek = parseInt(start as string, 10);
        const endWeek = parseInt(end as string, 10);

        if (isNaN(startWeek) || isNaN(endWeek)) {
            res.status(400).json({ error: 'Invalid start or end week parameters' });
            return;
        }

        const data: AssessmentData = {
            goal,
            skillLevel,
            focusAreas,
            timeCommitment: 5,
            learningPreferences: [],
            learningStyle: 'visual',
            quizResponses: [],
        };

        const roadmap = await generateRoadmap(data);
        res.status(200).json(roadmap.weeks);
    } catch (error) {
        console.error('Error generating roadmap:', error);
        res.status(500).json({ error: 'Failed to generate roadmap.' });
    }
});

export default router;
