/**
 * The view should be rendered if:
 * - the user is not authenticated, or
 * - the user is authenticated and data is available.
 * @param isAuthenticated - User is authenticated.
 * @param hasData - Data is available.
 * @returns true if the view should be rendered.
 */
export function shouldRenderView(
  isAuthenticated: boolean,
  hasData = true
): boolean {
  if (!isAuthenticated) return true;
  return hasData;
}
