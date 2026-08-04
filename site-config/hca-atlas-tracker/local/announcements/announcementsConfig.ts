import * as C from "@/app/components";
import {
  type ComponentConfig,
  type ComponentsConfig,
} from "@databiosphere/findable-ui/lib/config/entities";

export const announcementsConfig: ComponentsConfig = [
  {
    component: C.SessionTimeout,
    props: {
      content:
        "For security reasons, you have been logged out after one hour of inactivity.",
    },
  } as ComponentConfig<typeof C.SessionTimeout>,
];
