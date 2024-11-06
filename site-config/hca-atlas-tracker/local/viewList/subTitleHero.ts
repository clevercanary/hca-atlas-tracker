import { ALERT_PROPS } from "@databiosphere/findable-ui/lib/components/common/Alert/constants";
import {
  ComponentConfig,
  ComponentsConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import { SIZE } from "@databiosphere/findable-ui/lib/styles/common/constants/size";
import * as C from "../../../../app/components";
import * as MDX from "../../../../app/components/common/MDXContent/index";

export const subTitleHero: ComponentsConfig = [
  {
    component: MDX.ConfidentialNotice,
    props: {
      ...ALERT_PROPS.STANDARD_WARNING,
      component: C.FluidPaper,
      size: SIZE.LARGE,
    },
  } as ComponentConfig<typeof MDX.ConfidentialNotice>,
];
