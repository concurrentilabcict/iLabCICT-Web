import { createContext } from "react";

export interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, name: string, role: string) => void;
    logout: () => void;
    name: string;
    role: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);