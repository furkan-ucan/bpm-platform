import { type Request, type Response, type NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

import { ValidationError } from '@/shared/errors/types/app-error';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map(error => error.msg);
        throw new ValidationError(messages.join(', '));
    }
    next();
};

export const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Geçerli bir email adresi giriniz'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Şifre en az 6 karakter olmalıdır'),
    handleValidationErrors
];

export const validateRegister = [
    body('email')
        .isEmail()
        .withMessage('Geçerli bir email adresi giriniz'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Şifre en az 6 karakter olmalıdır'),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('Ad alanı zorunludur'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Soyad alanı zorunludur'),
    handleValidationErrors
]; 