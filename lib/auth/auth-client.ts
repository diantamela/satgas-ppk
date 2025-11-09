import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",

    // Fetch options for better error handling
    fetchOptions: {
        onRequest: (context) => {
            console.log("Auth request:", { url: context.url, method: context.method });
            return context;
        },
        onResponse: (context) => {
            console.log("Auth response:", { status: context.response?.status, ok: context.response?.ok });
            return context;
        },
        onError: (context) => {
            // small helper to ensure logging never throws (declare outside try so catch can use it)
            const safeLog = (...args: any[]) => {
                try {
                    console.warn('Auth error:', ...args);
                } catch (_) {
                    // swallow
                }
            };

            try {
                // Defensive logging: some context properties may be getters that throw
                if (!context || typeof context !== 'object') {
                    safeLog('Auth error - context (non-object):', context);
                    return;
                }

                // Safely collect enumerable keys without calling Object.keys directly
                const safeKeys: string[] = [];
                try {
                    for (const k in context) {
                        try {
                            // Accessing the key name only; avoid evaluating getters on the value
                            safeKeys.push(k);
                        } catch (_) {
                            // ignore problematic keys
                        }
                    }
                } catch (_) {
                    // fallback if for..in fails
                }

                safeLog('Auth error - context keys (safe):', safeKeys.length ? safeKeys : Object.prototype.toString.call(context));

                // Request info (if present and looks like a Fetch Request)
                if ('request' in context && context.request) {
                    try {
                        const req: any = context.request;
                        const reqInfo: any = {};
                        if (typeof req.url === 'string') reqInfo.url = req.url;
                        if (typeof req.method === 'string') reqInfo.method = req.method;
                        if (req.headers && typeof req.headers.forEach === 'function') {
                            const headers: Record<string, string> = {};
                            try {
                                req.headers.forEach((value: string, key: string) => { headers[key] = value; });
                                reqInfo.headers = headers;
                            } catch (_) {
                                // ignore header iteration problems
                            }
                        }
                        safeLog('Auth error - request (safe):', reqInfo);
                    } catch (e) {
                        safeLog('Auth error reading request info (safe):', e);
                    }
                }

                // Response info (if present and looks like a Fetch Response)
                if ('response' in context && context.response) {
                    try {
                        const res: any = context.response;
                        const status = res && typeof res.status === 'number' ? res.status : undefined;
                        const statusText = res && typeof res.statusText === 'string' ? res.statusText : undefined;
                        safeLog('Auth error - response status (safe):', status, statusText);

                        // If response has a text() method, read it safely
                        if (res && typeof res.clone === 'function' && typeof res.clone().text === 'function') {
                            try {
                                res.clone().text().then((text: string) => {
                                    safeLog('Auth error - response body (safe):', text);
                                }).catch((e: any) => {
                                    safeLog('Auth error - cannot read response body (safe):', e);
                                });
                            } catch (e) {
                                safeLog('Auth error - reading response body failed (safe):', e);
                            }
                        }
                    } catch (e) {
                        safeLog('Auth error reading response info (safe):', e);
                    }
                }

                // Any error object
                if ('error' in context && context.error) {
                    try {
                        safeLog('Auth error - error object (safe):', context.error);
                    } catch (_) {
                        safeLog('Auth error - error object could not be displayed');
                    }
                }
            } catch (e) {
                // Last-resort catch so logging never throws
                try {
                    safeLog('Unexpected error while logging auth error (final):', e);
                } catch (_) {
                    // swallow
                }
            }
            // Do not return anything from onError
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