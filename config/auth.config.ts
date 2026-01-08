import { verify } from "jsonwebtoken";

export default function authorize(token: string): string | null {
    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as {
            id: string;
        };
        return decoded.id;
    } catch {
        return null;
    }
}

export async function refreshAuthToken(): Promise<boolean> {
    try {
        const response = await fetch(`/api/user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refreshToken: localStorage.getItem("refreshToken"),
            }),
        });
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        window.localStorage.setItem("token", data.token);
        window.localStorage.setItem("refreshToken", data.refreshToken);
        // Also set cookies for SSR support
        document.cookie = `token=${data.token}; path=/; max-age=86400; samesite=strict`;
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=604800; samesite=strict`;
        // Dispatch event to update AuthProvider state
        window.dispatchEvent(new CustomEvent("auth-tokens-updated"));
        return true;
    } catch {
        return false;
    }
}

export function forceLogoutUser(): void {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("refreshToken");
    // Clear cookies if present
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
}
