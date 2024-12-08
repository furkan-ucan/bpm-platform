export const dateHelper = {
    formatDate: (date: Date, format: string = 'YYYY-MM-DD'): string => {
        return new Date(date).toISOString().split('T')[0];
    },

    addDays: (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    isExpired: (date: Date): boolean => {
        return new Date(date) < new Date();
    },

    getDateDifference: (date1: Date, date2: Date): number => {
        return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    }
}; 