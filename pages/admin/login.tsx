import { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem("adminToken", token);
                document.cookie = `admin-token=${token}; path=/; max-age=86400`; // 1 day
                toast.success("Logged in successfully");
                router.push("/admin/orders");
            } else {
                const { error } = await response.json();
                toast.error(error || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <div className="flex min-h-screen items-center justify-center">
                <div className="w-full max-w-md">
                    <h1 className="mb-6 text-center text-2xl font-bold">Admin Login</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </div>
            </div>
        </Container>
    );
}

export async function getServerSideProps(context: any) {
    const { req } = context;
    const token = req.cookies['admin-token'];

    if (token) {
        const { verifyAdminToken } = await import('@/config/admin-auth.config');
        if (verifyAdminToken(token)) {
            return {
                redirect: {
                    destination: '/admin/orders',
                    permanent: false,
                },
            };
        }
    }

    return {
        props: {},
    };
}