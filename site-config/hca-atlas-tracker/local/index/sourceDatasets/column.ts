import {
  ColumnConfig,
  ComponentConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListSourceDataset } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../../app/components";
import * as V from "../../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../../category";

export const ASSAY: ColumnConfig<HCAAtlasTrackerListSourceDataset> = {
  componentConfig: {
    component: C.NTagCell,
    viewBuilder: V.buildAssay,
  } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerListSourceDataset>,
  enableGrouping: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ASSAY,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ASSAY,
  width: { max: "1fr", min: "160px" },
};

export const ATLASES: ColumnConfig<HCAAtlasTrackerListSourceDataset> = {
  componentConfig: {
    component: C.LinksCell,
    viewBuilder: V.buildSourceDatasetAtlases,
  } as ComponentConfig<typeof C.LinksCell, HCAAtlasTrackerListSourceDataset>,
  enableGrouping: false,
  enableSorting: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_NAMES,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
  width: { max: "1fr", min: "180px" },
};

export const CAP_INGEST_STATUS: ColumnConfig<HCAAtlasTrackerListSourceDataset> =
  {
    componentConfig: {
      component: C.CAPIngestStatusCell,
      viewBuilder: V.buildCapIngestStatus,
    } as ComponentConfig<
      typeof C.CAPIngestStatusCell,
      HCAAtlasTrackerListSourceDataset
    >,
    enableGrouping: false,
    enableSorting: false,
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.CAP_INGEST_STATUS,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.CAP_INGEST_STATUS,
    width: { max: "1fr", min: "180px" },
  };

export const CELL_COUNT: ColumnConfig<HCAAtlasTrackerListSourceDataset> = {
  componentConfig: {
    component: C.BasicCell,
    viewBuilder: V.buildCellCount,
  } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListSourceDataset>,
  enableGrouping: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.CELL_COUNT,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.CELL_COUNT,
  width: { max: "0.5fr", min: "112px" },
};

export const FILE_NAME: ColumnConfig<HCAAtlasTrackerListSourceDataset> = {
  columnPinned: true,
  componentConfig: {
    component: C.Link,
    viewBuilder: V.buildSourceDatasetFileName,
  } as ComponentConfig<typeof C.Link, HCAAtlasTrackerListSourceDataset>,
  enableGrouping: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.FILE_NAME,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.FILE_NAME,
  width: { max: "1.5fr", min: "240px" },
};

export const NETWORKS: ColumnConfig<HCAAtlasTrackerListSourceDataset> = {
  componentConfig: {
    component: C.BioNetworksCell,
    viewBuilder: V.buildSourceDatasetBioNetworks,
  } as ComponentConfig<
    typeof C.BioNetworksCell,
    HCAAtlasTrackerListSourceDataset
  >,
  enableGrouping: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.NETWORKS,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.NETWORKS,
  width: { max: "1fr", min: "212px" },
};

export const SUSPENSION_TYPE: ColumnConfig<HCAAtlasTrackerListSourceDataset> = {
  componentConfig: {
    component: C.NTagCell,
    viewBuilder: V.buildSuspensionType,
  } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerListSourceDataset>,
  enableGrouping: false,
  enableHiding: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.SUSPENSION_TYPE,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.SUSPENSION_TYPE,
  width: { max: "1fr", min: "160px" },
};

export const TISSUE: ColumnConfig<HCAAtlasTrackerListSourceDataset> = {
  componentConfig: {
    component: C.NTagCell,
    viewBuilder: V.buildTissue,
  } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerListSourceDataset>,
  enableGrouping: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TISSUE,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TISSUE,
  width: { max: "1fr", min: "160px" },
};

export const TITLE: ColumnConfig<HCAAtlasTrackerListSourceDataset> = {
  componentConfig: {
    component: C.BasicCell,
    viewBuilder: V.buildSourceDatasetTitle,
  } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListSourceDataset>,
  enableGrouping: false,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TITLE,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TITLE,
  width: { max: "1.5fr", min: "220px" },
};

export const VALIDATION_STATUS: ColumnConfig<HCAAtlasTrackerListSourceDataset> =
  {
    componentConfig: {
      component: C.ValidationStatusCell,
      viewBuilder: V.buildSourceDatasetValidationStatus,
    } as ComponentConfig<
      typeof C.ValidationStatusCell,
      HCAAtlasTrackerListSourceDataset
    >,
    enableGrouping: false,
    enableSorting: false,
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.VALIDATION_STATUS,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.VALIDATION_STATUS,
    width: { max: "1fr", min: "200px" },
  };
