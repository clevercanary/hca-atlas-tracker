import { Breakpoints } from "@mui/system";

export const ATLAS_ECOSYSTEM_PATHS = {
  CELLXGENE_COLLECTION: "/collections",
  HCA_PROJECT: "/projects",
};
export const ATLAS_ECOSYSTEM_URLS = {
  CELLXGENE_PORTAL: "https://cellxgene.cziscience.com",
  HCA_EXPLORER: "https://explore.data.humancellatlas.org",
};

export const BREAKPOINTS: Partial<Breakpoints> = {
  values: {
    lg: 1440,
    md: 1280,
    sm: 1024,
    xs: 0,
  } as Breakpoints["values"], // TODO(cc) add "xl" breakpoint.
};
