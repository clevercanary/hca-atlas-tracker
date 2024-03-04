import { SiteConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import { makeConfig } from "../local/config";

// Template constants
const BROWSER_URL = "TODO";
export const PORTAL_URL = "https://data.humancellatlas.org";

const config: SiteConfig = makeConfig(BROWSER_URL, PORTAL_URL);

export default config;
