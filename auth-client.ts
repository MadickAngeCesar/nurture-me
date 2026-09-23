import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";
import {
    inferAdditionalFields,
    emailOTPClient,
} from "better-auth/client/plugins";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    plugins: [
        inferAdditionalFields<typeof auth>(),
        oauthProviderClient(),
        emailOTPClient(),
    ],
});
