import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.VERCEL_ENV === "production"
        ? `https://${process.env.VERCEL_URL}`
        : process.env.VERCEL_ENV === "preview"
            ? `https://${process.env.VERCEL_BRANCH_URL}`
            : `http://localhost:3000`,
    plugins: [
        magicLinkClient()
    ]
});