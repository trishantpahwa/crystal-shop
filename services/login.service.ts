import { signInWithPopup } from "firebase/auth";
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

export { signInWithGoogle };
