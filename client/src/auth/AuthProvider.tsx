import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );

    const [username, setusername] = useState("");

    const login = (token: string, username: string) => {
        console.log("token: " + token);
        localStorage.setItem("accessToken", token);
        localStorage.setItem("username", username);
        setusername(username);
        setIsAuthenticated(true);
    };

    const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    setusername("");
    setIsAuthenticated(false);
    }


    return (
        <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}