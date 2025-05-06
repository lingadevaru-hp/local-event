"use client";

import type * as React from "react";

// This component can be used to wrap your application with any client-side context providers
// For example, React Query Provider, Theme Provider, etc.
// For now, it's a simple pass-through.

export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
