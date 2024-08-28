import {
  ComponentConfig,
  EntityConfig,
  ListConfig,
  SORT_DIRECTION,
} from "@databiosphere/findable-ui/lib/config/entities";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode";
import { HCAAtlasTrackerUser } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { getUserId } from "../../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import * as C from "../../../../app/components";
import { mapSelectCategoryValue } from "../../../../app/config/utils";
import * as V from "../../../../app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  HCA_ATLAS_TRACKER_CATEGORY_KEY,
  HCA_ATLAS_TRACKER_CATEGORY_LABEL,
} from "../../category";

/**
 * Entity config object responsible to config anything related to the /users route.
 */
export const userEntityConfig: EntityConfig = {
  apiPath: "api/users",
  categoryGroupConfig: {
    categoryGroups: [
      {
        categoryConfigs: [
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.FULL_NAME,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.FULL_NAME,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.EMAIL,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.EMAIL,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ROLE,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ROLE,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.ROLE_ASSOCIATED_RESOURCE_NAMES,
            label:
              HCA_ATLAS_TRACKER_CATEGORY_LABEL.ROLE_ASSOCIATED_RESOURCE_NAMES,
          },
          {
            key: HCA_ATLAS_TRACKER_CATEGORY_KEY.DISABLED,
            label: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DISABLED,
            mapSelectCategoryValue: mapSelectCategoryValue((value) =>
              value.toString()
            ),
          },
        ],
      },
    ],
    key: "user",
  },
  detail: {
    detailOverviews: [],
    staticLoad: true,
    tabs: [],
    top: [],
  },
  exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
  explorerTitle: "Team",
  getId: getUserId,
  label: "Team",
  list: {
    columns: [
      {
        componentConfig: {
          component: C.BasicCell,
          viewBuilder: V.buildUserFullName,
        } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerUser>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.FULL_NAME,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.FULL_NAME,
        width: { max: "1fr", min: "160px" },
      },
      {
        componentConfig: {
          component: C.BasicCell,
          viewBuilder: V.buildUserEmail,
        } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerUser>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.EMAIL,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.EMAIL,
        width: { max: "1fr", min: "160px" },
      },
      {
        componentConfig: {
          component: C.BasicCell,
          viewBuilder: V.buildUserRole,
        } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerUser>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ROLE,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ROLE,
        width: { max: "1fr", min: "160px" },
      },
      {
        componentConfig: {
          component: C.NTagCell,
          viewBuilder: V.buildUserAssociatedResources,
        } as ComponentConfig<typeof C.NTagCell, HCAAtlasTrackerUser>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.ROLE_ASSOCIATED_RESOURCE_NAMES,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.ROLE_ASSOCIATED_RESOURCE_NAMES,
        width: { max: "0.5fr", min: "112px" },
      },
      {
        componentConfig: {
          component: C.BasicCell,
          viewBuilder: V.buildUserDisabled,
        } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerUser>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.DISABLED,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.DISABLED,
        width: { max: "0.5fr", min: "112px" },
      },
      {
        componentConfig: {
          component: C.BasicCell,
          viewBuilder: V.buildUserLastLogin,
        } as ComponentConfig<typeof C.BasicCell, HCAAtlasTrackerUser>,
        header: HCA_ATLAS_TRACKER_CATEGORY_LABEL.LAST_LOGIN,
        id: HCA_ATLAS_TRACKER_CATEGORY_KEY.LAST_LOGIN,
        width: { max: "1fr", min: "160px" },
      },
    ],
    defaultSort: {
      desc: SORT_DIRECTION.ASCENDING,
      id: HCA_ATLAS_TRACKER_CATEGORY_KEY.FULL_NAME,
    },
  } as ListConfig<HCAAtlasTrackerUser>,
  listView: {
    disablePagination: true,
    enableDownload: true,
    enableTab: false,
  },
  route: "team",
};
