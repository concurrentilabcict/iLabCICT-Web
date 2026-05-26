import { createContext } from "react";
import type { LoginProps } from "@/types/auth"

export interface AuthContextType {
    isAuthenticated: boolean;
    login: ({ token, name, role, profilePicture }: LoginProps) => void;
    logout: () => void;
    name: string;
    role: string;
    profilePicture: string | null;
    setProfilePicture: React.Dispatch<React.SetStateAction<string | null>>
};

export const AuthContext = createContext<AuthContextType | null>(null);