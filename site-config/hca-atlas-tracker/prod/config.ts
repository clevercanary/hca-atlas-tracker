import { SiteConfig } from "../../common/entities";
import { makeConfig } from "../local/config";
import { authenticationConfig } from "./authentication/authentication";

// Template constants
const BROWSER_URL = "https://tracker.data.humancellatlas.org";
const PORTAL_URL = "https://data.humancellatlas.org";

const config: SiteConfig = makeConfig(BROWSER_URL, PORTAL_URL);

// Add authentication to the config.
config.authentication = authenticationConfig;

export default config;
