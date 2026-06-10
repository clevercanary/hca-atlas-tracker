import { ANCHOR_TARGET } from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import * as C from "../../../app/components/index";
import { ROUTE } from "../../../app/routes/constants";
import { SiteConfig } from "../../common/entities";
import { announcementsConfig } from "./announcements/announcementsConfig";
import { authenticationConfig } from "./authentication/authentication";
import { floating } from "./floating/floating";
import { atlasEntityConfig } from "./index/atlas/atlasEntityConfig";
import { integratedObjectsEntityConfig } from "./index/integratedObjects/integratedObjectsEntityConfig";
import { sourceDatasetsEntityConfig } from "./index/sourceDatasets/sourceDatasetsEntityConfig";
import { sourceStudiesEntityConfig } from "./index/sourceStudies/sourceStudiesEntityConfig";
import { tasksEntityConfig } from "./index/tasks/tasksEntityConfig";
import { userEntityConfig } from "./index/user/userEntityConfig";

// Template constants
const LOCALHOST = "http://localhost:3000";
const APP_TITLE = "HCA Atlas Tracker";
const BROWSER_URL = LOCALHOST;
export const FONT_FAMILY_DIN = "'din-2014', sans-serif";
export const GIT_HUB_REPO_URL =
  "https://github.com/clevercanary/hca-atlas-tracker";
const ORG_URL = "https://www.humancellatlas.org";
export const PORTAL_URL = "https://data.humancellatlas.dev.clevercanary.com";
const MEDIA_TABLET_UP = "media (min-width: 768px)";

export function makeConfig(
  browserUrl: string,
  portalUrl: string,
  gitHubUrl: string,
): SiteConfig {
  return {
    appTitle: APP_TITLE,
    authentication: authenticationConfig,
    browserURL: browserUrl,
    contentDir: "hca-atlas-tracker",
    dataSource: {
      url: browserUrl,
    },
    entities: [
      atlasEntityConfig,
      sourceDatasetsEntityConfig,
      sourceStudiesEntityConfig,
      integratedObjectsEntityConfig,
      tasksEntityConfig,
      userEntityConfig,
    ],
    gitHubUrl,
    layout: {
      floating,
      footer: {
        Branding: C.HCABranding({
          orgURL: ORG_URL,
          portalURL: portalUrl,
        }),
        poweredByCC: { src: "/images/powered-by-clevercanary.webp" },
        versionInfo: true,
      },
      header: {
        announcements: announcementsConfig,
        authenticationEnabled: ROUTE.LANDING,
        logo: C.Logo({
          alt: APP_TITLE,
          height: 32.5,
          link: ROUTE.LANDING,
          src: "/images/hcaAtlasTracker.svg",
        }),
        navigation: [
          undefined,
          [
            {
              label: "Atlases",
              url: ROUTE.ATLASES,
            },
            {
              label: "Integrated Objects",
              url: ROUTE.INTEGRATED_OBJECTS,
              visible: { md: false, sm: false },
            },
            {
              label: "Source Datasets",
              url: ROUTE.SOURCE_DATASETS,
              visible: { md: false, sm: false },
            },
            {
              label: "Source Studies",
              url: ROUTE.SOURCE_STUDIES,
              visible: { md: false, sm: false },
            },
            {
              label: "Reports",
              url: ROUTE.REPORTS,
              visible: { md: false, sm: false },
            },
            {
              label: "Team",
              url: ROUTE.USERS,
              visible: { md: false, sm: false },
            },
            {
              label: "Metadata Dictionary",
              target: ANCHOR_TARGET.BLANK,
              url: `${portalUrl}/metadata/tier-1`,
            },
            {
              label: "More",
              menuItems: [
                { label: "Integrated Objects", url: ROUTE.INTEGRATED_OBJECTS },
                { label: "Source Datasets", url: ROUTE.SOURCE_DATASETS },
                { label: "Source Studies", url: ROUTE.SOURCE_STUDIES },
                { label: "Reports", url: ROUTE.REPORTS },
                { label: "Team", url: ROUTE.USERS },
              ],
              url: "",
              visible: { lg: false, xs: false },
            },
          ],
          [
            {
              label: "Help & Documentation",
              menuItems: [
                {
                  label: "Requesting Elevated Permissions",
                  url: ROUTE.REQUESTING_ELEVATED_PERMISSIONS,
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
                  icon: C.GitHubIcon({
                    fontSize: SVG_ICON_PROPS.FONT_SIZE.SMALL,
                  }),
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
    redirectRootToPath: ROUTE.LANDING,
    themeOptions: {
      palette: {
        caution: {
          light: "#FFEB78",
          main: "#956F00",
        },
        primary: {
          dark: "#005EA9",
          main: "#1C7CC7",
        },
      },
      typography: {
        [TYPOGRAPHY_PROPS.VARIANT.BODY_LARGE_500]: {
          fontFamily: FONT_FAMILY_DIN,
          fontSize: "18px",
          fontWeight: 400,
        },
        [TYPOGRAPHY_PROPS.VARIANT.HEADING]: {
          fontFamily: FONT_FAMILY_DIN,
          fontSize: "22px",
          fontWeight: 400,
          letterSpacing: "normal",
          // eslint-disable-next-line sort-keys -- disabling key order for readability
          [MEDIA_TABLET_UP]: {
            fontSize: "26px",
            letterSpacing: "normal",
          },
        },
        [TYPOGRAPHY_PROPS.VARIANT.HEADING_LARGE]: {
          fontFamily: FONT_FAMILY_DIN,
          fontSize: "26px",
          fontWeight: 400,
          letterSpacing: "normal",
          lineHeight: "34px",
          // eslint-disable-next-line sort-keys -- disabling key order for readability
          [MEDIA_TABLET_UP]: {
            fontSize: "32px",
            letterSpacing: "normal",
          },
        },
        [TYPOGRAPHY_PROPS.VARIANT.HEADING_SMALL]: {
          fontFamily: FONT_FAMILY_DIN,
          fontSize: "20px",
          fontWeight: 400,
          letterSpacing: "normal",
          // eslint-disable-next-line sort-keys -- disabling key order for readability
          [MEDIA_TABLET_UP]: {
            fontSize: "22px",
            letterSpacing: "normal",
          },
        },
        [TYPOGRAPHY_PROPS.VARIANT.HEADING_XLARGE]: {
          fontFamily: FONT_FAMILY_DIN,
          fontSize: "32px",
          fontWeight: 400,
          letterSpacing: "normal",
          // eslint-disable-next-line sort-keys -- disabling key order for readability
          [MEDIA_TABLET_UP]: {
            fontSize: "42px",
            letterSpacing: "-0.4px",
          },
        },
      },
    },
  };
}

const config: SiteConfig = makeConfig(
  BROWSER_URL,
  PORTAL_URL,
  GIT_HUB_REPO_URL,
);

export default config;
