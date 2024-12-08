export const logger = {
    info: (message: string, meta?: Record<string, any>) => {
        console.log(`[INFO] ${message}`, meta || '');
    },
    warn: (message: string, meta?: Record<string, any>) => {
        console.warn(`[WARN] ${message}`, meta || '');
    },
    error: (message: string, meta?: Record<string, any>) => {
        console.error(`[ERROR] ${message}`, meta || '');
    }
}; 