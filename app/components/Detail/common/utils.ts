/**
 * The view should be rendered if:
 * - the user cannot view form (user is prompted to log in), or
 * - the user can view form and data is available (form is rendered with data).
 * @param canView - User can view form.
 * @param hasData - Data is available.
 * @returns true if the view should be rendered.
 */
export function shouldRenderView(canView: boolean, hasData = true): boolean {
  if (!canView) return true; // User is prompted to log in.
  return hasData;
}
