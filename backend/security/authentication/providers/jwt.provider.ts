import jwt from 'jsonwebtoken';

import { env } from '@/config';
import { AuthenticationError } from '@/shared/errors/common/authentication.error';

type TokenType = 'access' | 'refresh';

const getTokenSecret = (type: TokenType): string => {
    return type === 'access' ? env.jwt.secret : env.jwt.secret + '-refresh';
};

const getTokenExpiration = (type: TokenType): string => {
    return type === 'access' ? env.jwt.expiresIn : '7d';
};

export const generateToken = async (
    payload: object,
    type: TokenType = 'access'
): Promise<string> => {
    return jwt.sign(payload, getTokenSecret(type), {
        expiresIn: getTokenExpiration(type),
        algorithm: 'HS512'
    });
};

export const verifyToken = async (
    token: string,
    type: TokenType = 'access'
): Promise<any> => {
    try {
        return jwt.verify(token, getTokenSecret(type));
    } catch (error) {
        throw new AuthenticationError('Geçersiz token');
    }
}; 