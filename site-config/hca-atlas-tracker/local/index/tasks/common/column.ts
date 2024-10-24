import {
  ColumnConfig,
  ComponentConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../../../app/components";
import * as V from "../../../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../../../category";

export const ATLAS_NAMES: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  componentConfig: {
    component: C.NTagCell,
    viewBuilder: V.buildTaskAtlasNames,
  } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerListValidationRecord>,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_NAMES,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
  width: { max: "0.5fr", min: "120px" },
};

export const ATLAS_VERSIONS: ColumnConfig<HCAAtlasTrackerListValidationRecord> =
  {
    columnVisible: false,
    componentConfig: {
      component: C.NTagCell,
      viewBuilder: V.buildTaskAtlasVersions,
    } as ComponentConfig<
      typeof C.NTagCell,
      HCAAtlasTrackerListValidationRecord
    >,
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ATLAS_VERSIONS,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_VERSIONS,
    width: { max: "0.5fr", min: "120px" },
  };

export const CREATED_AT: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  columnVisible: false,
  componentConfig: {
    component: C.BasicCell,
    viewBuilder: V.buildCreatedAt,
  } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListValidationRecord>,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.CREATED_AT,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.CREATED_AT,
  width: { max: "0.65fr", min: "120px" },
};

export const DESCRIPTION: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  columnPinned: true,
  componentConfig: {
    component: C.ButtonTextPrimaryCell,
    viewBuilder: V.buildTaskDescription,
  } as ComponentConfig<
    typeof C.ButtonTextPrimaryCell,
    HCAAtlasTrackerListValidationRecord
  >,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DESCRIPTION, // Task.
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
  width: { max: "1fr", min: "220px" },
};

export const DOI: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  componentConfig: {
    component: C.Link,
    viewBuilder: V.buildTaskDoi,
  } as ComponentConfig<typeof C.Link, HCAAtlasTrackerListValidationRecord>,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DOI,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.DOI,
  width: { max: "1fr", min: "240px" },
};

export const ENTITY_TITLE: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  columnVisible: false,
  componentConfig: {
    component: C.BasicCell,
    viewBuilder: V.buildEntityTitle,
  } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListValidationRecord>,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ENTITY_TITLE,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ENTITY_TITLE,
  width: { max: "1fr", min: "220px" },
};

export const ENTITY_TYPE: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  columnVisible: false,
  componentConfig: {
    component: C.BasicCell,
    viewBuilder: V.buildEntityType,
  } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListValidationRecord>,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ENTITY_TYPE,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ENTITY_TYPE,
  width: { max: "0.5fr", min: "200px" },
};

export const NETWORKS: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  columnVisible: false,
  componentConfig: {
    component: C.BioNetworkCell,
    viewBuilder: V.buildTaskNetworks,
  } as ComponentConfig<
    typeof C.BioNetworkCell,
    HCAAtlasTrackerListValidationRecord
  >,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.NETWORKS,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.NETWORKS,
  width: { max: "1fr", min: "212px" },
};

export const PUBLICATION_STRING: ColumnConfig<HCAAtlasTrackerListValidationRecord> =
  {
    componentConfig: {
      component: C.Link,
      viewBuilder: V.buildTaskPublicationString,
    } as ComponentConfig<typeof C.Link, HCAAtlasTrackerListValidationRecord>,
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.PUBLICATION_STRING,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.PUBLICATION_STRING,
    width: { max: "1fr", min: "220px" },
  };

export const RELATED_ENTITY_URL: ColumnConfig<HCAAtlasTrackerListValidationRecord> =
  {
    componentConfig: {
      component: C.Link,
      viewBuilder: V.buildTaskRelatedEntityUrl,
    } as ComponentConfig<typeof C.Link, HCAAtlasTrackerListValidationRecord>,
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.RELATED_ENTITY_URL, // Resource.
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.RELATED_ENTITY_URL,
    width: { max: "1fr", min: "220px" },
  };

export const RESOLVED_AT: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  componentConfig: {
    component: C.BasicCell,
    viewBuilder: V.buildResolvedAt,
  } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListValidationRecord>,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.RESOLVED_AT,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.RESOLVED_AT,
  width: { max: "0.65fr", min: "120px" },
};

export const SYSTEM: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  componentConfig: {
    component: C.BasicCell,
    viewBuilder: V.buildSystem,
  } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListValidationRecord>,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.SYSTEM,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
  width: { max: "0.5fr", min: "220px" },
};

export const TARGET_COMPLETION: ColumnConfig<HCAAtlasTrackerListValidationRecord> =
  {
    componentConfig: {
      component: C.BasicCell,
      viewBuilder: V.buildTargetCompletion,
    } as ComponentConfig<
      typeof C.BasicCell,
      HCAAtlasTrackerListValidationRecord
    >,
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TARGET_COMPLETION_DATE,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
    width: { max: "0.65fr", min: "120px" },
  };

export const TASK_STATUS: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  componentConfig: {
    component: C.StatusBadge,
    viewBuilder: V.buildTaskStatus,
  } as ComponentConfig<
    typeof C.StatusBadge,
    HCAAtlasTrackerListValidationRecord
  >,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.TASK_STATUS,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
  width: { max: "0.5fr", min: "120px" },
};

export const UPDATED_AT: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  columnVisible: false,
  componentConfig: {
    component: C.BasicCell,
    viewBuilder: V.buildUpdatedAt,
  } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerListValidationRecord>,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.UPDATED_AT,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.UPDATED_AT,
  width: { max: "0.65fr", min: "120px" },
};

export const WAVES: ColumnConfig<HCAAtlasTrackerListValidationRecord> = {
  columnVisible: false,
  componentConfig: {
    component: C.NTagCell,
    viewBuilder: V.buildTaskWaves,
  } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerListValidationRecord>,
  header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.WAVES,
  id: HCA_ATLAS_TRACKER_CATEGORY_KEY.WAVES,
  width: { max: "0.5fr", min: "68px" },
};

export const VALIDATION_TYPE: ColumnConfig<HCAAtlasTrackerListValidationRecord> =
  {
    columnVisible: false,
    componentConfig: {
      component: C.BasicCell,
      viewBuilder: V.buildValidationType,
    } as ComponentConfig<
      typeof C.BasicCell,
      HCAAtlasTrackerListValidationRecord
    >,
    header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.VALIDATION_TYPE, // Task Type.
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.VALIDATION_TYPE,
    width: { max: "0.5fr", min: "120px" },
  };
