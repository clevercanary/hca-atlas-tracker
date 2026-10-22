import { StyledSnackbarContent } from "@/app/components/common/Snackbar/components/SnackbarStack/snackbarContent.styles";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";

export const StyledErrorContent = styled(StyledSnackbarContent)`
  background-color: ${PALETTE.ALERT_MAIN};
`;
