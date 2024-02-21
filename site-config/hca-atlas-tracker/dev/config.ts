import { SiteConfig } from "@clevercanary/data-explorer-ui/lib/config/entities";
import { tabletUp } from "@clevercanary/data-explorer-ui/lib/theme/common/breakpoints";
import {
  TEXT_BODY_LARGE_500,
  TEXT_HEADING,
  TEXT_HEADING_LARGE,
  TEXT_HEADING_SMALL,
  TEXT_HEADING_XLARGE,
} from "@clevercanary/data-explorer-ui/lib/theme/common/typography";
import * as C from "../../../app/components/index";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../category";
import { atlasEntityConfig } from "./index/atlasEntityConfig";

// Template constants
const LOCALHOST = "http://localhost:3000";
const APP_TITLE = "HCA Atlas Tracker";
const BROWSER_URL = LOCALHOST;
const FONT_FAMILY_DIN = "'din-2014', sans-serif";
const HOME_PAGE_PATH = "/atlases";
const ORG_URL = "https://www.humancellatlas.org";
export const PORTAL_URL = "https://data.humancellatlas.dev.clevercanary.com";

export function makeConfig(browserUrl: string, portalUrl: string): SiteConfig {
  return {
    appTitle: APP_TITLE,
    browserURL: browserUrl,
    categoryGroupConfigs: [
      {
        categoryConfigs: [
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.BIONETWORK,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.BIONETWORK,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_TITLE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_TITLE,
          },
        ],
      },
      {
        categoryConfigs: [
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.VERSION,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.VERSION,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.STATUS,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.STATUS,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.INTEGRATION_LEAD,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.INTEGRATION_LEAD,
          },
        ],
      },
    ],
    dataSource: {
      entityURL: LOCALHOST,
      url: LOCALHOST,
    },
    entities: [atlasEntityConfig],
    explorerTitle: "Manage Atlases",
    layout: {
      footer: {
        Branding: C.HCABranding({
          orgURL: ORG_URL,
          portalURL: portalUrl,
        }),
        navLinks: [],
      },
      header: {
        Logo: C.Logo({
          alt: APP_TITLE,
          height: 32.5,
          link: HOME_PAGE_PATH,
          src: "/images/hcaAtlasTracker.svg",
        }),
        navLinks: [],
      },
    },
    redirectRootToPath: HOME_PAGE_PATH,
    themeOptions: {
      palette: {
        primary: {
          dark: "#005EA9",
          main: "#1C7CC7",
        },
      },
      typography: {
        [TEXT_BODY_LARGE_500]: {
          fontFamily: FONT_FAMILY_DIN,
          fontSize: 18,
          fontWeight: 400,
        },
        [TEXT_HEADING]: {
          fontFamily: FONT_FAMILY_DIN,
          fontSize: 22,
          fontWeight: 400,
          letterSpacing: "normal",
          [tabletUp]: {
            fontSize: 26,
            letterSpacing: "normal",
          },
        },
        [TEXT_HEADING_LARGE]: {
          fontFamily: FONT_FAMILY_DIN,
          fontSize: 26,
          fontWeight: 400,
          letterSpacing: "normal",
          lineHeight: "34px",
          [tabletUp]: {
            fontSize: 32,
            letterSpacing: "normal",
          },
        },
        [TEXT_HEADING_SMALL]: {
          fontFamily: FONT_FAMILY_DIN,
          fontSize: 20,
          fontWeight: 400,
          letterSpacing: "normal",
          [tabletUp]: {
            fontSize: 22,
            letterSpacing: "normal",
          },
        },
        [TEXT_HEADING_XLARGE]: {
          fontFamily: FONT_FAMILY_DIN,
          fontSize: 32,
          fontWeight: 400,
          letterSpacing: "normal",
          [tabletUp]: {
            fontSize: 42,
            letterSpacing: "-0.4px",
          },
        },
      },
    },
  };
}

const config: SiteConfig = makeConfig(BROWSER_URL, PORTAL_URL);

export default config;
