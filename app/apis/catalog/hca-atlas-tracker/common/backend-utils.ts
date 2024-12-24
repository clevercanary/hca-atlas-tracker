import { getCellxGeneCollectionById } from "../../../../services/cellxgene";
import {
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerDBAtlasWithComponentAtlases,
} from "./entities";

export function dbAtlasToApiAtlas(
  dbAtlas: HCAAtlasTrackerDBAtlasWithComponentAtlases
): HCAAtlasTrackerAtlas {
  return {
    bioNetwork: dbAtlas.overview.network,
    cellxgeneAtlasCollection: dbAtlas.overview.cellxgeneAtlasCollection,
    cellxgeneAtlasCollectionTitle:
      dbAtlas.overview.cellxgeneAtlasCollection &&
      (getCellxGeneCollectionById(dbAtlas.overview.cellxgeneAtlasCollection)
        ?.title ??
        null),
    codeLinks: dbAtlas.overview.codeLinks,
    completedTaskCount: dbAtlas.overview.completedTaskCount,
    componentAtlasCount: dbAtlas.component_atlas_count,
    description: dbAtlas.overview.description,
    highlights: dbAtlas.overview.highlights,
    id: dbAtlas.id,
    integrationLead: dbAtlas.overview.integrationLead,
    metadataSpecificationUrl: dbAtlas.overview.metadataSpecificationUrl,
    publications: dbAtlas.overview.publications,
    shortName: dbAtlas.overview.shortName,
    sourceDatasetCount: dbAtlas.source_datasets.length,
    sourceStudyCount: dbAtlas.source_studies.length,
    status: dbAtlas.status,
    targetCompletion: dbAtlas.target_completion?.toISOString() ?? null,
    taskCount: dbAtlas.overview.taskCount,
    title: "",
    version: dbAtlas.overview.version,
    wave: dbAtlas.overview.wave,
  };
}
