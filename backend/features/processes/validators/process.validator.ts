import { type Request, type Response, type NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';

import { ValidationError } from '@/shared/errors/types/app-error';
import { UpdateProcessDTO } from "@/shared/types/dtos/process.dto";
import { ProcessStatus } from "../types/process.types";

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map(error => error.msg);
        throw new ValidationError(messages.join(', '));
    }
    next();
};

export const validateCreateProcess = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Süreç adı zorunludur')
        .isLength({ max: 100 })
        .withMessage('Süreç adı en fazla 100 karakter olabilir'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Açıklama en fazla 500 karakter olabilir'),
    body('bpmnXml')
        .notEmpty()
        .withMessage('BPMN XML zorunludur'),
    handleValidationErrors
];

export const validateUpdateProcess = [
    param('id')
        .isMongoId()
        .withMessage('Geçersiz süreç ID'),
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Süreç adı en fazla 100 karakter olabilir'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Açıklama en fazla 500 karakter olabilir'),
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'archived'])
        .withMessage('Geçersiz süreç durumu'),
    handleValidationErrors
];

export const validateProcessFilters = [
    query('status')
        .optional()
        .isIn(['active', 'inactive', 'archived'])
        .withMessage('Geçersiz süreç durumu'),
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

export const validateProcessId = [
    param('id')
        .isMongoId()
        .withMessage('Geçersiz süreç ID'),
    handleValidationErrors
];

export class ProcessValidator {
    static validateUpdateData(data: UpdateProcessDTO) {
        if (!data.updatedAt) {
            throw new ValidationError("updatedAt alanı zorunludur");
        }
    }

    static validateStatus(status: string) {
        if (!Object.values(ProcessStatus).includes(status as ProcessStatus)) {
            throw new ValidationError("Geçersiz süreç durumu");
        }
    }
} 