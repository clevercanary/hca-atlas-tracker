import { HCAAtlasTrackerAtlas, HCAAtlasTrackerDBAtlas } from "./entities";

export function getAtlasId(atlas: HCAAtlasTrackerAtlas): string {
  return atlas.atlasId;
}

export function dbAtlasToListAtlas(
  dbAtlas: HCAAtlasTrackerDBAtlas
): HCAAtlasTrackerAtlas {
  return {
    atlasId: dbAtlas.id,
    atlasName: `${dbAtlas.overview.short_name} ${dbAtlas.overview.version}`,
    atlasTitle: "",
    bioNetwork: dbAtlas.overview.network,
    codeUrl: "",
    componentAtlases: [],
    cxgCollectionId: null,
    description: null,
    focus: dbAtlas.overview.short_name,
    integrationLead: "",
    integrationLeadEmail: "",
    networkCoordinator: {
      coordinatorNames: [],
      email: "",
    },
    publication: "",
    publicationUrl: "",
    sourceDatasets: [],
    status: dbAtlas.status,
    version: dbAtlas.overview.version,
  };
}
