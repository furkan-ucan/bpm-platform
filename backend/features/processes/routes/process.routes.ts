import { Router } from 'express';
import { ProcessController } from '../controllers/process.controller';
import { ProcessService } from '../services/process.service';
import { ProcessRepository } from '@/infrastructure/database/mongodb/repositories/ProcessRepository';
import { authenticate } from '@/features/auth/middleware/auth.middleware';
import { 
    validateCreateProcess, 
    validateUpdateProcess, 
    validateProcessFilters, 
    validateProcessId 
} from '../validators/process.validator';
import { RequestHandler } from 'express';
import { BPMNEngine } from '@/core/bpmn/engine/bpmn-engine';

const router = Router();
const processRepository = new ProcessRepository();
const bpmnEngine = new BPMNEngine();
const processService = new ProcessService(processRepository, bpmnEngine);
const processController = new ProcessController(processService);

// Controller metodlarını RequestHandler'a dönüştür
const asyncHandler = (fn: any): RequestHandler => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.use(authenticate);

router.post('/', validateCreateProcess, asyncHandler(processController.createProcess));
router.get('/', validateProcessFilters, asyncHandler(processController.getProcesses));
router.put('/:id', validateUpdateProcess, asyncHandler(processController.updateProcess));
router.delete('/:id', validateProcessId, asyncHandler(processController.deleteProcess));
router.get('/:id', validateProcessId, asyncHandler(processController.getProcessById));

export const processRoutes = router;