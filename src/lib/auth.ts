import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { transporter } from "./nodemailer";

import { prisma } from "@/lib/db";

// Use the pool-based prisma instance you already created
export const auth = betterAuth({
  appName: "Loop",

  baseURL: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000",

  trustedOrigins: [
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  ],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Expose extra user fields on the session object
  user: {
    additionalFields: {
      isPremium: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false, // not user-settable
      },
      plan: {
        type: "string",
        required: false,
        input: false,
      },
      subscriptionEnd: {
        type: "string", // ISO date string
        required: false,
        input: false,
      },
    },
  },

  // PERFORMANCE BOOST: 
  // Joins fetch User + Session in one query instead of two.
  experimental: {
    joins: true,
  },

  // SECURITY & SESSION
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // Update cookie once a day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session check result for 5 mins
    }
  },

  plugins: [
    // nextCookies must be included for Next.js Server Actions/Middleware
    nextCookies(),

    magicLink({
      expiresIn: 60 * 10, // 10 minutes
      sendMagicLink: async ({ email, url }) => {
        // Log to console for quick debugging during development
        if (process.env.NODE_ENV !== "production") {
          console.info(`[Auth] Magic Link for ${email}: ${url}`);
        } else {
          // Send actual email via Nodemailer
          await transporter.sendMail({
            from: `Loop <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Sign in to Loop",
            html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h2>Sign in to Loop</h2>
              <p>Click the button below to sign in to your account. This link will expire in 10 minutes.</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">Sign In</a>
              <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
            </div>
          `,
          });
        }

      },
    }),
  ],

  // Allows linking Social accounts to the same email automatically
  account: {
    accountLinking: {
      enabled: true,
    },
  },
});