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
            try {
                // Log available context properties to help debugging
                console.error("Auth error - context keys:", Object.keys(context || {}));

                // Request info (if present)
                if (context?.request) {
                    try {
                        const req = context.request;
                        console.error("Auth error - request:", {
                            url: req.url,
                            method: req.method,
                            headers: req.headers,
                        });
                    } catch (e) {
                        console.error("Auth error reading request info:", e);
                    }
                }

                // Response info (if present)
                if (context?.response) {
                    try {
                        const res = context.response;
                        console.error("Auth error - response status:", res.status, res.statusText);
                        // Try to read response body for more details
                        res.clone().text().then((text) => {
                            console.error("Auth error - response body:", text);
                        }).catch((e) => {
                            console.error("Auth error - cannot read response body:", e);
                        });
                    } catch (e) {
                        console.error("Auth error reading response info:", e);
                    }
                }

                // Any error object
                if (context?.error) {
                    console.error("Auth error - error object:", context.error);
                }
            } catch (e) {
                console.error("Unexpected error while logging auth error:", e);
            }
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