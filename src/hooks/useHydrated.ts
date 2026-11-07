"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** false on the server / during hydration, true afterwards. Used to avoid persisted-store mismatches. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
