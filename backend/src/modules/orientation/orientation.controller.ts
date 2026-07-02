import { Request, Response } from 'express';
import prisma from '../../database/prisma';
import { AiAdvisorService } from './ai-advisor.service';
import { enrichRecommendationsWithGuide } from './guide-enrichment.service';

type OrientationRec = {
    id?: string;
    programId?: string;
    institution?: string;
    university?: string;
    specialty?: string | null;
    field?: string;
    domain?: string;
    score?: number;
    explanation?: string | Record<string, unknown>;
    admission_probability?: number | null;
    admission_score_last?: number | null;
    admission_score_min?: number | null;
    [key: string]: unknown;
};

function toProgramInfo(rec: OrientationRec) {
    const institution = rec.institution ?? '';
    const specialty = rec.specialty && rec.specialty !== rec.field ? rec.specialty : institution;
    return {
        university: rec.university ?? '',
        specialty,
        domain: rec.domain ?? rec.field ?? 'General',
    };
}

// Tunisian Bac types validation
const VALID_BAC_TYPES = ['Math', 'Science', 'Tech', 'Info', 'Eco', 'Letters'];

export const getRecommendations = async (req: Request, res: Response) => {
    try {
        const {
            studentId,
            bacType,
            bacAverage,
            psychotechScore,
            interests,
            psychoVector,
            subjectsScores,
            subjects,
            region,
            homeRegion,
            preferredRegions,
        } = req.body;

        // Validate input
        if (!bacType || !VALID_BAC_TYPES.includes(bacType)) {
            return res.status(400).json({ 
                error: 'Invalid bacType', 
                validTypes: VALID_BAC_TYPES 
            });
        }
        if (typeof bacAverage !== 'number' || bacAverage < 0 || bacAverage > 20) {
            return res.status(400).json({ error: 'bacAverage must be between 0 and 20' });
        }

        // Find or create student
        let student = studentId ? await prisma.student.findUnique({ where: { id: studentId } }) : null;
        
        if (!student) {
            // Create user and student profile
            const user = await prisma.user.create({
                data: {
                    email: `student_${Date.now()}@bideya.tn`,
                    name: "Étudiant Bideya",
                    passwordHash: "temporary"
                }
            });

            student = await prisma.student.create({
                data: {
                    userId: user.id,
                    bacType,
                    bacAverage,
                    subjectsScores: subjectsScores || subjects || {},
                    psychotechScore: psychotechScore || null,
                    interests: interests || []
                }
            });
        } else {
            // Update student profile with latest data
            student = await prisma.student.update({
                where: { id: student.id },
                data: {
                    bacType,
                    bacAverage,
                    subjectsScores: subjectsScores || subjects || student.subjectsScores || {},
                    psychotechScore: psychotechScore || student.psychotechScore,
                    interests: interests || student.interests
                }
            });
        }

        // Call AI Service
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        
        let mappedBacType = student.bacType;
        if (mappedBacType === 'Science') mappedBacType = 'Sciences';
        if (mappedBacType === 'Tech') mappedBacType = 'Technique';
        if (mappedBacType === 'Info') mappedBacType = 'Informatique';
        if (mappedBacType === 'Eco') mappedBacType = 'Economie';
        if (mappedBacType === 'Letters') mappedBacType = 'Lettres';

        const resolvedRegion = region || homeRegion || 'Tunis';
        const resolvedPreferredCity =
            (Array.isArray(preferredRegions) && preferredRegions[0]) || homeRegion || resolvedRegion;
        const resolvedSubjectsScores =
            (subjectsScores && Object.keys(subjectsScores).length > 0 && subjectsScores) ||
            (subjects && Object.keys(subjects).length > 0 && subjects) ||
            student.subjectsScores;

        const aiRecommendPath = process.env.AI_RECOMMEND_PATH || '/recommend';
        const aiResponse = await fetch(`${aiServiceUrl}${aiRecommendPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bac_type: mappedBacType,
                bac_score: student.bacAverage,
                region: resolvedRegion,
                preferred_city: resolvedPreferredCity,
                subjects_scores: resolvedSubjectsScores && Object.keys(resolvedSubjectsScores).length > 0 ? resolvedSubjectsScores : {
                    math: student.bacAverage,
                    physics: student.bacAverage,
                    science: student.bacAverage
                },
                interests: student.interests,
                psycho_vector: psychoVector || null
            })
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error('AI Service error:', errorText);
            throw new Error('AI Service unavailable');
        }

        const data: any = await aiResponse.json();
        const rawRecommendations = data.recommendations || [];
        const recommendations = enrichRecommendationsWithGuide(
            rawRecommendations.map((rec: any) => ({
                ...rec,
                admission_probability: rec.admission_probability ?? rec.admissionProbability ?? null,
            })),
            { bacType },
        ) as OrientationRec[];

        // Optionally enhance with LLM advisor (can be disabled for performance)
        let enhancedRecommendations = recommendations;
        let summary = '';
        
        if (process.env.ENABLE_LLM_ADVISOR === 'true' && recommendations.length > 0) {
            const advisor = new AiAdvisorService();
            enhancedRecommendations = await Promise.all(recommendations.slice(0, 5).map(async (rec) => {
                try {
                    const richExplanation = await advisor.generatePersonalizedExplanation(
                        { bacType, bacAverage, psychotechScore, interests },
                        toProgramInfo(rec)
                    );
                    return { ...rec, llmExplanation: richExplanation };
                } catch {
                    return rec;
                }
            }));
            
            // Add remaining recommendations without LLM enhancement
            enhancedRecommendations = [...enhancedRecommendations, ...recommendations.slice(5)];

            try {
                summary = await advisor.generateRecommendationsSummary(
                    { bacType, bacAverage, interests },
                    recommendations.slice(0, 3).map(toProgramInfo)
                );
            } catch {
                summary = '';
            }
        }

        // Save recommendations to DB
        for (const rec of recommendations) {
            if (!rec.programId) continue;
            try {
                await prisma.recommendation.create({
                    data: {
                        studentId: student.id,
                        programId: rec.programId,
                        rank: recommendations.indexOf(rec) + 1,
                        score: typeof rec.score === 'number' ? rec.score : 0.5,
                        explanation: typeof rec.explanation === 'object' && rec.explanation !== null
                            ? JSON.stringify(rec.explanation)
                            : rec.explanation ?? null,
                    }
                });
            } catch (e) {
                // Program might not exist yet, skip
                console.warn(`Could not save recommendation for program ${rec.programId}`);
            }
        }

        res.json({ 
            student: { id: student.id, bacType: student.bacType, bacAverage: student.bacAverage },
            recommendations: enhancedRecommendations, 
            advisorSummary: summary,
            totalCandidates: data.total_candidates ?? data.totalCandidates
        });
    } catch (error: any) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch recommendations' });
    }
};

export const enrichGuideScores = async (req: Request, res: Response) => {
    try {
        const { recommendations, bacType } = req.body as {
            recommendations?: Record<string, unknown>[];
            bacType?: string;
        };
        if (!Array.isArray(recommendations)) {
            return res.status(400).json({ error: 'recommendations array required' });
        }
        res.json({ recommendations: enrichRecommendationsWithGuide(recommendations, { bacType }) });
    } catch (error: any) {
        console.error('Error enriching guide scores:', error);
        res.status(500).json({ error: error.message || 'Failed to enrich recommendations' });
    }
};

export const submitFeedback = async (req: Request, res: Response) => {
    try {
        const { recommendationId, studentId, programId, rating, comment, features } = req.body;

        // Validate rating
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Verify student exists
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Save feedback to DB
        const feedback = await prisma.feedback.create({
            data: {
                recommendationId,
                studentId,
                rating,
                comment: comment || null,
                processedByAi: false
            }
        });

        // Forward to AI Service for online learning
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        try {
            const aiResponse = await fetch(`${aiServiceUrl}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recommendationId,
                    studentId,
                    programId,
                    rating,
                    features: features || {
                        bacAverage: student.bacAverage || 10,
                        psychotechScore: student.psychotechScore || 0.5,
                        domain_match_score: 0.5,
                        interests_text: (student.interests || []).join(' ').toLowerCase()
                    }
                })
            });

            if (aiResponse.ok) {
                await prisma.feedback.update({
                    where: { id: feedback.id },
                    data: { processedByAi: true }
                });
            }
        } catch (aiError) {
            console.warn('AI feedback processing failed, will retry later:', aiError);
        }

        res.json({ 
            success: true, 
            feedback: {
                id: feedback.id,
                rating: feedback.rating,
                processedByAi: feedback.processedByAi
            },
            message: rating >= 4 
                ? 'شكراً! تقييمك يساعد في تحسين التوصيات'
                : 'شكراً على ملاحظاتك. سنحسن توصياتنا'
        });
    } catch (error: any) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: error.message || 'Failed to submit feedback' });
    }
};

export const chatAdvisor = async (req: Request, res: Response) => {
    try {
        const { studentId, messages } = req.body;

        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        const advisor = new AiAdvisorService();
        const response = await advisor.getChatResponse(
            {
                bacType: student.bacType as string,
                bacAverage: student.bacAverage as number,
                psychotechScore: student.psychotechScore || undefined,
                interests: student.interests
            },
            messages
        );

        res.json(response);
    } catch (error: any) {
        console.error('Error in chat advisor:', error);
        res.status(500).json({ error: error.message || 'Failed to get chat response' });
    }
};

