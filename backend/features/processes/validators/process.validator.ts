import { type Request, type Response, type NextFunction } from 'express';
import { body, query, param, validationResult, type ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationError } from '@/shared/errors/common/validation.error';
import { ProcessStatus } from '../types/process.types';
import { type UpdateProcessDTO } from '../dtos/process.dto';
import { ERROR_MESSAGES } from '@/shared/constants/error-messages';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const validationErrors = errors.array().map((err: ExpressValidationError) => ({
            field: err.type === 'field' ? err.path : undefined,
            value: err.type === 'field' ? err.value : undefined,
            message: err.msg
        }));

        throw new ValidationError('Validasyon hatası', validationErrors);
    }
    next();
};

export const validateCreateProcess = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage(ERROR_MESSAGES.PROCESS.VALIDATION.NAME_REQUIRED)
        .isLength({ max: 100 })
        .withMessage(ERROR_MESSAGES.PROCESS.VALIDATION.NAME_TOO_LONG),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage(ERROR_MESSAGES.PROCESS.VALIDATION.DESCRIPTION_TOO_LONG),
    body('bpmnXml')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.PROCESS.VALIDATION.BPMN_REQUIRED),
    handleValidationErrors
];

export const validateUpdateProcess = [
    param('id')
        .isMongoId()
        .withMessage(ERROR_MESSAGES.PROCESS.VALIDATION.INVALID_ID),
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage(ERROR_MESSAGES.PROCESS.VALIDATION.NAME_TOO_LONG),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage(ERROR_MESSAGES.PROCESS.VALIDATION.DESCRIPTION_TOO_LONG),
    body('status')
        .optional()
        .isIn(Object.values(ProcessStatus))
        .withMessage(ERROR_MESSAGES.PROCESS.INVALID_STATUS),
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
            throw new ValidationError(
                ERROR_MESSAGES.PROCESS.VALIDATION.UPDATED_AT_REQUIRED,
                { field: 'updatedAt', value: data.updatedAt }
            );
        }
    }

    static validateStatus(status: string) {
        if (!Object.values(ProcessStatus).includes(status as ProcessStatus)) {
            throw new ValidationError(
                ERROR_MESSAGES.PROCESS.INVALID_STATUS,
                { field: 'status', value: status }
            );
        }
    }
} 