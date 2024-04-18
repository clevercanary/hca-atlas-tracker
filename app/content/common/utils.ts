import { getConfig } from "@databiosphere/findable-ui/lib/config/config";
import { SiteConfig } from "../../../site-config/common/entities";
import { config } from "../../config/config";
import { ContentScope } from "./entities";

/**
 * Returns the content scope.
 * @returns content scope.
 */
export function getContentScope(): ContentScope {
  const siteConfig = config();
  const { portalURL, redirectRootToPath } = siteConfig;
  return { portalURL, redirectRootToPath };
}

/**
 * If the URL contains "{portalURL}", replace it with the corresponding configured value.
 * @param url - URL.
 * @returns URL.
 */
export function getContentURL(url = ""): string {
  const { portalURL } = getConfig() as SiteConfig;
  const decodedUrl = decodeURI(url);
  return decodedUrl.replace(/{portalURL}/g, portalURL);
}
