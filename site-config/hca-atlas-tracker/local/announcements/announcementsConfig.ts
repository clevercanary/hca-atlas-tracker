import * as C from "@/app/components";
import {
  type ComponentConfig,
  type ComponentsConfig,
} from "@databiosphere/findable-ui/lib/config/entities";

export const announcementsConfig: ComponentsConfig = [
  {
    component: C.SessionTimeout,
    props: {
      // Two paths raise this banner: the 1-hour idle timer and passive JWT
      // expiry (a refetch poll interrupted for longer than SESSION_MAX_AGE).
      // The copy names no duration so it stays true of both.
      content:
        "For security reasons, you have been logged out due to inactivity.",
    },
  } as ComponentConfig<typeof C.SessionTimeout>,
];
