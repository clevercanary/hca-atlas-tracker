import {
  ComponentConfig,
  ComponentsConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerListAtlas } from "../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import * as C from "../../../../app/components";
import * as MDX from "../../../../app/components/common/MDXContent/index";

export const subTitleHero: ComponentsConfig = [
  {
    children: [
      {
        children: [
          {
            component: MDX.ConfidentialNotice,
          } as ComponentConfig<typeof MDX.ConfidentialNotice>,
        ],
        component: C.AlertText,
      } as ComponentConfig<typeof C.AlertText>,
    ],
    component: C.FluidAlert,
    props: {
      severity: "warning",
      title: "This tracker is confidential",
    },
  } as ComponentConfig<typeof C.FluidAlert, HCAAtlasTrackerListAtlas>,
];
