import {
  ColumnConfig,
  ComponentConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListSourceStudy } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../../app/components";
import * as V from "../../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../../category";

export const ATLASES: ColumnConfig<HCAAtlasTrackerListSourceStudy> = {
  componentConfig: {
    component: C.LinksCell,
    viewBuilder: V.buildSourceStudyAtlases,
  } as ComponentConfig<typeof C.LinksCell, HCAAtlasTrackerListSourceStudy>,
  enableGrouping: false,
  enableSorting: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_NAMES,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
  width: { max: "1fr", min: "180px" },
};

export const HCA_DATA_REPOSITORY_STATUS: ColumnConfig<HCAAtlasTrackerListSourceStudy> =
  {
    componentConfig: {
      component: C.IconStatusBadge,
      viewBuilder: V.buildSourceStudyHcaDataRepositoryStatus,
    } as ComponentConfig<
      typeof C.IconStatusBadge,
      HCAAtlasTrackerListSourceStudy
    >,
    enableGrouping: false,
    enableSorting: false,
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.HCA_DATA_REPOSITORY,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.HCA_DATA_REPOSITORY,
    width: { max: "160px", min: "160px" },
  };

export const JOURNAL: ColumnConfig<HCAAtlasTrackerListSourceStudy> = {
  componentConfig: {
    component: C.BasicCell,
    viewBuilder: V.buildSourceStudyJournal,
  } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListSourceStudy>,
  enableGrouping: false,
  enableHiding: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.JOURNAL,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.JOURNAL,
  width: { max: "1fr", min: "160px" },
};

export const NETWORKS: ColumnConfig<HCAAtlasTrackerListSourceStudy> = {
  componentConfig: {
    component: C.BioNetworksCell,
    viewBuilder: V.buildSourceStudyBioNetworks,
  } as ComponentConfig<
    typeof C.BioNetworksCell,
    HCAAtlasTrackerListSourceStudy
  >,
  enableGrouping: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.NETWORKS,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.NETWORKS,
  width: { max: "1fr", min: "212px" },
};

export const PUBLICATION: ColumnConfig<HCAAtlasTrackerListSourceStudy> = {
  componentConfig: {
    component: C.Link,
    viewBuilder: V.buildSourceStudyPublication,
  } as ComponentConfig<typeof C.Link, HCAAtlasTrackerListSourceStudy>,
  enableGrouping: false,
  enableSorting: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.DOI,
  width: { max: "120px", min: "120px" },
};

export const PUBLICATION_STATUS: ColumnConfig<HCAAtlasTrackerListSourceStudy> =
  {
    componentConfig: {
      component: C.BasicCell,
      viewBuilder: V.buildSourceStudyPublicationStatus,
    } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListSourceStudy>,
    enableGrouping: false,
    enableHiding: false,
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION_STATUS,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION_STATUS,
    width: { max: "120px", min: "120px" },
  };

export const PUBLICATION_STRING: ColumnConfig<HCAAtlasTrackerListSourceStudy> =
  {
    columnPinned: true,
    componentConfig: {
      component: C.TooltipLink,
      viewBuilder: V.buildSourceStudyName,
    } as ComponentConfig<typeof C.TooltipLink, HCAAtlasTrackerListSourceStudy>,
    enableGrouping: false,
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION_STRING,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION_STRING,
    width: { max: "1.5fr", min: "240px" },
  };

export const SOURCE_DATASET_COUNT: ColumnConfig<HCAAtlasTrackerListSourceStudy> =
  {
    componentConfig: {
      component: C.BasicCell,
      viewBuilder: V.buildSourceStudySourceDatasetCount,
    } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListSourceStudy>,
    enableGrouping: false,
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.SOURCE_DATASET_COUNT,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.SOURCE_DATASET_COUNT,
    width: { max: "0.5fr", min: "112px" },
  };
