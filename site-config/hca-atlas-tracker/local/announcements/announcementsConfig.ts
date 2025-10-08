import {
  ComponentConfig,
  ComponentsConfig,
} from "@databiosphere/findable-ui/lib/config/entities";
import * as C from "../../../../app/components";

export const announcementsConfig: ComponentsConfig = [
  {
    component: C.SessionTimeout,
    props: {
      content:
        "For security reasons, you have been logged out after one hour of inactivity.",
    },
  } as ComponentConfig<typeof C.SessionTimeout>,
];
