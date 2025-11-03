import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql" // Supabase uses PostgreSQL
    }),
    emailAndPassword: {
        enabled: true,
    },
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

    // Enable social providers if needed
    socialProviders: {
        // Add social providers here if needed
        // github: { clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! },
    },

    // Rate limiting
    rateLimit: {
        window: 10, // time window in seconds
        max: 100, // max requests per window
    },

    // Account settings
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["github", "google"],
        },
    },

    // User settings
    user: {
        // Using additionalFields as it's the correct property in Better Auth
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
                required: false,
            },
        },
    },

    // Advanced settings
    advanced: {
        generateId: false,
        crossSubDomainCookies: {
            enabled: true,
            domain: process.env.NODE_ENV === "production" ? ".yourdomain.com" : undefined,
        },
        defaultCookieAttributes: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
        },
    },
});