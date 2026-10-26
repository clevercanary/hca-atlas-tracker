import { SESSION_END_PARAM } from "@/app/routes/constants";
import { useRouter } from "next/router";
import { useEffect } from "react";

/**
 * Removes `SESSION_END_PARAM` from the URL once the landing page has rendered.
 *
 * The param has done its job by then — it stopped `getServerSideProps`
 * redirecting a still-cookied request to `/atlases`. Left in place it would
 * outlive the next sign-in: findable-ui builds the post-login URL from its
 * route history, stripping only the inactivity param, so the user would come
 * back to a landing page that again skips the redirect.
 *
 * Must be a *shallow* router replace:
 * - a non-shallow one re-runs `getServerSideProps`, which redirects a cookied
 *   request to `/atlases` and re-creates the loop the param exists to break;
 * - `history.replaceState` would not fire `routeChangeComplete`, so
 *   findable-ui's route history would keep the old URL and sign-in would
 *   return to it anyway.
 *
 * The inactivity param is left alone: findable-ui owns it, its banner reads
 * it, and its post-login URL already strips it.
 * @returns void.
 */
export const useClearSessionEndParam = (): void => {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(router.asPath, window.location.origin);
    if (!url.searchParams.has(SESSION_END_PARAM)) return;
    url.searchParams.delete(SESSION_END_PARAM);
    router.replace(`${url.pathname}${url.search}${url.hash}`, undefined, {
      shallow: true,
    });
  }, [router]);
};
