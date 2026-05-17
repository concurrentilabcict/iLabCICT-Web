import { createContext } from "react";

export interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, username: string) => void;
    logout: () => void;
    username: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);