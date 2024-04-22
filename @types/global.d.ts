/* eslint-disable no-var -- var is required to make variables global */

declare var hcaAtlasTrackerProjectsInfoCache:
  | undefined
  | import("../app/services/hca-projects").ProjectsInfo;

declare var hcaAtlasTrackerCellxGeneInfoCache:
  | undefined
  | import("../app/services/cellxgene").CellxGeneInfo;

/* eslint-enable no-var -- Paired enable for above disable */
