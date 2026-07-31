import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` on the client, `useEffect` on the server. Runs the effect
 * before the browser paints on the client (so DOM/state changes are applied
 * pre-paint), while avoiding React's "useLayoutEffect does nothing on the
 * server" warning during SSR.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
