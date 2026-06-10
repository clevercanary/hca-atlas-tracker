import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import {
  bpDownMd,
  bpDownSm,
} from "@databiosphere/findable-ui/lib/styles/common/mixins/breakpoints";
import { LoginView } from "@databiosphere/findable-ui/lib/views/LoginView/loginView";
import styled from "@emotion/styled";
import { Stack } from "@mui/material";

export const StyledSection = styled.section`
  align-items: center;
  align-self: stretch;
  background-image: url("/landing/hca-cell.webp");
  background-position: center;
  background-size: cover;
  display: flex;
  flex: 1;
  gap: 72px;
  justify-content: center;
  padding: 24px 16px;

  ${bpDownMd} {
    gap: 32px;
  }

  ${bpDownSm} {
    flex-direction: column-reverse;
  }
`;

export const StyledLoginView = styled(LoginView)`
  display: flex;
  flex: 1;
  margin: 0;
  max-width: unset;
  padding: 0;

  > .MuiPaper-root {
    align-self: flex-end;
    max-width: 400px;
  }
`;

export const StyledStack = styled(Stack)`
  color: ${PALETTE.COMMON_WHITE};
  flex: 1;

  ${bpDownSm} {
    justify-content: flex-end;
  }

  h1 {
    font-family: "DIN Alternate", sans-serif;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    line-height: 34px;
    letter-spacing: -0.4px;
  }

  h2 {
    font-family: "DIN Alternate", sans-serif;
    font-size: 40px;
    font-style: normal;
    font-weight: 700;
    line-height: 48px;
    max-width: 366px;
    letter-spacing: -0.4px;
  }
`;
