import { createContext } from "react";
import type { LoginProps } from "@/types/auth"

export interface AuthContextType {
    isAuthenticated: boolean;
    login: ({ id, accessToken, refreshToken, name, role, profilePicture }: LoginProps) => void;
    logout: () => void;
    name: string;
    role: string;
    profilePicture: string | null;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setProfilePicture: React.Dispatch<React.SetStateAction<string | null>>
};

export const AuthContext = createContext<AuthContextType | null>(null);
