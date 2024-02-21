import { setConfig } from "@clevercanary/data-explorer-ui/lib/config/config";
import { SiteConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import hcaAtlasTrackerDev from "../../site-config/hca-atlas-tracker/dev/config";

const CONFIGS: { [k: string]: SiteConfig } = {
  "hca-atlas-tracker-dev": hcaAtlasTrackerDev,
};

let appConfig: SiteConfig | null = null;

export const config = (): SiteConfig => {
  if (appConfig) {
    return appConfig;
  }

  const config = process.env.NEXT_PUBLIC_SITE_CONFIG;

  if (!config) {
    console.error(`Config not found. config: ${config}`);
  }

  appConfig = CONFIGS[config as string];

  if (!appConfig) {
    console.error(`No app config was found for the config: ${config}`);
  } else {
    console.log(`Using app config ${config}`);
  }

  setConfig(appConfig); // Sets app config.
  return appConfig;
};
