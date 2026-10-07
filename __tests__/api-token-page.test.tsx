import {
  type HCAAtlasTrackerActiveUser,
  ROLE,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { TEST_THEME } from "@/testing/theme";
import { responseWithText } from "@/testing/utils";

jest.mock("@/app/hooks/UseCreateApiToken/hook", () => ({
  useCreateApiToken: jest.fn(),
}));
jest.mock("copy-to-clipboard", () => jest.fn(() => true));

import { ApiTokenForm } from "@/app/components/Forms/components/ApiToken/apiToken";
import { UNREADABLE_API_TOKEN_MESSAGE } from "@/app/hooks/UseCreateApiToken/constants";
import { type UseCreateApiToken } from "@/app/hooks/UseCreateApiToken/entities";
import { useCreateApiToken } from "@/app/hooks/UseCreateApiToken/hook";
import { parseIssuedApiToken } from "@/app/hooks/UseCreateApiToken/utils";
import { AuthorizationContext } from "@/app/providers/authorization";
import { ThemeProvider } from "@mui/material";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import copy from "copy-to-clipboard";

const mockUseCreateApiToken = useCreateApiToken as jest.MockedFunction<
  typeof useCreateApiToken
>;
const mockCopy = copy as jest.MockedFunction<typeof copy>;

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

const NO_ACCESS_TEXT = "You do not have access to this feature.";
const NOT_ENABLED_TEXT = "API tokens are not enabled for your account.";

beforeEach(() => {
  mockUseCreateApiToken.mockReturnValue(hookResult());
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("ApiTokenForm", () => {
  it("renders nothing before the active user is known", () => {
    const { container } = renderForm(undefined);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the no-access state to a stakeholder, even with the flag", () => {
    renderForm({ ...CONTENT_ADMIN_ISSUER, role: ROLE.STAKEHOLDER });
    expect(screen.getByText(NO_ACCESS_TEXT)).toBeInTheDocument();
    expect(screen.queryByText("Create token")).not.toBeInTheDocument();
  });

  it("shows the no-access state to a disabled content admin", () => {
    renderForm({ ...CONTENT_ADMIN_ISSUER, disabled: true });
    expect(screen.getByText(NO_ACCESS_TEXT)).toBeInTheDocument();
    expect(screen.queryByText("Create token")).not.toBeInTheDocument();
  });

  it("explains a missing flag to a content admin without it", () => {
    renderForm({ ...CONTENT_ADMIN_ISSUER, canIssueApiTokens: false });
    expect(screen.getByText(NOT_ENABLED_TEXT)).toBeInTheDocument();
    expect(screen.queryByText("Create token")).not.toBeInTheDocument();
  });

  it("offers to create a token to a content admin with the flag", () => {
    const onCreate = jest.fn(async () => true);
    mockUseCreateApiToken.mockReturnValue(hookResult({ onCreate }));
    renderForm(CONTENT_ADMIN_ISSUER);
    expect(screen.queryByLabelText("API token")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Create token"));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("disables the create button while the request is in flight", () => {
    mockUseCreateApiToken.mockReturnValue(hookResult({ isRequesting: true }));
    renderForm(CONTENT_ADMIN_ISSUER);
    expect(screen.getByText("Create token").closest("button")).toBeDisabled();
  });

  it("shows a created token with its expiry and the show-once warning", () => {
    mockUseCreateApiToken.mockReturnValue(
      hookResult({
        issuedToken: { expires: TEST_EXPIRES, token: TEST_TOKEN },
      }),
    );
    renderForm(CONTENT_ADMIN_ISSUER);
    const field = screen.getByLabelText("API token");
    expect(field).toHaveValue(TEST_TOKEN);
    expect(field).toHaveAttribute("readonly");
    expect(
      screen.getByText("Expires 2026-11-05 12:34:56 (UTC)"),
    ).toBeInTheDocument();
    expect(screen.getByText(/won.t be shown again/)).toBeInTheDocument();
    expect(screen.getByText("HCA_TRACKER_API_TOKEN")).toBeInTheDocument();
  });

  it("copies the token", () => {
    mockUseCreateApiToken.mockReturnValue(
      hookResult({
        issuedToken: { expires: TEST_EXPIRES, token: TEST_TOKEN },
      }),
    );
    renderForm(CONTENT_ADMIN_ISSUER);
    fireEvent.click(screen.getByText("Copy"));
    expect(mockCopy).toHaveBeenCalledWith(TEST_TOKEN);
    expect(screen.getByText("Copied")).toBeInTheDocument();
  });
});

describe("parseIssuedApiToken", () => {
  it("parses a body with a token and expiry", async () => {
    expect(
      await parseIssuedApiToken(
        responseWithText(
          JSON.stringify({ expires: TEST_EXPIRES, token: TEST_TOKEN }),
        ),
      ),
    ).toEqual({ expires: TEST_EXPIRES, token: TEST_TOKEN });
  });

  it.each([
    ["an empty body", ""],
    ["a body that isn't JSON", "<html>"],
    ["a body without a token", JSON.stringify({ expires: TEST_EXPIRES })],
    ["a body without an expiry", JSON.stringify({ token: TEST_TOKEN })],
    [
      "a body with an empty token",
      JSON.stringify({ expires: TEST_EXPIRES, token: "" }),
    ],
  ])("rejects %s", async (_, text) => {
    await expect(parseIssuedApiToken(responseWithText(text))).rejects.toThrow(
      UNREADABLE_API_TOKEN_MESSAGE,
    );
  });
});

/**
 * Build a `useCreateApiToken` result with no token issued yet.
 * @param overrides - Fields to override.
 * @returns Mock hook result.
 */
function hookResult(
  overrides: Partial<UseCreateApiToken> = {},
): UseCreateApiToken {
  return {
    isRequesting: false,
    issuedToken: undefined,
    onCreate: jest.fn(async () => true),
    ...overrides,
  };
}

/**
 * Render the API token form for the given active user, within the app theme.
 * @param user - Active user, or undefined if not yet known.
 * @returns Render result.
 */
function renderForm(
  user: HCAAtlasTrackerActiveUser | undefined,
): ReturnType<typeof render> {
  return render(
    <ThemeProvider theme={TEST_THEME}>
      <AuthorizationContext.Provider value={{ user }}>
        <ApiTokenForm />
      </AuthorizationContext.Provider>
    </ThemeProvider>,
  );
}
