import { type Request, type Response, type NextFunction } from 'express';
import { body, query, validationResult, param } from 'express-validator';

import { ValidationError } from '@/shared/errors/types/app-error';

import { TaskStatus, TaskPriority } from '../types/task.types';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError(errors.array().map(err => err.msg).join(', '));
    }
    next();
};

export const validateCreateTask = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Görev adı zorunludur')
        .isLength({ max: 100 })
        .withMessage('Görev adı en fazla 100 karakter olabilir'),
    body('processId')
        .notEmpty()
        .withMessage('Süreç ID zorunludur')
        .isMongoId()
        .withMessage('Geçersiz süreç ID formatı'),
    body('stepId')
        .notEmpty()
        .withMessage('Adım ID zorunludur')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Geçersiz adım ID formatı'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Açıklama en fazla 500 karakter olabilir'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Geçersiz öncelik değeri'),
    body('assignee')
        .optional()
        .isMongoId()
        .withMessage('Geçersiz atanan kullanıcı ID'),
    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Geçersiz tarih formatı'),
    handleValidationErrors
];

export const validateUpdateTaskStatus = [
    body('status')
        .isIn(Object.values(TaskStatus))
        .withMessage('Geçersiz görev durumu'),
    handleValidationErrors
];

export const validateTaskFilters = [
    query('status')
        .optional()
        .isIn(Object.values(TaskStatus))
        .withMessage('Geçersiz görev durumu'),
    query('priority')
        .optional()
        .isIn(Object.values(TaskPriority))
        .withMessage('Geçersiz öncelik'),
    query('fromDate')
        .optional()
        .isISO8601()
        .withMessage('Geçersiz başlangıç tarihi formatı'),
    query('toDate')
        .optional()
        .isISO8601()
        .withMessage('Geçersiz bitiş tarihi formatı'),
    query('page')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Sayfa numarası 0 veya daha büyük olmalıdır'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit 1-100 arasında olmalıdır'),
    handleValidationErrors
];

export const validateUpdateTask = [
    param('id')
        .isMongoId()
        .withMessage('Geçersiz görev ID'),
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Görev adı en fazla 100 karakter olabilir'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Açıklama en fazla 500 karakter olabilir'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Geçersiz öncelik değeri'),
    body('assignee')
        .optional()
        .isMongoId()
        .withMessage('Geçersiz atanan kullanıcı ID'),
    handleValidationErrors
];

export const validateTaskId = [
    param('id')
        .isMongoId()
        .withMessage('Geçersiz görev ID'),
    handleValidationErrors
]; 