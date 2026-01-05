export default function authorizeAdmin(token: string): boolean | null {
    try {
        return token === process.env.ADMIN_PASSWORD!;
    } catch {
        return null;
    }
}
