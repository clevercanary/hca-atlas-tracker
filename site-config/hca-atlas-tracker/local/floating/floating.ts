import * as C from "@/app/components";
import { REL_ATTRIBUTE } from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import {
  type ComponentConfig,
  type FloatingConfig,
} from "@databiosphere/findable-ui/lib/config/entities";

export const floating: FloatingConfig = {
  components: [
    {
      component: C.ViewSupport,
      props: {
        rel: REL_ATTRIBUTE.NO_OPENER_NO_REFERRER,
        url: "https://github.com/clevercanary/hca-atlas-tracker/issues/new?template=feedback.md",
      },
    } as ComponentConfig<typeof C.ViewSupport>,
  ],
};
