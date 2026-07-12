import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import api from "./api";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" && account.id_token) {
        try {
          const response = await api.post("/auth/google", {
            token: account.id_token,
          });
          account.accessToken = response.data.access_token;
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account?.accessToken) {
        token.accessToken = account.accessToken as string; 
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  session: { strategy: "jwt" },
};
