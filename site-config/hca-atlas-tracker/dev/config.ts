import { SiteConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import { makeConfig, PORTAL_URL } from "../local/config";

// Template constants
const BROWSER_URL = "https://tracker.data.humancellatlas.dev.clevercanary.com/";

const config: SiteConfig = makeConfig(BROWSER_URL, PORTAL_URL);

export default config;
