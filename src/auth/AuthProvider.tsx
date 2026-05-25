import { useState } from "react";
import { AuthContext } from "./AuthContext";

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

    const login = (token: string, name: string, role: string) => {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("name", name);
        localStorage.setItem("role", role);
        setName(name);
        setRole(role);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("name");
        localStorage.removeItem("role");
        setName("");
        setRole("");
        setIsAuthenticated(false);
    }


    return (
        <AuthContext.Provider value={{ isAuthenticated, name, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}