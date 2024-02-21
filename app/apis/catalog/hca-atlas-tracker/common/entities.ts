export interface HCAAtlasTrackerAtlas {
  atlasTitle: string;
  bioNetwork: string;
  integrationLead: string;
  publication: string;
  status: ATLAS_STATUS;
  version: string;
}

export enum ATLAS_STATUS {
  DRAFT = "Draft",
  PRIVATE = "Private",
  PUBLISHED = "Published",
}
