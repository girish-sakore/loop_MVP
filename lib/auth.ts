import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { toNextJsHandler, nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import nodemailer from "nodemailer";

import { prisma } from "@/lib/db";

const emailServer = process.env.EMAIL_SERVER;
const emailFrom = process.env.EMAIL_FROM ?? "Habitly <no-reply@habitly.app>";

const transporter = emailServer
  ? nodemailer.createTransport(emailServer)
  : null;

export const auth = betterAuth({
  appName: "Habitly",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    disableSessionRefresh: true,
  },
  plugins: [
    nextCookies(),
    magicLink({
      expiresIn: 60 * 10,
      sendMagicLink: async ({ email, url }) => {
        if (transporter) {
          await transporter.sendMail({
            from: emailFrom,
            to: email,
            subject: "Your Habitly magic link",
            text: `Open this link to sign in: ${url}`,
            html: `<p>Open this link to sign in:</p><p><a href="${url}">${url}</a></p>`,
          });
          return;
        }

        if (process.env.NODE_ENV !== "production") {
          console.info(`[auth] magic-link ${email}: ${url}`);
          return;
        }

        throw new Error("EMAIL_SERVER must be configured in production.");
      },
    }),
  ],
});

export const authHandler = toNextJsHandler(auth);
