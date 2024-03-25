import { ELEMENT_ALIGNMENT } from "@clevercanary/data-explorer-ui/lib/common/entities";
import { ANCHOR_TARGET } from "@clevercanary/data-explorer-ui/lib/components/Links/common/entities";
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
import { getAuthenticationConfig } from "./authentication/authentication";
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
    authentication: getAuthenticationConfig(portalUrl),
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
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.IN_CELLXGENE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.IN_CELLXGENE,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.IS_PUBLISHED,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.IS_PUBLISHED,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.IN_CAP,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.IN_CAP,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.IN_HCA_DATA_REPOSITORY,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.IN_HCA_DATA_REPOSITORY,
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

          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.COMPONENT_ATLAS_NAME,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.COMPONENT_ATLAS_NAME,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.TISSUE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TISSUE,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.DISEASE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DISEASE,
          },

          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.PROJECT_TITLE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PROJECT_TITLE,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.SPECIES,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.SPECIES,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.LIBRARY_CONSTRUCTION_METHOD,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.LIBRARY_CONSTRUCTION_METHOD,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ANATOMICAL_ENTITY,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ANATOMICAL_ENTITY,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.DONOR_DISEASE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DONOR_DISEASE,
          },
        ],
      },
    ],
    dataSource: {
      entityURL: LOCALHOST,
      url: browserUrl,
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
        authenticationEnabled: true,
        navAlignment: ELEMENT_ALIGNMENT.RIGHT,
        navLinks: [
          {
            flatten: true,
            label: "Help & Documentation",
            menuItems: [
              {
                label: C.LabelIconMenuItem({ label: "Guides" }),
                target: ANCHOR_TARGET.BLANK,
                url: `${portalUrl}/guides`,
              },
              {
                label: C.LabelIconMenuItem({ label: "Privacy" }),
                target: ANCHOR_TARGET.BLANK,
                url: `${portalUrl}/privacy`,
              },
            ],
            url: "",
          },
        ],
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
