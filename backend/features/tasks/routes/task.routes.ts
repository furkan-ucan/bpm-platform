import { Router, RequestHandler, Response, NextFunction } from 'express';
import { TaskController } from '../controllers/task.controller';
import { TaskService } from '../services/task.service';
import { TaskRepository } from '@/infrastructure/database/mongodb/repositories/TaskRepository';
import { BPMNEngine } from '@/core/bpmn/engine/bpmn-engine';
import { authenticate } from '@/features/auth/middleware/auth.middleware';
import { AuthenticatedRequest } from '@/features/auth/middleware/auth.middleware';
import { 
    validateCreateTask, 
    validateUpdateTask, 
    validateUpdateTaskStatus,
    validateTaskFilters 
} from '../validators/task.validator';

type AuthRequestHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => Promise<void>;

const router = Router();
const taskRepository = new TaskRepository();
const bpmnEngine = new BPMNEngine();
const taskService = new TaskService(taskRepository, bpmnEngine);
const taskController = new TaskController(taskService);

const asyncHandler = (fn: AuthRequestHandler): RequestHandler => (req, res, next) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
};

router.use(authenticate);

router.post('/', validateCreateTask, asyncHandler(taskController.createTask));
router.get('/', validateTaskFilters, asyncHandler(taskController.getTasks));
router.get('/:id', asyncHandler(taskController.getTask));
router.put('/:id', validateUpdateTask, asyncHandler(taskController.updateTask));
router.patch('/:id/status', validateUpdateTaskStatus, asyncHandler(taskController.updateTaskStatus));
router.delete('/:id', asyncHandler(taskController.deleteTask));

export default router; 