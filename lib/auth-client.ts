import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",

    // Fetch options for better error handling
    fetchOptions: {
        onRequest: (context) => {
            console.log("Auth request:", context);
            return context;
        },
        onResponse: (context) => {
            console.log("Auth response:", context);
            return context;
        },
        onError: (context) => {
            console.error("Auth error:", context);
            // Don't return context, just log
        },
    },
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;