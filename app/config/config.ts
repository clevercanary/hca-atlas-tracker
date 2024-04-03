import { setConfig } from "@clevercanary/data-explorer-ui/lib/config/config";
import { SiteConfig } from "../../site-config/common/entities";
import hcaAtlasTrackerDev from "../../site-config/hca-atlas-tracker/dev/config";
import hcaAtlasTrackerLocal from "../../site-config/hca-atlas-tracker/local/config";
import hcaAtlasTrackerProd from "../../site-config/hca-atlas-tracker/prod/config";

const CONFIGS: { [k: string]: SiteConfig } = {
  "hca-atlas-tracker-dev": hcaAtlasTrackerDev,
  "hca-atlas-tracker-local": hcaAtlasTrackerLocal,
  "hca-atlas-tracker-prod": hcaAtlasTrackerProd,
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
