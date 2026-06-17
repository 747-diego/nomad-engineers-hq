"use client";

import { createContext, useContext } from "react";
import { founderFor } from "@/lib/auth/whitelist";
import type { FounderKey } from "@/lib/types";

type CurrentUser = {
  id: string;
  email: string;
  name: string;
  key: FounderKey;
};

const UserContext = createContext<CurrentUser | null>(null);

export function UserProvider({
  id,
  email,
  children,
}: {
  id: string;
  email: string;
  children: React.ReactNode;
}) {
  const founder = founderFor(email);
  const value: CurrentUser = {
    id,
    email,
    name: founder?.name ?? email,
    key: founder?.key ?? "diego",
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): CurrentUser {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
