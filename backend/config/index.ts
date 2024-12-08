export * from './env.config.js';
export * from './constants.js';

export interface SecurityConfig {
  cors: {
    allowedOrigins: string[];
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}