import { SiteConfig } from "../../common/entities";
import { GIT_HUB_REPO_URL, makeConfig, PORTAL_URL } from "../local/config";

// Template constants
const BROWSER_URL =
  "https://test-tracker.data.humancellatlas.dev.clevercanary.com";

const config: SiteConfig = makeConfig(
  BROWSER_URL,
  PORTAL_URL,
  GIT_HUB_REPO_URL
);

export default config;
