import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";

const mockGet = jest.fn();
jest.mock("next/navigation", () => ({
  useSearchParams: (): { get: jest.Mock } => ({ get: mockGet }),
}));
jest.mock("next/router", () => ({
  __esModule: true,
  default: { replace: jest.fn() },
}));

import { getLandingHeaderProps } from "@/app/components/Layout/components/Header/utils";
import { announcementsConfig } from "@/site-config/hca-atlas-tracker/local/announcements/announcementsConfig";
import { TEST_THEME } from "@/testing/theme";
import { Announcements } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/components/Announcements/announcements";
import { type HeaderProps } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";
import { ThemeProvider } from "@mui/material";
import { type JSX } from "react";

const BANNER_TEXT =
  "For security reasons, you have been logged out due to inactivity.";

/**
 * Renders the announcements slot exactly as the landing header does: the
 * configured app-header announcements (see `layout.header` in
 * `site-config/.../config.ts`) put through `getLandingHeaderProps`.
 *
 * Builds the header prop inline rather than importing `config()`, which pulls
 * MDX that Jest cannot transform.
 * @returns The rendered announcements slot.
 */
function renderLandingAnnouncements(): JSX.Element {
  const { announcements } = getLandingHeaderProps({
    announcements: announcementsConfig,
  } as HeaderProps);
  return (
    <ThemeProvider theme={TEST_THEME}>
      <Announcements announcements={announcements} />
    </ThemeProvider>
  );
}

describe("landing header announcements", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("shows the inactivity banner when inactivityTimeout=true is on the URL", () => {
    mockGet.mockReturnValue("true");
    render(renderLandingAnnouncements());
    expect(screen.getByText(BANNER_TEXT)).toBeVisible();
  });

  it("shows no banner without the param", () => {
    mockGet.mockReturnValue(null);
    render(renderLandingAnnouncements());
    expect(screen.queryByText(BANNER_TEXT)).not.toBeInTheDocument();
  });

  it("dismisses the banner when the close button is clicked", async () => {
    mockGet.mockReturnValue("true");
    render(renderLandingAnnouncements());
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    // The banner is wrapped in a `Fade` with `unmountOnExit`, so it leaves the
    // DOM only once the transition finishes.
    await waitForElementToBeRemoved(() => screen.queryByText(BANNER_TEXT));
  });
});
