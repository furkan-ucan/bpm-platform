export interface LoginDTO {
    email: string;
    password: string;
}

export interface RegisterDTO extends LoginDTO {
    firstName: string;
    lastName: string;
}

export interface TokenDTO {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
} 