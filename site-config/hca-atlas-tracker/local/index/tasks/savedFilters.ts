import {
  SavedFilter,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { ColumnSort } from "@tanstack/react-table";
import { VALIDATION_DESCRIPTION } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  SYSTEM,
  TASK_STATUS,
} from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { HCA_ATLAS_TRACKER_CATEGORY_KEY } from "../../../category";

const SORTING: ColumnSort[] = [
  {
    desc: SORT_DIRECTION.ASCENDING,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TARGET_COMPLETION_DATE,
  },
  {
    desc: SORT_DIRECTION.ASCENDING,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ATLAS_NAMES,
  },
  {
    desc: SORT_DIRECTION.ASCENDING,
    id: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
  },
];

const CAP_INGEST_BACKLOG: SavedFilter = {
  filters: [
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
      value: [VALIDATION_DESCRIPTION.INGEST_SOURCE_STUDY],
    },
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
      value: [TASK_STATUS.TODO, TASK_STATUS.BLOCKED],
    },
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
      value: [SYSTEM.CAP],
    },
  ],
  sorting: SORTING,
  title: "CAP - Ingest backlog",
};

const CELLXGENE_INGEST_BACKLOG: SavedFilter = {
  filters: [
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
      value: [VALIDATION_DESCRIPTION.INGEST_SOURCE_STUDY],
    },
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
      value: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.TODO],
    },
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
      value: [SYSTEM.CELLXGENE],
    },
  ],
  sorting: SORTING,
  title: "CELLxGENE - Ingest backlog",
};

const COMPLETED_TASKS: SavedFilter = {
  filters: [
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
      value: [TASK_STATUS.DONE],
    },
  ],
  sorting: [
    {
      desc: SORT_DIRECTION.DESCENDING,
      id: HCA_ATLAS_TRACKER_CATEGORY_KEY.RESOLVED_AT,
    },
  ],
  title: "Completed Tasks",
};

const HCA_DATA_REPOSITORY_MISSING_NETWORK_OR_ATLAS: SavedFilter = {
  filters: [
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
      value: [VALIDATION_DESCRIPTION.LINK_PROJECT_BIONETWORKS_AND_ATLASES],
    },
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
      value: [TASK_STATUS.TODO],
    },
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
      value: [SYSTEM.HCA_DATA_REPOSITORY],
    },
  ],
  sorting: SORTING,
  title: "HCA Data Repository - Missing Network or Atlas",
};

const HCA_DATA_REPOSITORY_NO_MATCHING_TITLE: SavedFilter = {
  filters: [
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
      value: [VALIDATION_DESCRIPTION.UPDATE_TITLE_TO_MATCH_PUBLICATION],
    },
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
      value: [TASK_STATUS.TODO],
    },
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
      value: [SYSTEM.HCA_DATA_REPOSITORY],
    },
  ],
  sorting: SORTING,
  title:
    "HCA Data Repository -  project title does not match publication title",
};

const HCA_DATA_REPOSITORY_NO_PRIMARY_DATA: SavedFilter = {
  filters: [
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.DESCRIPTION,
      value: [VALIDATION_DESCRIPTION.ADD_PRIMARY_DATA],
    },
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.TASK_STATUS,
      value: [TASK_STATUS.TODO],
    },
    {
      categoryKey: HCA_ATLAS_TRACKER_CATEGORY_KEY.SYSTEM,
      value: [SYSTEM.HCA_DATA_REPOSITORY],
    },
  ],
  sorting: SORTING,
  title: "HCA Data Repository - no primary data",
};

export const SAVED_FILTERS: SavedFilter[] = [
  CAP_INGEST_BACKLOG,
  CELLXGENE_INGEST_BACKLOG,
  COMPLETED_TASKS,
  HCA_DATA_REPOSITORY_NO_PRIMARY_DATA,
  HCA_DATA_REPOSITORY_NO_MATCHING_TITLE,
  HCA_DATA_REPOSITORY_MISSING_NETWORK_OR_ATLAS,
];
