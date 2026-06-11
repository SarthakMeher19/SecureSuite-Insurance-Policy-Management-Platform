import { createContext, useContext, type ReactNode } from "react";
import type { Role } from "./mock-data";

type SessionData = {
  id: string;
  name: string;
  role: Role;
  username: string;
  agentId?: string;
  customerId?: string;
};

type RoleCtx = {
  role: Role;
  user: SessionData | null;
};

const RoleContext = createContext<RoleCtx | null>(null);

export function RoleProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession?: SessionData | null;
}) {
  const role: Role = initialSession?.role || "customer";
  return (
    <RoleContext.Provider value={{ role, user: initialSession || null }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be inside RoleProvider");
  return ctx;
}
