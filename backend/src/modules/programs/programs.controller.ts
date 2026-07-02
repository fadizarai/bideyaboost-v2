import { Request, Response } from 'express';
import prisma from '../../database/prisma';

export const getPrograms = async (req: Request, res: Response) => {
    try {
        const { 
            domain, 
            city, 
            university, 
            bacType,
            minScore,
            page = '1', 
            limit = '50' 
        } = req.query;

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = {};
        if (domain) where.domain = { contains: domain as string, mode: 'insensitive' };
        if (city) where.city = { contains: city as string, mode: 'insensitive' };
        if (university) where.university = { contains: university as string, mode: 'insensitive' };
        if (bacType) where.requiredBacTypes = { has: bacType as string };
        if (minScore) where.minBacAverage = { lte: parseFloat(minScore as string) };

        const [programs, total] = await Promise.all([
            prisma.program.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { university: 'asc' }
            }),
            prisma.program.count({ where })
        ]);

        res.json({
            programs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ error: 'Failed to fetch programs' });
    }
};

export const getProgramById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const program = await prisma.program.findUnique({
            where: { id },
            include: {
                recommendations: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }

        res.json(program);
    } catch (error) {
        console.error('Error fetching program:', error);
        res.status(500).json({ error: 'Failed to fetch program' });
    }
};

export const getUniversities = async (req: Request, res: Response) => {
    try {
        const universities = await prisma.program.findMany({
            select: { university: true, city: true },
            distinct: ['university']
        });

        res.json(universities);
    } catch (error) {
        console.error('Error fetching universities:', error);
        res.status(500).json({ error: 'Failed to fetch universities' });
    }
};

export const getDomains = async (req: Request, res: Response) => {
    try {
        const domains = await prisma.program.findMany({
            select: { domain: true },
            distinct: ['domain'],
            where: { domain: { not: null } }
        });

        res.json(domains.map(d => d.domain).filter(Boolean));
    } catch (error) {
        console.error('Error fetching domains:', error);
        res.status(500).json({ error: 'Failed to fetch domains' });
    }
};
