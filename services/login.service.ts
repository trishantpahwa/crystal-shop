import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/config/firebase.config";

const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, new provider());
        const credential = provider.credentialFromResult(result);
        const token = credential?.accessToken;
        // Verify access token with backend
        const response = await fetch("/api/user", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });
        if (response.ok) {
            const data = await response.json();
            console.log("Backend verification successful:", data);
        } else {
            console.error("Backend verification failed:", response.statusText);
        }
    } catch (error) {
        console.error("Error during Google sign-in:", error);
    }
};

export { signInWithGoogle };
