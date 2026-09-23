import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { oauthProvider } from "@better-auth/oauth-provider";
import { prisma } from "./lib/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    appName: "nurture-me",
    plugins: [
        jwt(),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }, request) {
                // Send email with OTP
            },
        }),
        oauthProvider({
            loginPage: "/login",
            consentPage: "/oauth/consent",
        }) as unknown as BetterAuthPlugin,
        nextCookies(),
    ],
});
