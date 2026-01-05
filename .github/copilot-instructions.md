# Crystal Atelier - AI Coding Instructions

## Project Overview

-   **Framework:** Next.js 16+ (Pages Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS v4
-   **Database:** PostgreSQL with Prisma ORM
-   **Auth:** Firebase (Client) + Custom JWT (Server)

## Architecture & Patterns

### Database Access (Prisma)

-   **CRITICAL:** Always import the Prisma client from the generated path, NOT the default package.

    ```typescript
    // ✅ Correct
    import prisma from "@/config/prisma.config";
    import { Prisma } from "@/generated/prisma/client";

    // ❌ Incorrect
    import { PrismaClient } from "@prisma/client";
    ```

-   Use `prisma migrate dev` for schema changes.

### API Routes (`pages/api/`)

-   Structure routes using a `switch` statement for HTTP methods.
-   Extract logic into separate async functions (e.g., `GET`, `POST`) within the file.
-   Use `NextApiRequest` and `NextApiResponse` types.
    ```typescript
    export default async function handler(
        req: NextApiRequest,
        res: NextApiResponse
    ) {
        switch (req.method) {
            case "GET":
                return GET(req, res);
            default:
                return res.status(405).end();
        }
    }
    ```

### Authentication Flow

-   **Client:** Uses Firebase Auth (Google Sign-In) to get an ID token.
-   **Server:** Exchange Firebase ID token for custom JWTs (Access + Refresh) via `/api/user`.
-   **Storage:** Tokens are stored in `localStorage`.
-   **State:** Use `AuthProvider` context for auth state.
    ```typescript
    // Login Service Pattern
    import { signInWithPopup } from "firebase/auth";
    // ... exchange token logic ...
    ```

### Styling

-   Use Tailwind CSS utility classes.
-   Avoid CSS modules unless absolutely necessary.
-   Global styles are in `styles/globals.css`.

## Key Directories

-   `config/`: Configuration files (Prisma, Firebase, Auth).
-   `generated/`: Generated Prisma client code.
-   `services/`: Business logic and external service integrations (e.g., `login.service.ts`).
-   `providers/`: React Context providers (AuthProvider, CartProvider).

## Cart Functionality

-   **Database Models**: Cart (user-specific), CartItem (product + quantity).
-   **API**: `/api/cart` with GET/POST/PUT/DELETE methods, JWT authentication required.
-   **Frontend**: CartProvider context, cart page at `/cart`, "Add to bag" buttons on ProductCard.
-   **State Management**: Cart state managed via CartProvider, persisted server-side per user.
-   **Navigation**: Cart count shown in header, links to `/cart` page.

## Development Workflow

-   **Run Dev Server:** `npm run dev`
-   **Linting:** `npm run lint`
-   **Path Aliases:** Use `@/*` for all internal imports (mapped to root `./`).
