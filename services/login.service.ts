import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "@/config/firebase.config";

const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, new provider());
        const token = await result.user.getIdToken();
        const response = await fetch("/api/user", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("refreshToken", data.refreshToken);
            // Also set cookies for SSR support
            document.cookie = `token=${data.token}; path=/; max-age=86400; samesite=strict`;
            document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=604800; samesite=strict`;
            return true;
        } else {
            return false;
        }
    } catch {
        return false;
    }
};

const signOutUser = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        // Clear cookies if present
        document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
            "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        return true;
    } catch {
        return false;
    }
};

const signOutAdmin = () => {
    localStorage.removeItem("adminToken");
    // Clear cookies if present
    document.cookie =
        "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    return true;
};

export { signInWithGoogle, signOutUser, signOutAdmin };
