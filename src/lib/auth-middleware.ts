import { getCookie } from "@tanstack/react-start/server";

const SESSION_COOKIE = "secure_suite_session";

export type SessionData = {
  id: string;
  name: string;
  role: "admin" | "agent" | "customer";
  username: string;
  agentId?: string;
  customerId?: string;
};

/**
 * Read and parse the session cookie. Returns null if not logged in.
 */
export function getSessionFromCookie(): SessionData | null {
  const raw = getCookie(SESSION_COOKIE);
  if (!raw) return null;
  try {
    // Cookie value may be URL-encoded by the browser
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded) as SessionData;
  } catch {
    // Fallback: try parsing without decoding
    try {
      return JSON.parse(raw) as SessionData;
    } catch {
      console.error("[auth-middleware] Failed to parse session cookie:", raw?.substring(0, 80));
      return null;
    }
  }
}

/**
 * Require a valid session. Throws if not logged in.
 */
export function requireSession(): SessionData {
  const session = getSessionFromCookie();
  if (!session) {
    console.error("[auth-middleware] No session found — cookie missing or unparseable");
    throw new Error("Unauthorized — please log in");
  }
  return session;
}

/**
 * Require a specific role (or set of roles). Throws 403 if not allowed.
 */
export function requireRole(...allowed: SessionData["role"][]): SessionData {
  const session = requireSession();
  if (!allowed.includes(session.role)) {
    throw new Error("Forbidden — you do not have permission to access this resource");
  }
  return session;
}
