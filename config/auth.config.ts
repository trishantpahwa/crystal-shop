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
        return true;
    } catch {
        return false;
    }
}

export function forceLogoutUser(): void {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("refreshToken");
    window.location.reload();
}
