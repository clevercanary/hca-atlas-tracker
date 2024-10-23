import { ANCHOR_TARGET } from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { tabletUp } from "@databiosphere/findable-ui/lib/theme/common/breakpoints";
import {
  TEXT_BODY_LARGE_500,
  TEXT_HEADING,
  TEXT_HEADING_LARGE,
  TEXT_HEADING_SMALL,
  TEXT_HEADING_XLARGE,
} from "@databiosphere/findable-ui/lib/theme/common/typography";
import * as C from "../../../app/components/index";
import { ROUTE } from "../../../app/routes/constants";
import { SiteConfig } from "../../common/entities";
import { announcementsConfig } from "./announcements/announcementsConfig";
import { authenticationConfig } from "./authentication/authentication";
import { atlasEntityConfig } from "./index/atlasEntityConfig";
import { tasksEntityConfig } from "./index/tasks/tasksEntityConfig";
import { userEntityConfig } from "./index/userEntityConfig";

// Template constants
const LOCALHOST = "http://localhost:3000";
const APP_TITLE = "HCA Atlas Tracker";
const BROWSER_URL = LOCALHOST;
export const FONT_FAMILY_DIN = "'din-2014', sans-serif";
const HOME_PAGE_PATH = ROUTE.ATLASES;
const ORG_URL = "https://www.humancellatlas.org";
export const PORTAL_URL = "https://data.humancellatlas.dev.clevercanary.com";

export function makeConfig(browserUrl: string, portalUrl: string): SiteConfig {
  return {
    appTitle: APP_TITLE,
    authentication: authenticationConfig,
    browserURL: browserUrl,
    contentDir: "hca-atlas-tracker",
    dataSource: {
      entityURL: LOCALHOST,
      url: browserUrl,
    },
    entities: [atlasEntityConfig, tasksEntityConfig, userEntityConfig],
    explorerTitle: C.Hero(),
    layout: {
      footer: {
        Branding: C.HCABranding({
          orgURL: ORG_URL,
          portalURL: portalUrl,
        }),
      },
      header: {
        announcements: announcementsConfig,
        authenticationEnabled: true,
        logo: C.Logo({
          alt: APP_TITLE,
          height: 32.5,
          link: HOME_PAGE_PATH,
          src: "/images/hcaAtlasTracker.svg",
        }),
        navigation: [
          undefined,
          [
            {
              label: "Atlases",
              url: ROUTE.ATLASES,
            },
            { label: "Reports", url: ROUTE.REPORTS },
            { label: "Team", url: ROUTE.USERS },
          ],
          [
            {
              label: "Help & Documentation",
              menuItems: [
                {
                  label: "Requesting Access",
                  url: ROUTE.REQUESTING_ACCESS,
                },
                {
                  label: "Validating an Atlas's Source Study List",
                  url: ROUTE.VALIDATING_ATLAS_SOURCE_STUDY_LIST,
                },
                {
                  label: C.LabelIconMenuItem({ label: "Privacy" }),
                  target: ANCHOR_TARGET.BLANK,
                  url: `${portalUrl}/privacy`,
                },
                {
                  icon: C.GitHubIcon({ fontSize: "small" }),
                  label: "GitHub",
                  target: ANCHOR_TARGET.BLANK,
                  url: "https://github.com/clevercanary/hca-atlas-tracker",
                },
              ],
              url: "",
            },
          ],
        ],
      },
    },
    portalURL: portalUrl,
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
