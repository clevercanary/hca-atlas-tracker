import {
  type FileId,
  type PresignedUrlInfo,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { TEST_THEME } from "@/testing/theme";
import { withConsoleErrorHiding } from "@/testing/utils";

jest.mock(
  "@/app/components/Entity/components/common/Table/components/TableCell/components/FileDownloadCell/hooks/UseRequestPreSignedURL/hook",
  () => ({ useRequestPreSignedURL: jest.fn() }),
);

import { Dialog } from "@/app/components/Entity/components/common/Table/components/TableCell/components/FileDownloadCell/components/Dialog/dialog";
import { useRequestPreSignedURL } from "@/app/components/Entity/components/common/Table/components/TableCell/components/FileDownloadCell/hooks/UseRequestPreSignedURL/hook";
import { ThemeProvider } from "@mui/material";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

const mockUseRequestPreSignedURL =
  useRequestPreSignedURL as jest.MockedFunction<typeof useRequestPreSignedURL>;

const FILE_ID = "file-1" as FileId;
const STALE_URL = "https://s3.example.com/presigned/OLD";
const FRESH_URL = "https://s3.example.com/presigned/FRESH";

afterEach(() => {
  jest.clearAllMocks();
});

describe("file download Dialog presigned-URL gating", () => {
  it("does not expose the URL while the query is fetching (dialog reopen)", async () => {
    // Simulate a reopen refetch: previous data.url is still populated but
    // isFetching is true, so the freshly-generated URL hasn't landed yet.
    mockUseRequestPreSignedURL.mockReturnValue(
      hookResultOf({ filename: "old.h5ad", url: STALE_URL }, true),
    );

    // The disabled Download button renders href="" (a MUI-typing workaround so
    // the `download` prop stays valid on the Button), which React warns about;
    // expected while the URL is gated.
    await withConsoleErrorHiding(async () => {
      renderDialog();
    });

    const control = getDownloadControl();
    expect(control).toBeDisabled();
    expect(control).not.toHaveAttribute("href", STALE_URL);
    // CodeSection shows the loading state, not the (stale) URL.
    expect(screen.queryByText("Presigned URL")).not.toBeInTheDocument();
    expect(screen.queryByText(STALE_URL)).not.toBeInTheDocument();
  });

  it("exposes the freshly-fetched URL once the query settles", () => {
    mockUseRequestPreSignedURL.mockReturnValue(
      hookResultOf({ filename: "fresh.h5ad", url: FRESH_URL }, false),
    );

    renderDialog();

    const control = getDownloadControl();
    expect(control).not.toBeDisabled();
    expect(control).toHaveAttribute("href", FRESH_URL);
    expect(screen.getByText("Presigned URL")).toBeInTheDocument();
  });
});

/**
 * Get the Download control (an anchor when enabled, a button when disabled).
 * @returns The Download control element.
 */
function getDownloadControl(): HTMLElement {
  return screen.getByText("Download").closest("a, button") as HTMLElement;
}

/**
 * Build a minimal useRequestPreSignedURL() return exposing data and isFetching.
 * @param data - Presigned URL info, or undefined.
 * @param isFetching - Whether the query is fetching.
 * @returns Mock hook return.
 */
function hookResultOf(
  data: PresignedUrlInfo | undefined,
  isFetching: boolean,
): ReturnType<typeof useRequestPreSignedURL> {
  return { data, isFetching } as ReturnType<typeof useRequestPreSignedURL>;
}

/**
 * Render the download Dialog (open) within the app theme.
 * @returns Render result.
 */
function renderDialog(): ReturnType<typeof render> {
  return render(
    <ThemeProvider theme={TEST_THEME}>
      <Dialog fileId={FILE_ID} onClose={jest.fn()} open />
    </ThemeProvider>,
  );
}
