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
        (() => {
            const stored = localStorage.getItem("profilePicture");
            return stored && stored !== "null" && stored !== "undefined" ? stored : null;
        })()
    );

    const login = ({ id, accessToken, refreshToken, name, email, role, profilePicture }: LoginProps) => {
        localStorage.setItem("id", String(id));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        localStorage.setItem("role", role);
        if (profilePicture) {
            localStorage.setItem("profilePicture", profilePicture);
        } else {
            localStorage.removeItem("profilePicture");
        }
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
        localStorage.removeItem("email");
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
