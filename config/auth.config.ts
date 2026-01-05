import { verify } from "jsonwebtoken";

export default function authorize(token: string): string | null {
    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as {
            id: string;
        };
        return decoded.id;
    } catch (error) {
        return null;
    }
}
