import { getLandingHeaderProps } from "@/app/components/Layout/components/Header/utils";
import { announcementsConfig } from "@/site-config/hca-atlas-tracker/local/announcements/announcementsConfig";
import { type HeaderProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";

describe("getLandingHeaderProps", () => {
  it("carries announcements through, so the inactivity banner can render on the landing page", () => {
    const header = { announcements: announcementsConfig } as HeaderProps;
    expect(getLandingHeaderProps(header).announcements).toBe(
      announcementsConfig,
    );
  });

  it("leaves announcements undefined when the app header configures none", () => {
    expect(
      getLandingHeaderProps({} as HeaderProps).announcements,
    ).toBeUndefined();
  });

  it("tolerates an undefined header", () => {
    expect(getLandingHeaderProps(undefined).announcements).toBeUndefined();
  });
});
