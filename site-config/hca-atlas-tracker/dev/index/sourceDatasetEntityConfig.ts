import {
  ComponentConfig,
  EntityConfig,
  ListConfig,
  SORT_DIRECTION,
} from "@clevercanary/data-explorer-ui/lib/config/entities";
import { EXPLORE_MODE } from "@clevercanary/data-explorer-ui/lib/hooks/useExploreMode";
import { HCAAtlasTrackerSourceDataset } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../app/components";
import * as V from "../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../category";

/**
 * Entity config object responsible to config anything related to the /source-datasets route.
 */
export const sourceDatasetEntityConfig: EntityConfig = {
  apiPath: "api/entities/source-datasets",
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [],
    top: [],
  },
  exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
  label: "Source Datasets",
  list: {
    columns: [
      {
        componentConfig: {
          component: C.Link,
          viewBuilder: V.buildProjectTitle,
        } as ComponentConfig<typeof C.Link, HCAAtlasTrackerSourceDataset>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PROJECT_TITLE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.PROJECT_TITLE,
        width: { max: "2fr", min: "374px" },
      },
      {
        componentConfig: {
          component: C.NTagCell,
          viewBuilder: V.buildSpecies,
        } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerSourceDataset>,
        disableHiding: true,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.SPECIES,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.SPECIES,
        width: { max: "1fr", min: "136px" },
      },
      {
        componentConfig: {
          component: C.NTagCell,
          viewBuilder: V.buildLibraryConstructionMethod,
        } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerSourceDataset>,
        disableHiding: true,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.LIBRARY_CONSTRUCTION_METHOD,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.LIBRARY_CONSTRUCTION_METHOD,
        width: { max: "1fr", min: "136px" },
      },
      {
        componentConfig: {
          component: C.NTagCell,
          viewBuilder: V.buildAnatomicalEntity,
        } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerSourceDataset>,
        disableHiding: true,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ANATOMICAL_ENTITY,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ANATOMICAL_ENTITY,
        width: { max: "1fr", min: "136px" },
      },
      {
        componentConfig: {
          component: C.PinnedNTagCell,
          viewBuilder: V.buildDonorDisease,
        } as ComponentConfig<
          typeof C.PinnedNTagCell,
          HCAAtlasTrackerSourceDataset
        >,
        disableHiding: true,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DONOR_DISEASE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.DONOR_DISEASE,
        width: { max: "1fr", min: "136px" },
      },
      {
        componentConfig: {
          component: C.Cell,
          viewBuilder: V.buildEstimatedCellCount,
        } as ComponentConfig<typeof C.Cell, HCAAtlasTrackerSourceDataset>,
        disableHiding: true,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ESTIMATED_CELL_COUNT,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ESTIMATED_CELL_COUNT,
        width: { max: "1fr", min: "136px" },
      },
    ],
    defaultSort: {
      desc: SORT_DIRECTION.ASCENDING,
      id: HCA_ATLAS_TRACKER_CATEGORY_KEY.PROJECT_TITLE,
    },
  } as ListConfig<HCAAtlasTrackerSourceDataset>,
  listView: {
    disablePagination: true,
  },
  route: "source-datasets",
};
