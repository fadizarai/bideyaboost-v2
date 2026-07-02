import { Router } from 'express';
import { getPrograms, getProgramById, getUniversities, getDomains } from './programs.controller';

const router = Router();

router.get('/', getPrograms);
router.get('/universities', getUniversities);
router.get('/domains', getDomains);
router.get('/:id', getProgramById);

export default router;
