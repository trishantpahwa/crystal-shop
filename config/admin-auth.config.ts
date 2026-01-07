import jwt from "jsonwebtoken";

const SECRET = process.env.ADMIN_JWT_SECRET || "default-admin-secret";

export function generateAdminToken(username: string): string {
    return jwt.sign({ username, role: "admin" }, SECRET, { expiresIn: "1w" });
}

export function verifyAdminToken(token: string): boolean {
    try {
        jwt.verify(token, SECRET);
        return true;
    } catch {
        return false;
    }
}
