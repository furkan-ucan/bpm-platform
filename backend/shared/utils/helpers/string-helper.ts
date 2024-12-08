export const stringHelper = {
    generateRandomString: (length: number): string => {
        return Math.random().toString(36).substring(2, length + 2);
    },

    slugify: (text: string): string => {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    },

    truncate: (str: string, length: number): string => {
        return str.length > length ? str.substring(0, length) + '...' : str;
    }
}; 