import { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { LoginProps } from "@/types/auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem("accessToken")
    );

    const [name, setName] = useState(
        localStorage.getItem("name") || ""
    );

    const [role, setRole] = useState(
        localStorage.getItem("role") || ""
    );

    const [profilePicture, setProfilePicture] = useState<string | null>(
        localStorage.getItem("profilePicture")
    );

    const login = ({ id, accessToken, refreshToken, name, role, profilePicture }: LoginProps) => {
        localStorage.setItem("id", String(id));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("name", name);
        localStorage.setItem("role", role);
        localStorage.setItem("profilePicture", profilePicture);
        setName(name);
        setRole(role);
        setProfilePicture(profilePicture);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("id");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("name");
        localStorage.removeItem("role");
        localStorage.removeItem("profilePicture");
        setName("");
        setRole("");
        setProfilePicture("");
        setIsAuthenticated(false);
    }


    return (
        <AuthContext.Provider value={{ isAuthenticated, name, role, profilePicture, setName, setProfilePicture, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
