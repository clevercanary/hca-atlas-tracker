import {
  type HCAAtlasTrackerActiveUser,
  ROLE,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { TEST_THEME } from "@/testing/theme";

jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { METHOD } from "@/app/common/entities";
import { fetchResource } from "@/app/common/utils";
import { ApiTokenForm } from "@/app/components/Forms/components/ApiToken/apiToken";
import { UNREADABLE_API_TOKEN_MESSAGE } from "@/app/hooks/UseCreateApiToken/constants";
import { AuthorizationContext } from "@/app/providers/authorization";
import {
  createQuerySnackbarWrapper,
  snackbarMessages,
  useSnackbarContexts,
} from "@/testing/snackbar";
import { createMockResponse, withConsoleErrorHiding } from "@/testing/utils";
import { ThemeProvider } from "@mui/material";
import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { type FunctionComponent } from "react";

// Drives the real `useCreateApiToken` through the page, with only `fetch`
// mocked, so the wiring from a 201 response to the token being shown (status
// check, body parsing, state) is covered, not just its parts.

const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

const TEST_TOKEN = "test-api-token-value";
const TEST_EXPIRES = "2026-11-05T12:34:56.000Z";

const CONTENT_ADMIN_ISSUER: HCAAtlasTrackerActiveUser = {
  canIssueApiTokens: true,
  disabled: false,
  email: "issuer@example.com",
  fullName: "Issuer",
  role: ROLE.CONTENT_ADMIN,
  roleAssociatedResourceIds: [],
};

/**
 * Renders the open snackbar messages, so tests can read them from the page.
 * @returns list of open snackbar messages.
 */
const SnackbarMessages: FunctionComponent = () => {
  const { snackbar } = useSnackbarContexts();
  return (
    <ul aria-label="Snackbar messages">
      {snackbarMessages(snackbar).map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("creating an API token on the page", () => {
  it("shows the token from a 201 response", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(201, { expires: TEST_EXPIRES, token: TEST_TOKEN }),
    );
    renderPage();
    fireEvent.click(screen.getByText("Create token"));
    await waitFor(() =>
      expect(screen.getByLabelText("API token")).toHaveValue(TEST_TOKEN),
    );
    expect(mockFetchResource).toHaveBeenCalledWith(
      API.ACTIVE_USER_API_TOKEN,
      METHOD.POST,
      undefined,
    );
    expect(
      screen.getByText("Expires 2026-11-05 12:34:56 (UTC)"),
    ).toBeInTheDocument();
    expect(getSnackbarMessages()).toEqual([]);
  });

  it("raises an error response on the snackbar and shows no token", async () => {
    mockFetchResource.mockResolvedValue(
      createMockResponse(403, {
        message: "API tokens are not enabled for your account",
      }),
    );
    renderPage();
    await withConsoleErrorHiding(async () => {
      fireEvent.click(screen.getByText("Create token"));
      await waitFor(() =>
        expect(getSnackbarMessages()).toEqual([
          "API tokens are not enabled for your account",
        ]),
      );
    });
    expect(screen.queryByLabelText("API token")).not.toBeInTheDocument();
  });

  it("raises a 201 with an unreadable body on the snackbar and shows no token", async () => {
    mockFetchResource.mockResolvedValue(createMockResponse(201, {}));
    renderPage();
    await withConsoleErrorHiding(async () => {
      fireEvent.click(screen.getByText("Create token"));
      await waitFor(() =>
        expect(getSnackbarMessages()).toEqual([UNREADABLE_API_TOKEN_MESSAGE]),
      );
    });
    expect(screen.queryByLabelText("API token")).not.toBeInTheDocument();
  });
});

/**
 * Get the messages of the open snackbar entries.
 * @returns open snackbar messages.
 */
function getSnackbarMessages(): string[] {
  return within(screen.getByLabelText("Snackbar messages"))
    .queryAllByRole("listitem")
    .map((item) => item.textContent ?? "");
}

/**
 * Render the API token form for a content admin who can issue tokens, with the
 * real request hooks, the snackbar and a query client.
 * @returns Render result.
 */
function renderPage(): ReturnType<typeof render> {
  const Wrapper = createQuerySnackbarWrapper();
  return render(
    <ThemeProvider theme={TEST_THEME}>
      <Wrapper>
        <AuthorizationContext.Provider value={{ user: CONTENT_ADMIN_ISSUER }}>
          <ApiTokenForm />
          <SnackbarMessages />
        </AuthorizationContext.Provider>
      </Wrapper>
    </ThemeProvider>,
  );
}
