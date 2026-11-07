import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";
import { sendMail } from "./mailer";

// Reuse one client across hot reloads in development.
const globalForMongo = globalThis as unknown as { __bcMongo?: MongoClient };
const client =
  globalForMongo.__bcMongo ?? new MongoClient(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/brothers-crockeries");
if (process.env.NODE_ENV !== "production") globalForMongo.__bcMongo = client;

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      void sendMail({
        to: user.email,
        subject: "Reset your Brothers Crockeries password",
        text: `Hello ${user.name},\n\nUse this link to choose a new password (valid for 1 hour):\n${url}\n\nIf you did not ask for this, you can ignore this email.`,
        html: `<p>Hello ${user.name},</p><p><a href="${url}">Choose a new password</a> (link valid for 1 hour).</p><p>If you did not ask for this, you can ignore this email.</p>`,
      });
    },
  },
  ...(hasGoogle
    ? {
        socialProviders: {
          google: { clientId: process.env.GOOGLE_CLIENT_ID as string, clientSecret: process.env.GOOGLE_CLIENT_SECRET as string },
        },
      }
    : {}),
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "user", input: false },
      phone: { type: "string", required: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (adminEmails.includes(user.email.toLowerCase())) return { data: { ...user, role: "admin" } };
          return { data: user };
        },
      },
    },
  },
  plugins: [nextCookies()], // keep last
});
