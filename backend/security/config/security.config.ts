export interface SecurityConfig {
  cors: {
    origin: string | string[];
    methods: string[];
    allowedHeaders: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export const securityConfig: SecurityConfig = {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // limit her IP için
  },
}; 