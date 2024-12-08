export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user' | 'manager';
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    user: UserResponse;
}
