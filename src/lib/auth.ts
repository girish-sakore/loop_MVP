import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import nodemailer from "nodemailer";

import { prisma } from "@/lib/db";

// Use the pool-based prisma instance you already created
export const auth = betterAuth({
  appName: "Habitly",
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
      expiresIn: 60 * 10,
      sendMagicLink: async ({ email, url }) => {
        // const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
        
        // Only log in dev to save resources, send email in production
        if (process.env.NODE_ENV !== "production") {
          console.info(`[Auth] Magic Link for ${email}: ${url}`);
          return;
        }

        // await transporter.sendMail({
        //   from: process.env.EMAIL_FROM ?? "no-reply@habitly.app",
        //   to: email,
        //   subject: "Your Habitly magic link",
        //   html: `<p>Click <a href="${url}">here</a> to sign in.</p>`,
        // });
      },
    }),
  ],

  // Allows linking Social accounts to the same email automatically
  account: {
    accountLinking: {
      enabled: true,
    }
  }
});