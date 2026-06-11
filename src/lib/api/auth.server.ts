import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { db } from "../db";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "secure_suite_session";

export const login = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data }) => {
    // Look up user by email OR username
    const user = await db.users.findFirst({
      where: {
        OR: [
          { email: { equals: data.username } },
          { username: { equals: data.username } },
        ],
      },
    });

    if (!user) throw new Error("Invalid email or password");

    // Verify bcrypt-hashed password
    const passwordValid = await bcrypt.compare(data.password, user.password);
    if (!passwordValid) throw new Error("Invalid email or password");

    // Determine the role-specific entity ID
    // The users table shares IDs with agents/customers tables
    const role = (user.role?.toLowerCase() || "customer") as "admin" | "agent" | "customer";

    const sessionData: Record<string, string> = {
      id: user.id.toString(),
      name: user.name,
      role,
      username: user.email || "",
    };

    // Enrich with entity IDs for role-based filtering
    if (role === "agent") {
      sessionData.agentId = user.id.toString();
    } else if (role === "customer") {
      sessionData.customerId = user.id.toString();
    }

    setCookie(SESSION_COOKIE, JSON.stringify(sessionData), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return { role, name: user.name };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(SESSION_COOKIE);
  return true;
});

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const sessionStr = getCookie(SESSION_COOKIE);
    if (!sessionStr) return null;

    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  },
);
