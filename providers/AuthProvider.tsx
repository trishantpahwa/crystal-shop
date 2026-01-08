import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signOutUser } from "@/services/login.service";

type AuthState = {
    isAuthenticated: boolean;
    loading: boolean;
    token: string | null;
    refreshToken: string | null;
    refresh: () => void;
    logout: () => Promise<boolean>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

function readTokensFromLocalStorage() {
    if (typeof window === "undefined") {
        return { token: null as string | null, refreshToken: null as string | null };
    }

    const token = window.localStorage.getItem("token");
    const refreshToken = window.localStorage.getItem("refreshToken");

    return {
        token: token && token.trim().length > 0 ? token : null,
        refreshToken: refreshToken && refreshToken.trim().length > 0 ? refreshToken : null,
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [{ token, refreshToken }, setTokens] = useState(() => readTokensFromLocalStorage());
    const [loading, setLoading] = useState(true);

    const refresh = () => {
        setTokens(readTokensFromLocalStorage());
    };

    const logout = async () => {
        const success = await signOutUser();
        if (success) {
            setTokens({ token: null, refreshToken: null });
        }
        return success;
    };

    useEffect(() => {
        // Initial client-side hydration check
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTokens(readTokensFromLocalStorage());
        setLoading(false);

        const onStorage = (event: StorageEvent) => {
            if (event.key === "token" || event.key === "refreshToken" || event.key === null) {
                setTokens(readTokensFromLocalStorage());
            }
        };

        const onTokensUpdated = () => {
            setTokens(readTokensFromLocalStorage());
        };

        window.addEventListener("storage", onStorage);
        window.addEventListener("auth-tokens-updated", onTokensUpdated);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("auth-tokens-updated", onTokensUpdated);
        };
    }, []);

    const value = useMemo<AuthState>(() => {
        const isAuthenticated = Boolean(token && refreshToken);
        return { isAuthenticated, loading, token, refreshToken, refresh, logout };
    }, [token, refreshToken, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
